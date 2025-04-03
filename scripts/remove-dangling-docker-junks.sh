#!/bin/bash

set -e

docker volume rm $(docker volume ls -qf dangling=true)
docker rmi $(docker images -f "dangling=true" -q)
