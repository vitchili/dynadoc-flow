<?php
declare(strict_types = 1);

namespace App\Domain\Entities;

use App\Application\DTOs\BaseDTO;
use App\Domain\Enums\TagTypeEnum;
use \DateTimeImmutable;
use Illuminate\Support\Str;

final class Tag extends BaseDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $description,
        public TagTypeEnum $type,
        public string $contextId
    ) {
    }

    public static function create(
        string $name,
        string $description,
        TagTypeEnum $type,
        string $contextId,
    ): self
    {
        return new self(
            id: Str::orderedUuid()->toString(),
            name: $name,
            description: $description,
            type: $type,
            contextId: $contextId
        );
    }

    public static function restore(
        string $id,
        string $name,
        string $description,
        TagTypeEnum $type,
        string $contextId
    ): self
    {
        return new self(
            id: $id,
            name: $name,
            description: $description,
            type: $type,
            contextId: $contextId
        );
    }

    public function update(
        ?string $name,
        ?string $description,
        ?TagTypeEnum $type,
        ?string $contextId,
    ): self
    {
        return new self(
            id: $this->id,
            name: $name ?? $this->name,
            description: $description ?? $this->description,
            type: $type ?? $this->type,
            contextId: $contextId ?? $this->contextId
        );
    }
}
