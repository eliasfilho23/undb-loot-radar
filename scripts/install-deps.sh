#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

echo "→ Subindo banco de dados..."
docker compose -f "$ROOT/docker-compose.yml" up -d postgres

echo "→ Aguardando postgres ficar healthy..."
until docker inspect --format='{{.State.Health.Status}}' lootradar-postgres 2>/dev/null | grep -q "healthy"; do
  printf "."
  sleep 2
done
echo " ok"

echo "→ Buildando @lootradar/shared..."
(cd "$ROOT/shared" && npm install --silent && npm run build)

echo "→ Instalando dependências do backend..."
(cd "$ROOT/backend" && npm install --silent)

echo "→ Gerando e aplicando migrations do banco..."
(cd "$ROOT/backend" && npm run drizzle:generate && npm run drizzle:migrate)

echo "→ Instalando dependências dos testes..."
(cd "$ROOT/tests" && npm install --silent)

echo ""
echo "✓ Ambiente pronto."
echo "  Backend:  cd backend && npm run start:dev"
echo "  Testes:   cd tests && npm test"
echo "  Migrate:  docker compose --profile tools run --rm migrate"
