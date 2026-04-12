<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CookieConsentController extends Controller
{
    public function store(Request $request, AuditLogger $auditLogger): JsonResponse
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'max:50'],
            'accepted_at' => ['required', 'date'],
            'method' => ['required', 'string', 'in:all,necessary_only,custom'],
            'preferences' => ['required', 'array'],
            'preferences.necessary' => ['required', 'boolean'],
            'preferences.analytics' => ['required', 'boolean'],
            'preferences.personalization' => ['required', 'boolean'],
            'preferences.marketing' => ['required', 'boolean'],
        ]);

        $auditLogger->log(
            action: 'legal.cookie_consent.updated',
            actor: $request->user(),
            auditableType: null,
            auditableId: null,
            metadata: [
                'version' => (string) $validated['version'],
                'accepted_at' => (string) $validated['accepted_at'],
                'method' => (string) $validated['method'],
                'preferences' => $validated['preferences'],
            ],
            request: $request
        );

        return response()->json(['ok' => true], 201);
    }
}
