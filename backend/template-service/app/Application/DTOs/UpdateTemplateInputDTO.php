<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;

final class UpdateTemplateInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $description
    ) {
    }
}
