<?php

namespace App\Domain\Services;

use Illuminate\Support\Collection;

class FileTagsReplacementService
{
    public static function replace(Collection $sections, array $payload): string
    {
        $htmlFinal = $sections->map(function ($section) use ($payload) {
            $htmlContent = $section['htmlContent'];
            
            foreach ($payload as $tag => $valor) {
                $htmlContent = str_replace($tag, $valor, $htmlContent);
            }

            return $htmlContent . "<div style='page-break-after: always;'></div>";
        })->implode('');

        return $htmlFinal;
    }
}
