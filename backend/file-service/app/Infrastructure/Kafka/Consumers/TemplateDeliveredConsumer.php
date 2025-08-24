<?php

namespace App\Infrastructure\Kafka\Consumers;

use App\Application\DTOs\FileContentInputDTO;
use App\Application\Handlers\DeliverTemplateHandler;
use App\Application\Handlers\FileGenerationHandler;
use Illuminate\Console\Command;
use Junges\Kafka\Facades\Kafka;
use Junges\Kafka\Message\ConsumedMessage;

class TemplateDeliveredConsumer extends Command
{
    protected $signature = 'kafka:consume-template-delivered';
    protected $description = 'Consume Kafka topic messages';

    public function __construct(
        public FileGenerationHandler $fileHandler
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Initializing consumer of template delivered...');

        Kafka::consumer()
            ->subscribe('template.delivered')
            ->withHandler(function (ConsumedMessage $message) {
                $message = json_encode($message->getBody());
                $templateSections = json_decode($message);
                $template = $templateSections->data->template;
                $sections = $templateSections->data->sections;

                $input = new FileContentInputDTO(
                    template: $template,
                    sections: collect($sections)
                );

                $this->fileHandler->execute($input);

                echo "Message received: " . $message  . PHP_EOL;
            })
            ->build()
            ->consume();

        return Command::SUCCESS;
    }
}
