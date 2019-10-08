#!/user/bin/env bash
docker rm -f frm_feedback
docker rmi -f womanru/frm_feedback
docker image prune
docker volume prune
docker build -t womanru/frm_feedback