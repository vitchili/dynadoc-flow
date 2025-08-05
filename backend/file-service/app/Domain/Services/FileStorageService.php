<?php

namespace App\Domain\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Exception;

class FileStorageService
{
    private string $tmpPath;

    public function __construct()
    {
        $this->tmpPath = storage_path('app/public/tmp');
    }

    public function upload(string $fileName, ?string $destinationPath = null): string
    {
        $localFile = $this->tmpPath . DIRECTORY_SEPARATOR . $fileName;

        if (!file_exists($localFile)) {
            throw new Exception("Arquivo não encontrado no diretório temporário: {$localFile}");
        }

        $destinationPath ??= $fileName;

        try {
            Storage::disk('s3')->put($destinationPath, file_get_contents($localFile));
            $this->deleteLocalFile($localFile);

            return $destinationPath;
        } catch (Exception $e) {
            logger()->error("Erro ao enviar arquivo para S3: " . $e->getMessage());
            throw new Exception("Erro ao enviar arquivo para S3");
        }
    }

    public function download(string $s3Path): string
    {
        try {
            if (!Storage::disk('s3')->exists($s3Path)) {
                throw new Exception("Arquivo não encontrado na S3: {$s3Path}");
            }

            return Storage::disk('s3')->get($s3Path);
        } catch (Exception $e) {
            logger()->error("Erro ao baixar arquivo da S3: " . $e->getMessage());
            throw new Exception("Erro ao baixar arquivo da S3");
        }
    }

    public function removeFromS3(string $s3Path): bool
    {
        try {
            if (!Storage::disk('s3')->exists($s3Path)) {
                throw new Exception("Arquivo não encontrado na S3: {$s3Path}");
            }

            return Storage::disk('s3')->delete($s3Path);
        } catch (Exception $e) {
            logger()->error("Erro ao remover arquivo da S3: " . $e->getMessage());
            throw new Exception("Erro ao remover arquivo da S3");
        }
    }

    public function deleteLocalFile(string $fullPath): bool
    {
        if (!file_exists($fullPath)) {
            throw new Exception("Arquivo local não encontrado: {$fullPath}");
        }

        try {
            return unlink($fullPath);
        } catch (Exception $e) {
            logger()->error("Erro ao apagar arquivo local: " . $e->getMessage());
            throw new Exception("Erro ao apagar arquivo local");
        }
    }
}
