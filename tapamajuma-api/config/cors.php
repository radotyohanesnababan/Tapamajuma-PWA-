<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'reflections','sanctum/csrf-cookie', 'login', 'register', 'logout','user', 'forgot-password', 'reset-password'], // Fokuskan pathnya

'allowed_methods' => ['*'],

'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
    'https://tapamajuma-pwa.vercel.app',
    'https://tapamajuma.my.id',
    'https://tapamajuma-pwa.onrender.com',
    'https://tapamajuma.smpn1siborongborong.sch.id',
    'https://www.tapamajuma.smpn1siborongborong.sch.id',
    'capacitor://localhost',
],


'allowed_origins_patterns' => [
        '#^https://.*\.tapamajuma\.my\.id$#',
],

'allowed_headers' => ['*'],

'exposed_headers' => [],

'max_age' => 0,

'supports_credentials' => true,

];
