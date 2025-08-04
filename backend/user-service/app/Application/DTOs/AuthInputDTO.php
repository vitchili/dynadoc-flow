<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

final class AuthInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password
    ) {
    }
}
