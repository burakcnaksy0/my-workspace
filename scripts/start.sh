#!/usr/bin/env bash
set -e

# Change directory to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "========================================================"
echo " Personal Workspace — Başlatma Betiği"
echo "========================================================"

# 1. Check .env file
if [ ! -f .env ]; then
  echo "[-] .env dosyası bulunamadı. .env.example üzerinden oluşturuluyor..."
  cp .env.example .env
  echo "[+] .env oluşturuldu. Lütfen üretim parolalarını .env içinde güncelleyin."
fi

# 2. Check Docker availability
if ! command -v docker >/dev/null 2>&1; then
  echo "[-] Hata: Docker kurulu değil veya PATH'te bulunamadı."
  exit 1
fi

echo "[*] Docker Compose servisleri derleniyor ve başlatılıyor..."
docker compose up -d --build

echo "[*] Servislerin sağlık durumları (healthcheck) bekleniyor..."
MAX_WAIT=90
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  FRONTEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' personal-workspace-frontend 2>/dev/null || echo '"unknown"')
  BACKEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' personal-workspace-backend 2>/dev/null || echo '"unknown"')
  POSTGRES_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' personal-workspace-postgres 2>/dev/null || echo '"unknown"')

  if [ "$FRONTEND_STATUS" = '"healthy"' ] && [ "$BACKEND_STATUS" = '"healthy"' ] && [ "$POSTGRES_STATUS" = '"healthy"' ]; then
    echo "[+] Tüm servisler başarıyla çalışır durumda ve SAĞLIKLI!"
    break
  fi

  echo "    Bekleniyor (${ELAPSED}s): Postgres=$POSTGRES_STATUS, Backend=$BACKEND_STATUS, Frontend=$FRONTEND_STATUS"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "[-] Uyarı: Servisler $MAX_WAIT saniye içinde tam sağlıklı duruma gelemedi. Lütfen 'docker compose logs' inceleyin."
fi

echo "========================================================"
echo "[+] Personal Workspace erişim adresi: http://localhost:3000"
echo "[+] OpenAPI (Swagger) adresi:        http://localhost:3000/api/swagger-ui.html"
echo "[+] Altyapı Sağlık Kontrolü:         http://localhost:3000/api/health"
echo "[+] Actuator Health:                 http://localhost:3000/api/actuator/health"
echo "========================================================"
