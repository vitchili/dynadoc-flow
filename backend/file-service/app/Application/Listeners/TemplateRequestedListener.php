<?php

declare(strict_types=1);

namespace App\Application\Listeners;

use App\Application\Events\TemplateRequestedEvent;
use App\Infrastructure\Kafka\Producers\KafkaProducer;

class TemplateRequestedListener
{
    public function __construct(private KafkaProducer $producer) {}

    /**
     * Handle the event.
     */
    public function handle(TemplateRequestedEvent $event): void
    {
        $this->producer->send(
            topic: 'template.requested',
            payload: [
                'templateId' => $event->templateId
            ],
            key: (string) $event->templateId
        );
    }
}
