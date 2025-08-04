<?php

declare(strict_types=1);

namespace App\Application\Listeners;

use App\Application\Events\TemplateDeliveredEvent;
use App\Infrastructure\Kafka\Producers\KafkaProducer;

class TemplateDeliveredListener

{
    public function __construct(private KafkaProducer $producer) {}

    /**
     * Handle the event.
     */
    public function handle(TemplateDeliveredEvent $event): void
    {
        $this->producer->send(
            topic: 'template.delivered',
            payload: [
                'data' => $event->templateSectionsDTO->toArray()
            ],
            key: $event->templateSectionsDTO->template->id
        );
    }
}
