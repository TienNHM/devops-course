#!/usr/bin/env bash
# Local CD sample (Session 19): pull published images and redeploy to a kind cluster.
# Usage: OWNER=<github-user> TAG=sha-abc1234 ./deploy-local.sh
set -euo pipefail
: "${OWNER:?set OWNER}" "${TAG:?set TAG}"
CLUSTER=${CLUSTER:-club}

for img in club-api club-web; do
  docker pull "ghcr.io/${OWNER}/${img}:${TAG}"
  docker tag "ghcr.io/${OWNER}/${img}:${TAG}" "${img}:${TAG}"
  kind load docker-image "${img}:${TAG}" --name "$CLUSTER"
done
kubectl -n club set image deployment/club-api api="club-api:${TAG}"
kubectl -n club set image deployment/club-web web="club-web:${TAG}"
kubectl -n club rollout status deployment/club-api
kubectl -n club rollout status deployment/club-web
