<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsHotel
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'HOTEL') {
            abort(403, 'Não tens permissões para aceder à área de hotel.');
        }

        return $next($request);
    }
}
