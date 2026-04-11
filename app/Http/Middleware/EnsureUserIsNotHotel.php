<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotHotel
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role === 'HOTEL') {
            abort(403, 'Esta funcionalidade não está disponível para contas de hotel.');
        }

        return $next($request);
    }
}
