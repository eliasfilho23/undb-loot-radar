#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
BACKEND_DIR=$(cd -- "$SCRIPT_DIR/../backend" && pwd)

cd "$BACKEND_DIR"

if [[ -f .env.development ]]; then
  set -a
  source .env.development
  set +a
elif [[ -f .env ]]; then
  set -a
  source .env
  set +a
else
  echo "Aviso: nenhum .env.development ou .env em backend/; drizzle-kit usa só variáveis já exportadas no shell." >&2
fi

echo "→ drizzle-kit generate"
npm run drizzle:generate

echo "→ drizzle-kit migrate"
npm run drizzle:migrate

echo "Feito."
