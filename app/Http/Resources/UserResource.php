<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => $this->is_active,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()->all(), []),
            'direktorat_id' => $this->direktorat_id,
            'upt_id' => $this->upt_id,
            'direktorat' => $this->whenLoaded('direktorat', fn () => $this->direktorat ? [
                'id' => $this->direktorat->id,
                'name' => $this->direktorat->name,
            ] : null),
            'upt' => $this->whenLoaded('upt', fn () => $this->upt ? [
                'id' => $this->upt->id,
                'name' => $this->upt->name,
            ] : null),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
