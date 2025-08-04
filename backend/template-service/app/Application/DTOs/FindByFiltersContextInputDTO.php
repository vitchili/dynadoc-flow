<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;

final class FindByFiltersContextInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $id,
        public readonly ?string $name,
        public readonly ?string $description,
        public readonly ?string $companyId
    ) {
    }
}
