<?php

declare(strict_types=1);

namespace App\Application\Events;

use App\Application\DTOs\TemplateSectionsOutputDTO;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class TemplateDeliveredEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithSockets, InteractsWithQueue, SerializesModels;

    public int $tries = 5;

    public int $backoff = 10;

    public function __construct(public TemplateSectionsOutputDTO $templateSectionsDTO)
    {
    }
}
