<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Application\DTOs\UpdateTemplateInputDTO;
use App\Domain\Entities\Template;
use App\Domain\Repositories\TemplateRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class UpdateTemplateHandler
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository
    ) {
    }

    public function execute(string $id, UpdateTemplateInputDTO $input): bool
    {
        $template = $this->templateRepository->findOneById($id);

        if (! $template) {
            throw new NotFoundHttpException('Template ID not found');
        }

        return $this->updateTemplate($input, $template);
    }

    private function updateTemplate(UpdateTemplateInputDTO $input, Template $template): bool
    {
        $updatedTemplate = $template->update(
            name: $input->name ?? $template->name,
            description: $input->description ?? $template->description
        );

        return $this->templateRepository->update($updatedTemplate);
    }
}
