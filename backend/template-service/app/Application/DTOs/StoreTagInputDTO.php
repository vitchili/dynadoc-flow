<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;
use App\Domain\Enums\TagTypeEnum;
use Illuminate\Support\Str;

final class StoreTagInputDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $description,
        public readonly TagTypeEnum $type,
        public readonly string $contextId,
    ) {
        if (! Str::isUuid($contextId)) {
            throw new \InvalidArgumentException('Context ID is not an UUID.');
        }
    }
}
