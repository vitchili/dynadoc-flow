<?php

namespace App\Infrastructure\Providers;

use App\Application\Events\TemplateDeliveredEvent;
use App\Application\Listeners\TemplateDeliveredListener;
use App\Domain\Exceptions\ExceptionHandler;
use App\Domain\Repositories\ContextRepositoryInterface;
use App\Domain\Repositories\SectionRepositoryInterface;
use App\Domain\Repositories\TagRepositoryInterface;
use App\Domain\Repositories\TemplateRepositoryInterface;
use App\Infrastructure\Helpers\LoggedUserHelper;
use App\Infrastructure\Repositories\ContextRepository;
use App\Infrastructure\Repositories\SectionRepository;
use App\Infrastructure\Repositories\TagRepository;
use App\Infrastructure\Repositories\TemplateRepository;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton( \Illuminate\Contracts\Debug\ExceptionHandler::class, ExceptionHandler::class );

        $this->app->singleton(LoggedUserHelper::class, function ($app) {
            return new LoggedUserHelper($app->make(Request::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            TemplateDeliveredEvent::class,
            TemplateDeliveredListener::class,
        );

        $this->app->bind(ContextRepositoryInterface::class, ContextRepository::class);
        $this->app->bind(TagRepositoryInterface::class, TagRepository::class);
        $this->app->bind(SectionRepositoryInterface::class, SectionRepository::class);
        $this->app->bind(TemplateRepositoryInterface::class, TemplateRepository::class);
    }
}
