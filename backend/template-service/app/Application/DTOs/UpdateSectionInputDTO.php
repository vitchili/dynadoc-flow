<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\BaseDTO;

final class UpdateSectionInputDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $description,
        public readonly ?string $htmlContent,
        public readonly ?int $sectionOrder,
    ) {
    }
}
