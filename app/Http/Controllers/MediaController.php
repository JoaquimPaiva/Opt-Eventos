<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    public function show(string $path): StreamedResponse|Response
    {
        $normalized = str_replace('\\', '/', ltrim($path, '/'));

        if ($normalized === '' || str_contains($normalized, '..')) {
            abort(404);
        }

        if (! Storage::disk('public')->exists($normalized)) {
            abort(404);
        }

        return Storage::disk('public')->response($normalized, null, [
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}

