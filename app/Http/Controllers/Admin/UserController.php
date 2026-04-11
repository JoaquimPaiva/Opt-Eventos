<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->with('hotel:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nationality' => $user->nationality,
                'nif' => $user->nif,
                'role' => $user->role,
                'hotel_id' => $user->hotel_id,
                'hotel_name' => $user->hotel?->name,
                'created_at' => $user->created_at?->toDateTimeString(),
            ])
            ->values();

        $hotels = Hotel::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'name' => $hotel->name,
            ])
            ->values();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'hotels' => $hotels,
            'filters' => [
                'search' => $search,
            ],
            'current_admin_id' => $request->user()?->id,
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $targetRole = (string) $request->validated('role');
        $targetHotelId = $request->validated('hotel_id');
        $actor = $request->user();

        if ($actor !== null && $actor->id === $user->id && $targetRole !== 'ADMIN') {
            return back()->with('success', 'Não podes remover o teu próprio perfil de administrador.');
        }

        $user->update([
            'role' => $targetRole,
            'hotel_id' => $targetRole === 'HOTEL' ? $targetHotelId : null,
        ]);

        return back()->with('success', "Função do utilizador {$user->email} atualizada para {$targetRole}.");
    }
}
