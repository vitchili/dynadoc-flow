<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FileContentInputDTO;
use App\Domain\Entities\File;
use App\Domain\Enums\FileStatusEnum;
use App\Domain\Exceptions\FileStorageException;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Domain\Services\FileGenerationService;
use App\Domain\Services\FileTagsReplacementService;
use App\Domain\Services\FileTagsValidationService;
use Illuminate\Support\Facades\DB;

final readonly class FileGenerationHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository,
        private FileGenerationService $fileService
    ) {
    }

    public function execute(FileContentInputDTO $input): void
    {
        $files = $this->fileRepository->findAllUsingFilters([
            'templateId' => $input->template->id,
            'readyToDownload' => false,
            'errors' => null
        ]);
        logger()->info('0');

        foreach ($files as $file) {
            try {
                DB::beginTransaction();

                $errorMessages = FileTagsValidationService::validate($input->sections, json_decode($file->payload, true));

                if ($errorMessages) {
                    $this->setErrorFile($file, $errorMessages);
                }

                $htmlContent = FileTagsReplacementService::replace($input->sections, json_decode($file->payload, true));
                $path = $this->fileService->generate($input->template->name, $htmlContent);
                //$path = FileStorageService::upload($binaryFile);

                $this->setSuccessFileUploaded($file, $path);

                DB::commit();
            } catch (FileStorageException $e) {
                DB::rollBack();

                continue;
            }
        }
    }

    private function setErrorFile(File $file, array $errorMessages): void
    {
        $updatedFile = $file->update(
            readyToDownload: false,
            status: FileStatusEnum::ERROR,
            errors: json_encode($errorMessages)
        );

        $this->fileRepository->update($updatedFile);
    }

    private function setSuccessFileUploaded(File $file, string $path): bool
    {
        $uploadedFile = $file->update(
            path: $path,
            readyToDownload: true,
            status: FileStatusEnum::READY
        );

        return $this->fileRepository->update($uploadedFile);
    }
}

//     "data": {
//         "template": {
//             "id": "22222222-2222-2222-2222-222222222222",
//             "name": "Template 2",
//             "description": "Descri\u00e7\u00e3o do Template 2",
//             "companyId": "9d4e13c2-4b1a-4b02-9c38-90f487013f00"
//         },
//         "sections": [
//             {
//                 "id": "aaa22222-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
//                 "name": "Section 2.1",
//                 "description": "Descri\u00e7\u00e3o 2.1",
//                 "templateId": "22222222-2222-2222-2222-222222222222",
//                 "htmlContent": "<p>HTML 2.1<\/p>",
//                 "sectionOrder": 1
//             },
//             {
//                 "id": "aaa22222-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
//                 "name": "Section 2.2",
//                 "description": "Descri\u00e7\u00e3o 2.2",
//                 "templateId": "22222222-2222-2222-2222-222222222222",
//                 "htmlContent": "<p>HTML 2.2<\/p>",
//                 "sectionOrder": 2
//             }
//         ]
//     }
// }
