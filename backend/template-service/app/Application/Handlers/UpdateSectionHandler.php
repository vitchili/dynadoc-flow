<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\UpdateSectionInputDTO;
use App\Domain\Entities\Section;
use App\Domain\Repositories\SectionRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class UpdateSectionHandler
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {
    }

    public function execute(string $id, UpdateSectionInputDTO $input): bool
    {
        $section = $this->sectionRepository->findOneById($id);

        if (! $section) {
            throw new NotFoundHttpException('Section ID not found');
        }

        $updatedSection = $this->updateSection($input, $section);

        if ($updatedSection && $section->sectionOrder !== $input->sectionOrder) {
            $this->reorderSections($section->templateId);
        }

        return $updatedSection;
    }

    private function updateSection(UpdateSectionInputDTO $input, Section $section): bool
    {
        $updatedSection = $section->update(
            name: $input->name ?? $section->name,
            description: $input->description ?? $section->description,
            htmlContent: $input->htmlContent ?? $section->htmlContent,
            sectionOrder: $input->sectionOrder ?? $section->sectionOrder
        );

        return $this->sectionRepository->update($updatedSection);
    }
    
    private function reorderSections(string $templateId): bool
    {
        return true;
        // 1 - Search all sections by template_id filter.
        // 2 - Calculete reorder position of each one of them
        // 3 - Call update in each one of them.
    }
}
