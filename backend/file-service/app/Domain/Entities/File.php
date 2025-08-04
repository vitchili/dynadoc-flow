<?php
declare(strict_types = 1);

namespace App\Domain\Entities;

use App\Application\DTOs\AbstractDTO;
use App\Domain\Enums\FileStatusEnum;
use \DateTimeImmutable;
use Illuminate\Support\Str;

final class File extends AbstractDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $templateId,
        public string $userId,
        public string $payload,
        public string|null $path,
        public bool $readyToDownload,
        public FileStatusEnum $status,
        public DateTimeImmutable $createdAt,
        public DateTimeImmutable $updatedAt,
    ) {
    }

    public static function create(
        string $name,
        string $templateId,
        string $userId,
        string $payload,
    ): self
    {
        return new self(
            id: Str::orderedUuid()->toString(),
            name: $name,
            templateId: $templateId,
            userId: $userId,
            payload: $payload,
            path: null,
            readyToDownload: false,
            status: FileStatusEnum::PROCESSING,
            createdAt: new DateTimeImmutable(),
            updatedAt: new DateTimeImmutable()
        );
    }

    public static function restore(
        string $id,
        string $name,
        string $templateId,
        string $userId,
        string $payload,
        string $path,
        bool   $readyToDownload,
        FileStatusEnum $status,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
    ): self
    {
        return new self(
            id: $id,
            name: $name,
            templateId: $templateId,
            userId: $userId,
            payload: $payload,
            path: $path,
            readyToDownload: $readyToDownload,
            status: $status,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
        );
    }

    public function update(
        ?string $name,
        ?string $payload,
        ?string $path,
        ?string $readyToDownload,
        ?string $status,
    ): self
    {
        return new self(
            id: $this->id,
            name: $name ?? $this->name,
            templateId: $this->templateId,
            userId: $this->userId,
            payload: $payload ?? $this->payload,
            path: $path ?? $this->path,
            readyToDownload: $readyToDownload ?? $this->readyToDownload,
            status: $status ?? $this->status,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
        );
    }
}
