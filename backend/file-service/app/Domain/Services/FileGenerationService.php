<?php

namespace App\Domain\Services;

use Dompdf\Dompdf;
use Dompdf\Options;

class FileGenerationService
{
    protected Dompdf $pdf;

    public function __construct()
    {
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Arial');
        $this->pdf = new Dompdf($options);
    }

    public function generate(string $fileName, string $htmlContent): string
    {
        $uniqidFileName = $fileName . '_' . uniqid() . '.pdf';
        $outputPath = storage_path('app/public/tmp/' . $uniqidFileName);

        $htmlContent = mb_convert_encoding($htmlContent, 'HTML-ENTITIES', 'UTF-8');

        $this->pdf->loadHtml($htmlContent);

        $this->pdf->setPaper('A4', 'portrait');

        $this->pdf->render();

        file_put_contents($outputPath, $this->pdf->output());

        $this->pdf->stream($uniqidFileName);

        return $uniqidFileName;
    }
}
