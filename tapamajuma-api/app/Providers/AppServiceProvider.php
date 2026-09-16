<?php

namespace App\Providers;

use Illuminate\Auth\Passwords\DatabaseTokenRepository;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Override PasswordBroker supaya token reset password selalu
        // disimpan & dibaca dari koneksi 'tenant' yang aktif saat ini.
        // Tanpa ini, DatabaseTokenRepository pakai koneksi default (central)
        // sehingga token tidak ketemu saat reset dilakukan (token invalid).
        $this->app->extend('auth.password', function ($broker, $app) {
            $config = $app['config']['auth.passwords.users'];

            $tokenRepo = new DatabaseTokenRepository(
                DB::connection('tenant'),        // ← selalu gunakan koneksi tenant
                $app['hash'],
                $config['table'],
                $app['config']['app.key'],
                $config['expire'],
                $config['throttle'] ?? 0
            );

            return new PasswordBroker(
                $tokenRepo,
                $app['auth']->createUserProvider($config['provider'])
            );
        });
    }
}
