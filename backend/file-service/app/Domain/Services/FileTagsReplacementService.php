<?php

namespace App\Domain\Services;

use Illuminate\Support\Collection;

class FileTagsReplacementService
{
    public static function replace(Collection $sections, array $payload): string
    {
        $completedHtml = '';

        foreach ($sections as $section) {
            $completedHtml .= str_replace(array_keys($payload), array_values($payload), $section->htmlContent); 
        }

       return $completedHtml;
    }
}
