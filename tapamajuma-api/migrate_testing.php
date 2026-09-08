<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

config([
    'database.connections.central' => config('database.connections.mysql'),
    'database.connections.tenant' => config('database.connections.mysql'),
]);

\Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
    '--database' => 'mysql',
    '--path' => [
        'database/migrations/central',
        'database/migrations/tenant'
    ],
    '--drop-views' => true,
]);

echo \Illuminate\Support\Facades\Artisan::output();
echo "Migration done.\n";
