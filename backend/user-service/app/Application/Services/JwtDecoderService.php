<?php

namespace App\Application\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JwtDecoderService
{
    public function decode(string $token): ?array
    {
        try {
            $publicKey = file_get_contents(base_path(env('JWT_PUBLIC_KEY_PATH')));

            $decoded = JWT::decode($token, new Key($publicKey, env('JWT_ALGORITHM', 'RS256')));

            return (array) $decoded;
        } catch (Exception $e) {
            logger()->warning('JWT inválido: ' . $e->getMessage());
            return null;
        }
    }
}