<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersFileInputDTO;
use App\Application\DTOs\FindByFiltersFileOutputDTO;
use App\Application\Services\ApiGatewayService;
use App\Domain\Entities\File;
use App\Domain\Repositories\FileRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use Carbon\Carbon;

final readonly class FindByFiltersFileHandler
{
    public function __construct(
        private FileRepositoryInterface $fileRepository,
    ) {
    }

    public function execute(FindByFiltersFileInputDTO $input): array
    {
        $files = $this->fileRepository->findAllUsingFilters($input->toArray());

        $outputDTO = [];

        foreach ($files as $file) {
            $apiGateway = new ApiGatewayService(
                host: config('app.host_internal_services.template'),
                verb: 'get',
                route: '/templates/filters',
                filters: ['id' => $file->templateId],
            );

            $templateData = $apiGateway->call();

            if(! empty($templateData->json()['data'])) {
                $outputDTO[] = $this->createFileOutput($file, $templateData->json());
            }
        }

        return $outputDTO;
    }

    private function createFileOutput(File $file, array $template): FindByFiltersFileOutputDTO
    {
        $template = $template['data'][0];
        
        return new FindByFiltersFileOutputDTO(
            id: $file->id,
            templateId: $file->templateId,
            userId: app(LoggedUserHelper::class)->userId(),
            createdAt: Carbon::parse($file->createdAt)->format('Y-m-d h:i:s'),
            templateName: $template['name']
        );
    }
}
