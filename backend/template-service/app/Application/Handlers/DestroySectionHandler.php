<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use App\Domain\Repositories\SectionRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class DestroySectionHandler
{
    public function __construct(
        private SectionRepositoryInterface $sectionRepository
    ) {
    }

    public function execute(string $id): bool
    {
        $section = $this->sectionRepository->findOneById($id);

        if (! $section) {
            throw new NotFoundHttpException('Section ID not found');
        }

        return $this->sectionRepository->delete($section->id);
    }
}
