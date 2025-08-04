<?php

namespace App\Application\Services;

use Firebase\JWT\JWT;

class JwtService
{
    public function generateToken(array $payload): string
    {
        $privateKey = file_get_contents(base_path(config('app.jwt.private_key')));
        $ttl = now()->addSeconds((int) env('JWT_TTL', 3600))->timestamp;

        $basePayload = array_merge($payload, [
            'iss' => 'user-service',
            'iat' => time(),
            'exp' => $ttl,
        ]);

        return JWT::encode($basePayload, $privateKey, env('JWT_ALGORITHM', 'RS256'));
    }
}