#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FNN_DATA_DIR="${ROOT_DIR}/docker/fnn-data"
KEY_PATH="${FNN_DATA_DIR}/ckb/key"
ENV_FILE="${ROOT_DIR}/.env"

echo "==> FNNPay FNN node setup"
echo

mkdir -p "${FNN_DATA_DIR}/ckb"

if [[ -f "${KEY_PATH}" ]]; then
  echo "CKB wallet key already exists at ${KEY_PATH}"
else
  echo "No CKB wallet key found."
  echo
  echo "FNN needs a CKB private key at: docker/fnn-data/ckb/key"
  echo
  echo "Option A — use ckb-cli (recommended):"
  echo "  ckb-cli account new"
  echo "  ckb-cli account export --lock-arg <your-lock-arg> --extended-privkey-path /tmp/exported-key"
  echo "  head -n 1 /tmp/exported-key > docker/fnn-data/ckb/key"
  echo "  rm /tmp/exported-key"
  echo
  echo "Option B — copy an existing testnet key:"
  echo "  cp /path/to/your/key docker/fnn-data/ckb/key"
  echo
  echo "Fund the wallet on CKB testnet before opening Fiber channels."
  echo "Testnet faucet: https://faucet.nervos.org/"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  if [[ -f "${ROOT_DIR}/.env.example" ]]; then
    cp "${ROOT_DIR}/.env.example" "${ENV_FILE}"
    echo "Created .env from .env.example — edit secrets before starting Docker."
  else
    echo "Missing .env file. Copy .env.example to .env and set secrets."
    exit 1
  fi
fi

if grep -q 'change-me' "${ENV_FILE}"; then
  echo
  echo "Warning: .env still contains placeholder values (change-me)."
  echo "Update POSTGRES_PASSWORD, FIBER_SECRET_KEY_PASSWORD, and FNNPAY_SECRET_KEY before production use."
fi

echo
echo "Setup looks good. Start the stack with:"
echo "  cd docker && docker compose up -d --build"
echo
echo "Useful commands:"
echo "  docker compose -f docker/docker-compose.yml logs -f fnn"
echo "  docker compose -f docker/docker-compose.yml exec fnn fnn-cli info"
echo "  docker compose -f docker/docker-compose.yml exec fnn fnn-cli channel list_channels"
