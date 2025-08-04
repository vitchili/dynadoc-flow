<?php

namespace App\Domain\Enums;

enum TagTypeEnum: int
{
    case TEXT = 1;
    case NUMBER = 2;
    case DATE = 3;

    public function label(): string
    {
        return match($this) {
            self::TEXT => 'Texto',
            self::NUMBER => 'Número',
            self::DATE => 'Data'
        };
    }
}

