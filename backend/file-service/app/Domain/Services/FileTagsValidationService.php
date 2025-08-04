<?php

namespace App\Domain\Services;

use Illuminate\Support\Collection;

class FileTagsValidationService
{
    public static function validate(Collection $sections, array $payload): array
    {
        $templateTags = [];

        foreach ($sections as $section) {
            preg_match_all('/#([A-Z_]+)#/', $section->htmlContent, $matches);
            $templateTags = array_merge($templateTags, $matches[0]);
        }

        $templateTags = array_unique($templateTags);

        $payloadTags = array_keys($payload);

        $errors = [];

        foreach ($templateTags as $tag) {
            if (! in_array($tag, $payloadTags)) {
                $errors[] = "A tag '{$tag}' é necessária no payload.";
            }
        }

        return $errors;
    }
}
