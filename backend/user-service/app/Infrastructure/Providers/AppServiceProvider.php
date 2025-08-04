<?php

namespace App\Infrastructure\Providers;

use App\Application\Events\UserLoggedIn;
use App\Application\Listeners\PublishUserLoginToKafka;
use App\Domain\Exceptions\ExceptionHandler;
use App\Domain\Repositories\UserRepositoryInterface;
use App\Infrastructure\Repositories\UserRepository;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton( \Illuminate\Contracts\Debug\ExceptionHandler::class, ExceptionHandler::class );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);

        Event::listen(
            UserLoggedIn::class,
            PublishUserLoginToKafka::class,
        );
    }
}
