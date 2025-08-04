<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FileContentInputDTO;
use App\Domain\Exceptions\FileStorageException;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Domain\Services\FileTagsReplacementService;
use App\Domain\Services\FileTagsValidationService;

final readonly class FileGenerationHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository
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
                $errorMessages = FileTagsValidationService::validate($input->sections, json_decode($file->payload, true));

                if ($errorMessages) {
                    $this->setErrorFile($file->id, $errorMessages);
                }
                
                $htmlContent = FileTagsReplacementService::replace($input->sections, json_decode($file->payload, true));
                $binaryFile = FileGenerationService::generate($htmlContent);
                $path = FileStorageService::upload($binaryFile);

                $file->update(
                    path: $path,
                    readyToDownload: true
                );
            } catch (FileStorageException $e) {
                logger()->error($e->getMessage());
                continue;
            }
        }
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
