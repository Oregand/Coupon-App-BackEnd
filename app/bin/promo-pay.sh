#!/usr/bin/env bash

target_dir="/opt/promo-pay"
target="index.js"
args="--harmony"

if [ -z "$NODE_ENV" ] || [ "$NODE_ENV" = "development" ]; then
    (cd "$target_dir" && npm start)
else
    (cd "$target_dir" && node $args "$target")
fi
