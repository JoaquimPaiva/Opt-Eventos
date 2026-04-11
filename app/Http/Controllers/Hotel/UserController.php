<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hotel\StoreHotelUserRequest;
use App\Http\Requests\Hotel\UpdateHotelUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'A conta de hotel não está associada a nenhum hotel.');
        }

        $users = User::query()
            ->where('role', 'HOTEL')
            ->where('hotel_id', $hotelId)
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at?->toDateTimeString(),
                'can_delete' => (int) $user->id !== (int) $request->user()?->id,
            ])
            ->values();

        return Inertia::render('Hotel/Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(StoreHotelUserRequest $request): RedirectResponse
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'A conta de hotel não está associada a nenhum hotel.');
        }

        $validated = $request->validated();

        User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'HOTEL',
            'hotel_id' => $hotelId,
        ]);

        return back()->with('success', 'Utilizador do hotel criado com sucesso.');
    }

    public function update(UpdateHotelUserRequest $request, User $user): RedirectResponse
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'A conta de hotel não está associada a nenhum hotel.');
        }

        if ($user->role !== 'HOTEL' || (int) $user->hotel_id !== (int) $hotelId) {
            abort(403, 'Só podes gerir utilizadores associados ao teu hotel.');
        }

        $validated = $request->validated();
        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        return back()->with('success', 'Utilizador atualizado com sucesso.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $hotelId = $request->user()?->hotel_id;
        if ($hotelId === null) {
            abort(403, 'A conta de hotel não está associada a nenhum hotel.');
        }

        if ($user->role !== 'HOTEL' || (int) $user->hotel_id !== (int) $hotelId) {
            abort(403, 'Só podes gerir utilizadores associados ao teu hotel.');
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            return back()->withErrors([
                'user' => 'Não podes apagar a tua própria conta.',
            ]);
        }

        $user->delete();

        return back()->with('success', 'Utilizador removido com sucesso.');
    }
}
