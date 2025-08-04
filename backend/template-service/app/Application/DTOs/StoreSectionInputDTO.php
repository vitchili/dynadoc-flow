<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;

final class StoreSectionInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $description,
        public readonly string $templateId,
        public readonly string $htmlContent
    ) {
    }
}
