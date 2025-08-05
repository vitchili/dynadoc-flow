<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FileContentInputDTO;
use App\Domain\Entities\File;
use App\Domain\Enums\FileStatusEnum;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Domain\Services\FileGenerationService;
use App\Domain\Services\FileStorageService;
use App\Domain\Services\FileTagsReplacementService;
use App\Domain\Services\FileTagsValidationService;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class FileGenerationHandler
{
    public const TRANSACTION_ATTEMPTS = 3;

    public function __construct(
        private FileRepositoryInterface $fileRepository,
        private FileGenerationService $fileGeneration,
        private FileStorageService $fileStorage,
    ) {
    }

    public function execute(FileContentInputDTO $input): void
    {
        $files = $this->fileRepository->findAllUsingFilters([
            'templateId' => $input->template->id,
            'readyToDownload' => false,
            'errors' => null
        ]);

        foreach ($files as $file) {
            try {
                DB::transaction(function () use ($file, $input) {
                    $payloadArray = json_decode($file->payload, true);

                    $errorMessages = FileTagsValidationService::validate($input->sections, $payloadArray);
                    if ($errorMessages) {
                        $this->setErrorFile($file, $errorMessages);
                        return;
                    }

                    $htmlContent = FileTagsReplacementService::replace($input->sections, $payloadArray);

                    $uniqidFileName = $this->fileGeneration->generate($input->template->name, $htmlContent);

                    $path = $this->fileStorage->upload($uniqidFileName);

                    $this->setSuccessFileUploaded($file, $path);
                }, self::TRANSACTION_ATTEMPTS);
            } catch (Throwable $e) {
                logger()->error("Erro ao processar arquivo {$file->id}: {$e->getMessage()}", [
                    'exception' => $e,
                    'file_id' => $file->id
                ]);

                continue;
            }
        }
    }

    private function setErrorFile(File $file, array $errorMessages): void
    {
        $this->updateFile($file, [
            'readyToDownload' => false,
            'status' => FileStatusEnum::ERROR,
            'errors' => json_encode($errorMessages),
        ]);
    }

    private function setSuccessFileUploaded(File $file, string $path): void
    {
        $this->updateFile($file, [
            'path' => $path,
            'readyToDownload' => true,
            'status' => FileStatusEnum::READY,
        ]);
    }

    private function updateFile(File $file, array $attributes): void
    {
        $updatedFile = $file->update(...$attributes);
        $this->fileRepository->update($updatedFile);
    }
}
