<?php

declare(strict_types=1);

namespace App\Application\Listeners;

use App\Application\Events\UserLoggedIn;
use App\Infrastructure\Kafka\Producers\KafkaProducer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class PublishUserLoginToKafka
{
    public function __construct(private KafkaProducer $producer) {}

    /**
     * Handle the event.
     */
    public function handle(UserLoggedIn $event): void
    {
        $this->producer->send(
            topic: 'user.logged',
            payload: $event->outputDTO->toArray(),
            key: (string) $event->outputDTO->id
        );
    }
}
