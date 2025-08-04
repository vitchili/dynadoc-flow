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
        $this->info('Iniciando consumo de solicitações de template...');

        Kafka::consumer()
            ->subscribe('template.requested')
            ->withHandler(function (ConsumedMessage $message) {
                $message = json_encode($message->getBody());
                $templateId = json_decode($message)->templateId;

                $templateSectionsOutputDTO = $this->deliverTemplateHandler->execute($templateId);

                echo "Mensagem recebida: " . $templateId  . PHP_EOL; //Retirar e chamar Event Sourcing.
            })
            ->build()
            ->consume();

        return Command::SUCCESS;
    }
}
