<?php

declare(strict_types=1);

namespace App\Application\Events;

use App\Application\DTOs\AuthOutputDTO;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserLoggedIn
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public AuthOutputDTO $outputDTO)
    {
    }
}
