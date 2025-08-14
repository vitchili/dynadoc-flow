<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\Events\TemplateRequestedEvent;
use App\Application\DTOs\StoreFileInputDTO;
use App\Domain\Entities\File;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;

final readonly class StoreFileHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository
    ) {
    }

    public function execute(StoreFileInputDTO $input): string
    {
        $fileId = $this->fileRepository->insert(File::create(
            name: $input->name,
            templateId: $input->templateId,
            userId: app(LoggedUserHelper::class)->userId(),
            payload: json_encode($input->payload),
        ));

        event(new TemplateRequestedEvent($input->templateId));
     
        return $fileId;
    }
}
