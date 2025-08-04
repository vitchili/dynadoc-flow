<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\TemplateRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroyTemplateHandler
{
    public function __construct(
        private TemplateRepositoryInterface $templateRepository
    ) {
    }

    public function execute(string $id): bool
    {
        $template = $this->templateRepository->findOneById($id);

        if (! $template) {
            throw new NotFoundHttpException('Template ID not found');
        }

        return $this->templateRepository->delete($template->id);
    }
}
