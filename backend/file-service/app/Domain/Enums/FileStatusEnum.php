<?php

namespace App\Domain\Enums;

enum FileStatusEnum: int
{
    case PROCESSING = 1;
    case READY = 2;
    case ERROR = 3;

    public function label(): string
    {
        return match($this) {
            self::PROCESSING => 'Processando',
            self::READY => 'Pronto',
            self::ERROR => 'Erro'
        };
    }
}

