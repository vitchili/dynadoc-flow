<?php
declare(strict_types = 1);

namespace App\Domain\Entities;

use App\Application\DTOs\AbstractDTO;
use \DateTimeImmutable;
use Illuminate\Support\Str;

final class Template extends AbstractDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $description,
        public string $companyId
    ) {
    }

    public static function create(
        string $name,
        string $description,
        string $companyId
    ): self
    {
        return new self(
            id: Str::orderedUuid()->toString(),
            name: $name,
            description: $description,
            companyId: $companyId
        );
    }

    public static function restore(
        string $id,
        string $name,
        string $description,
        string $companyId
    ): self
    {
        return new self(
            id: $id,
            name: $name,
            description: $description,
            companyId: $companyId
        );
    }

    public function update(
        ?string $name,
        ?string $description,
    ): self
    {
        return new self(
            id: $this->id,
            name: $name ?? $this->name,
            description: $description ?? $this->description,
            companyId: $this->companyId
        );
    }
}
