<?php

declare(strict_types=1);

namespace App\Application\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TemplateRequestedEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, InteractsWithQueue, SerializesModels;

    public int $tries = 5;

    public int $backoff = 10;

    public function __construct(public string $templateId)
    {
    }
}