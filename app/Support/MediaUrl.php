<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

final class MediaUrl
{
    public static function fromStoragePath(?string $path): ?string
    {
        if (! is_string($path) || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalized = ltrim($path, '/');
        if (str_starts_with($normalized, 'storage/')) {
            $normalized = ltrim(substr($normalized, strlen('storage/')), '/');
        }

        if ($normalized === '' || ! Storage::disk('public')->exists($normalized)) {
            return null;
        }

        return self::withBasePath('/storage/'.$normalized);
    }

    private static function withBasePath(string $path): string
    {
        $basePath = app()->runningInConsole() ? '' : request()->getBaseUrl();
        $normalizedBasePath = $basePath !== '' ? '/'.trim($basePath, '/') : '';

        return $normalizedBasePath.$path;
    }
}
