<?php

namespace App\Domain\Services;

use Knp\Snappy\Pdf;

class FileGenerationService
{
    public function __construct(protected Pdf $pdf) {}

    public function generate(string $fileName, string $htmlContent): string
    {
        $options = [
            'page-size'    => 'A4',
            'orientation'  => 'Portrait',
            'margin-top'   => 10,
            'margin-right' => 10,
            'margin-bottom'=> 10,
            'margin-left'  => 10,
        ];

        $this->pdf->setOptions($options);

        $uniqidFileName = $fileName . '_' . uniqid() . '.pdf';
        $outputPath = storage_path('app/public/tmp/' . $uniqidFileName);

        $htmlContent = mb_convert_encoding($htmlContent, 'HTML-ENTITIES', 'UTF-8');

        $this->pdf->generateFromHtml($htmlContent, $outputPath);

        return $uniqidFileName;
    }
}
