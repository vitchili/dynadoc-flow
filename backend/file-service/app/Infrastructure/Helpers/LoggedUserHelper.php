<?php

namespace App\Infrastructure\Helpers;

use Illuminate\Http\Request;

class LoggedUserHelper
{
    public function __construct(protected Request $request) {}

    public function get(): ?array
    {
        return $this->request->attributes->get('loggedUser');
    }

    public function companyId(): ?string
    {
        return $this->get()['companyId'] ?? null;
    }

    public function userId(): ?string
    {
        return $this->get()['userId'] ?? null;
    }
}
