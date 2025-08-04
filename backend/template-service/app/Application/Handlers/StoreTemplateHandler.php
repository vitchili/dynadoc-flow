<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\StoreTemplateInputDTO;
use App\Domain\Entities\Template;
use App\Domain\Exceptions\DuplicatedEntityException;
use App\Domain\Repositories\TemplateRepositoryInterface;

final readonly class StoreTemplateHandler
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository
    ) {
    }

    public function execute(StoreTemplateInputDTO $input): string
    {
        $template = $this->hasExistingTemplate($input);

        if ($template) {
            throw new DuplicatedEntityException('There is already a template with these data');
        }

        return $this->insertTemplate($input);
    }

    private function hasExistingTemplate(StoreTemplateInputDTO $input): bool
    {
        return $this->templateRepository->exists([
            'name' => $input->name,
            'description' => $input->description,
            'company_id' => $input->companyId
        ]);
    }

    private function insertTemplate(StoreTemplateInputDTO $input): string
    {
        return $this->templateRepository->insert(Template::create(
            name: $input->name,
            description: $input->description,
            companyId: $input->companyId,
        ));
    }
}
