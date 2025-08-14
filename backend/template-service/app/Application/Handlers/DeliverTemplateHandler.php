<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\TemplateSectionsOutputDTO;
use App\Application\Events\TemplateDeliveredEvent;
use App\Domain\Entities\Section;
use App\Domain\Entities\Template;
use App\Domain\Repositories\SectionRepositoryInterface;
use App\Domain\Repositories\TemplateRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DeliverTemplateHandler
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository,
        private SectionRepositoryInterface $sectionRepository,
    ) {
    }

    public function execute(string $templateId): TemplateSectionsOutputDTO
    {
        $template = $this->getTemplate($templateId);

        $sections = $this->getSections($template->id); 

        $output = new TemplateSectionsOutputDTO(
            template: $template,
            sections: collect($sections)
        );

        event(new TemplateDeliveredEvent($output));

        return $output;
    }

    private function getTemplate(string $templateId): Template
    {
        $template = $this->templateRepository->findFirstUsingFilters([
            'id' => $templateId
        ]);

        if (! $template) {
            throw new NotFoundHttpException('Template ID not found');
        }

        return $template;
    }

    private function getSections(string $templateId): array
    {
        $sectionsData = $this->sectionRepository->findAllUsingFilters([
            'templateId' => $templateId
        ]);

        if (empty($sectionsData)) {
            throw new NotFoundHttpException('Template has not sections');
        }

        $sections = [];

        foreach ($sectionsData as $section) {
            $sections[] = Section::restore(
                id: $section->id,
                name: $section->name,
                description: $section->description,
                templateId: $section->template_id,
                htmlContent: $section->html_content,
                sectionOrder: $section->section_order,
            );
        }

        return $sections;
    }
}
