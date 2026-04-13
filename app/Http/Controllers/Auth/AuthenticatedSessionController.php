<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Mail\AdminTwoFactorCodeMail;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    private const ADMIN_2FA_SESSION_KEY = 'auth.admin_2fa';

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        /** @var User $user */
        $user = $request->user();
        if ($user->role === 'ADMIN') {
            $this->startAdminTwoFactorChallenge(
                request: $request,
                user: $user,
                remember: $request->boolean('remember'),
            );

            Auth::guard('web')->logout();

            return redirect()->route('admin.2fa.challenge');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function adminTwoFactorChallenge(Request $request): Response|RedirectResponse
    {
        $challenge = $this->getAdminTwoFactorChallenge($request);
        if ($challenge === null) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/AdminTwoFactorChallenge', [
            'status' => session('status'),
            'email' => (string) ($challenge['email'] ?? ''),
            'expiresAt' => CarbonImmutable::createFromTimestamp((int) $challenge['expires_at'])
                ->toIso8601String(),
        ]);
    }

    public function verifyAdminTwoFactor(Request $request): RedirectResponse
    {
        $challenge = $this->getAdminTwoFactorChallenge($request);
        if ($challenge === null) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $verifyThrottleKey = sprintf(
            'admin-2fa:verify:%s|%s',
            (string) $challenge['user_id'],
            (string) $request->ip(),
        );
        if (RateLimiter::tooManyAttempts($verifyThrottleKey, 5)) {
            $seconds = RateLimiter::availableIn($verifyThrottleKey);
            throw ValidationException::withMessages([
                'code' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => (int) ceil($seconds / 60),
                ]),
            ]);
        }

        if ((int) $challenge['expires_at'] < time()) {
            $request->session()->forget(self::ADMIN_2FA_SESSION_KEY);
            throw ValidationException::withMessages([
                'code' => 'O código expirou. Pede um novo código para continuar.',
            ]);
        }

        $expectedHash = (string) ($challenge['code_hash'] ?? '');
        $providedHash = hash('sha256', (string) $request->string('code'));
        if (!hash_equals($expectedHash, $providedHash)) {
            RateLimiter::hit($verifyThrottleKey, 600);
            throw ValidationException::withMessages([
                'code' => 'Código inválido. Confirma e tenta novamente.',
            ]);
        }

        RateLimiter::clear($verifyThrottleKey);

        Auth::guard('web')->loginUsingId(
            (int) $challenge['user_id'],
            (bool) ($challenge['remember'] ?? false),
        );

        $request->session()->forget(self::ADMIN_2FA_SESSION_KEY);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function resendAdminTwoFactor(Request $request): RedirectResponse
    {
        $challenge = $this->getAdminTwoFactorChallenge($request);
        if ($challenge === null) {
            return redirect()->route('login');
        }

        $resendThrottleKey = sprintf(
            'admin-2fa:resend:%s|%s',
            (string) $challenge['user_id'],
            (string) $request->ip(),
        );

        if (RateLimiter::tooManyAttempts($resendThrottleKey, 3)) {
            $seconds = RateLimiter::availableIn($resendThrottleKey);
            throw ValidationException::withMessages([
                'code' => "Aguarda {$seconds}s antes de pedir novo código.",
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find((int) $challenge['user_id']);
        if (!$user instanceof User) {
            $request->session()->forget(self::ADMIN_2FA_SESSION_KEY);
            return redirect()->route('login');
        }

        $this->startAdminTwoFactorChallenge(
            request: $request,
            user: $user,
            remember: (bool) ($challenge['remember'] ?? false),
        );
        RateLimiter::hit($resendThrottleKey, 300);

        return back()->with('status', 'Novo código enviado para o teu email.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function startAdminTwoFactorChallenge(Request $request, User $user, bool $remember): void
    {
        if (!filled($user->email)) {
            throw ValidationException::withMessages([
                'email' => 'Conta de administrador sem email válido para 2FA.',
            ]);
        }

        $code = (string) random_int(100000, 999999);

        $request->session()->put(self::ADMIN_2FA_SESSION_KEY, [
            'user_id' => $user->id,
            'email' => (string) $user->email,
            'code_hash' => hash('sha256', $code),
            'expires_at' => now()->addMinutes(10)->getTimestamp(),
            'remember' => $remember,
        ]);

        try {
            Mail::to((string) $user->email)->send(
                new AdminTwoFactorCodeMail(
                    name: (string) $user->name,
                    code: $code,
                ),
            );
        } catch (Throwable) {
            $request->session()->forget(self::ADMIN_2FA_SESSION_KEY);

            throw ValidationException::withMessages([
                'email' => 'Não foi possível enviar o código de verificação. Tenta novamente em instantes.',
            ]);
        }
    }

    private function getAdminTwoFactorChallenge(Request $request): ?array
    {
        $challenge = $request->session()->get(self::ADMIN_2FA_SESSION_KEY);

        return is_array($challenge) ? $challenge : null;
    }
}
