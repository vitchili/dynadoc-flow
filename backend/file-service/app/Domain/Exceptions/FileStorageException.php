<?php

namespace App\Domain\Exceptions;

use Exception;

class FileStorageException extends Exception
{
    public function __construct(string $message = '', int $code = 500)
    {
        parent::__construct($message, $code);
    }
}
