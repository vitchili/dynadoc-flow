<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\StoreSectionInputDTO;
use App\Domain\Entities\Section;
use App\Domain\Exceptions\DuplicatedEntityException;
use App\Domain\Repositories\SectionRepositoryInterface;

final readonly class StoreSectionHandler
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {
    }

    public function execute(StoreSectionInputDTO $input): string
    {
        $section = $this->hasExistingSection($input);

        if ($section) {
            throw new DuplicatedEntityException('There is already a section with these data');
        }

        //Verificar qual o ultimo order dentre os templateId enviado, e somar 1.

        return $this->insertSection($input);
    }

    private function hasExistingSection(StoreSectionInputDTO $input): bool
    {
        return $this->sectionRepository->exists([
            'name' => $input->name,
            'description' => $input->description,
        ]);
    }

    private function insertSection(StoreSectionInputDTO $input): string
    {
        return $this->sectionRepository->insert(Section::create(
            name: $input->name,
            description: $input->description,
            templateId: $input->templateId,
            htmlContent: $input->htmlContent,
            sectionOrder: /* calculo feito acima, inserir incremento aqui */ 1
        ));
    }
}
