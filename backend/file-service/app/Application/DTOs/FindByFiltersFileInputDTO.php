<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\BaseDTO;
use App\Domain\Enums\FileStatusEnum;

final class FindByFiltersFileInputDTO extends BaseDTO
{
    public function __construct(
        public readonly ?string $id,
        public readonly ?string $name,
        public readonly ?string $templateId,
        public readonly ?string $userId,
        public readonly ?string $path,
        public readonly ?bool $readyToDownload,
        public readonly ?FileStatusEnum $status,
        public readonly ?string $errors,
    ) {
    }
}
