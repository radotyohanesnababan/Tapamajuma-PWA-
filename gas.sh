#!/bin/bash


concurrently \
  -n "REACT,LARAVEL,LOGGER" \
  -c "cyan,magenta,yellow" \
  "cd tapamajuma-app && npm run dev" \
  "cd tapamajuma-api && php artisan serve" \
  "cd tapamajuma-logger && go run main.go"