<?php

namespace App\Domain\Exceptions;

use Exception;

class DuplicatedEntityException extends Exception
{
    public function __construct(string $message, int $code = 409)
    {
        parent::__construct($message, $code);
    }
    
}