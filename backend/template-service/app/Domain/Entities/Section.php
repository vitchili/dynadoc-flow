<?php
declare(strict_types = 1);

namespace App\Domain\Entities;

use App\Application\DTOs\BaseDTO;
use \DateTimeImmutable;
use Illuminate\Support\Str;

final class Section extends BaseDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $description,
        public string $templateId,
        public string $htmlContent,
        public int $sectionOrder
    ) {
    }

    public static function create(
        string $name,
        string $description,
        string $templateId,
        string $htmlContent,
        int $sectionOrder
    ): self
    {
        return new self(
            id: Str::orderedUuid()->toString(),
            name: $name,
            description: $description,
            templateId: $templateId,
            htmlContent: $htmlContent,
            sectionOrder: $sectionOrder
        );
    }

    public static function restore(
        string $id,
        string $name,
        string $description,
        string $templateId,
        string $htmlContent,
        int $sectionOrder
    ): self
    {
        return new self(
            id: $id,
            name: $name,
            description: $description,
            templateId: $templateId,
            htmlContent: $htmlContent,
            sectionOrder: $sectionOrder
        );
    }

    public function update(
        ?string $name,
        ?string $description,
        ?string $htmlContent,
        ?int $sectionOrder
    ): self
    {
        return new self(
            id: $this->id,
            name: $name ?? $this->name,
            description: $description ?? $this->description,
            templateId: $this->templateId,
            htmlContent: $htmlContent ?? $this->htmlContent,
            sectionOrder: $sectionOrder ?? $this->sectionOrder
        );
    }
}
