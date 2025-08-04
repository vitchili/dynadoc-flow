<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\AbstractDTO;
use App\Domain\Entities\Template;
use App\Domain\Entities\Section;
use Illuminate\Support\Collection;

final class TemplateSectionsOutputDTO extends AbstractDTO
{
    /**
     * @param Template $template
     * @param Collection<Section> $sections
     */
    public function __construct(
        public readonly Template $template,
        public readonly Collection $sections
    ) {
    }
}
