<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\FindByFiltersSectionInputDTO;
use App\Domain\Entities\Section;
use App\Domain\Repositories\SectionRepositoryInterface;

final readonly class FindByFiltersSectionHandler
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {
    }

    public function execute(FindByFiltersSectionInputDTO $input): array
    {
        $sectionData = $this->sectionRepository->findAllUsingFilters($input->toArray());

        $outputDTO = [];

        foreach ($sectionData as $section) {
            $outputDTO[] = Section::restore(
                id: $section->id,
                name: $section->name,
                description: $section->description,
                templateId: $section->template_id,
                htmlContent: $section->html_content,
                sectionOrder: $section->sectionOrder
            );
        }

        return $outputDTO;
    }
}
