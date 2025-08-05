<?php

namespace App\Application\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class InvokeKafkaConsumers extends Command
{
    protected $signature = 'kafka:invoke-consumers';
    protected $description = 'Consume Kafka topic messages';

    public function handle(): int
    {
       $this->info('Executando comandos...');

        Artisan::call('kafka:consume-template-requested');
        $this->info('consuming template.requested');


        return Command::SUCCESS;
    }
}
