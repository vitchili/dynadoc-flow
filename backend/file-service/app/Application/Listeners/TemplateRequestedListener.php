<?php

declare(strict_types=1);

namespace App\Application\Listeners;

use App\Application\Events\TemplateRequestedEvent;
use App\Infrastructure\Kafka\Producers\KafkaProducer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Throwable;

class TemplateRequestedListener implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 5;
    public int $backoff = 10;

    public function __construct(private KafkaProducer $producer) {}

    public function handle(TemplateRequestedEvent $event): void
    {
        try {
            $this->producer->send(
                topic: 'template.requested',
                payload: [
                    'templateId' => $event->templateId
                ],
                key: (string) $event->templateId
            );
        } catch (Throwable $e) {
            $this->release($this->backoff);
            throw $e;
        }
    }
}