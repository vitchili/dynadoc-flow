<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\BaseDTO;

final class StoreSectionInputDTO extends BaseDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $description,
        public readonly string $templateId,
        public readonly string $htmlContent
    ) {
    }
}
