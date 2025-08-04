<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersTemplateInputDTO;
use App\Application\Events\TemplateDeliveredEvent;
use App\Domain\Entities\Template;
use App\Domain\Repositories\TemplateRepositoryInterface;

final readonly class FindByFiltersTemplateHandler
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository
    ) {
    }

    public function execute(FindByFiltersTemplateInputDTO $input): array
    {
        $templateData = $this->templateRepository->findAllUsingFilters($input->toArray());

        $outputDTO = [];

        foreach ($templateData as $template) {
            $outputDTO[] = Template::restore(
                id: $template->id,
                name: $template->name,
                description: $template->description,
                companyId: $template->company_id
            );
        }

        return $outputDTO;
    }
}
