<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\BaseDTO;

final class UpdateTemplateInputDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $description
    ) {
    }
}
