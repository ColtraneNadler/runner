#!/bin/bash

VAULT_KV=$(echo $VAULT_KV_PATH | awk -F'/' '{print $1}')
VAULT_KV_PATH=$(echo $VAULT_KV_PATH | sed "s,$VAULT_KV/,,g")
ENV=$(echo $VAULT_KV_PATH | awk -F'/' '{print $NF}')

cd /usr/share/nginx/html
cp config/$ENV.js config/index.js

nginx -g 'daemon off;'
