#!/bin/bash


npx concurrently \
  -n "REACT,LARAVEL,LOGGER" \
  -c "cyan,magenta,yellow" \
  "cd tapamajuma-app && npm run dev -- --host " \
  "cd tapamajuma-api && php artisan serve --host 0.0.0.0 --port 8000" \
  #"cd tapamajuma-logger && go run main.go"