<?php

declare(strict_types=1);

namespace App\Application\Events;

use App\Application\DTOs\TemplateSectionsOutputDTO;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TemplateDeliveredEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public TemplateSectionsOutputDTO $templateSectionsDTO)
    {
    }
}
