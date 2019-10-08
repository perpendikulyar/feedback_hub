#!/usr/bin/env bash
sh create-image.sh
docer-compose -f ../docker-compose.production.yml up --force-recreate
