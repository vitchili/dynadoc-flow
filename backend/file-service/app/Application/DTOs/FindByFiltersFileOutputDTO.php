<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;

final class FindByFiltersFileOutputDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $templateId,
        public readonly string $userId,
        public readonly string $createdAt,
        public readonly string $templateName,
    ) {
    }
}
