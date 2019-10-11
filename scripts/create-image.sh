#! /usr/bin/env bash
docker rm -f frm_feedback
docker rmi -f perpendikulyar/frm_feedback
docker image prune
docker volume prune
docker build -t perpendikulyar/frm_feedback ..