<?php

namespace App\Infrastructure\Kafka\Consumers;

use App\Application\Handlers\DeliverTemplateHandler;
use Illuminate\Console\Command;
use Junges\Kafka\Facades\Kafka;
use Junges\Kafka\Message\ConsumedMessage;

class TemplateRequestedConsumer extends Command
{
    protected $signature = 'kafka:consume-template-requested';
    protected $description = 'Consume Kafka topic messages';

    public function __construct(
        public DeliverTemplateHandler $deliverTemplateHandler
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        Kafka::consumer()
            ->subscribe('template.requested')
            ->withHandler(function (ConsumedMessage $message) {
                $message = (object) $message->getBody();
                $templateId = $message->templateId;

               $this->deliverTemplateHandler->execute($templateId);

                echo "Message receive: " . $templateId  . PHP_EOL;
            })
            ->build()
            ->consume();

        return Command::SUCCESS;
    }
}
