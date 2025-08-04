<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;
use App\Domain\Enums\TagTypeEnum;

final class FindByFiltersTagInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $id,
        public readonly ?string $name,
        public readonly ?string $description,
        public readonly ?TagTypeEnum $type,
        public readonly ?string $contextId,
    ) {
    }
}
