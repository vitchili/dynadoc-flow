<?php

namespace App\Domain\Services;

use Knp\Snappy\Pdf;

class FileGenerationService
{
    public function __construct(protected Pdf $pdf) {}

    public function generate(string $filename, string $htmlContent): string
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

        $outputPath = storage_path('app/public/' . $filename . '_' . uniqid() . '.pdf');

        $this->pdf->generateFromHtml($htmlContent, $outputPath);

        return $outputPath;
    }
}
