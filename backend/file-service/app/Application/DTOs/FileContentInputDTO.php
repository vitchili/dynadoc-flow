<?php
declare(strict_types = 1);

namespace App\Application\DTOs;

use App\Application\DTOs\BaseDTO;
use Illuminate\Support\Collection;

final class FileContentInputDTO extends BaseDTO
{
    /**
     * @param object $template
     * @param Collection<object> $sections
     */
    public function __construct(
        public readonly object $template,
        public readonly Collection $sections
    ) {
    }
}
