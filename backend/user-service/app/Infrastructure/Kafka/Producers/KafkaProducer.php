<?php

declare(strict_types=1);

namespace App\Infrastructure\Kafka\Producers;

use Junges\Kafka\Facades\Kafka;
use Junges\Kafka\Message\Message;

class KafkaProducer
{
    public function send(string $topic, array $payload, ?string $key = null, array $headers = []): void
    {
        $message = new Message(
            body: $payload,
            key: $key,
            headers: $headers
        );

        Kafka::publish()
            ->onTopic($topic)
            ->withMessage($message)
            ->withConfigOption('acks', 'all')
            ->withConfigOption('enable.idempotence', true)
            ->send();
    }
}
