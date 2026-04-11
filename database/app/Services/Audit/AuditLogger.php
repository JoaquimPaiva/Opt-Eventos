<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function log(
        string $action,
        ?User $actor = null,
        ?string $auditableType = null,
        ?string $auditableId = null,
        array $metadata = [],
        ?Request $request = null
    ): void {
        AuditLog::query()->create([
            'user_id' => $actor?->id,
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
