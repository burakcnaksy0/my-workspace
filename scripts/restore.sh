#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ -z "$1" ]; then
  echo "Kullanım: $0 <yedek_dosyası_yolu.dump>"
  exit 1
fi

RESTORE_FILE="$1"

if [ ! -f "$RESTORE_FILE" ]; then
  echo "[-] Hata: Belirtilen yedek dosyası bulunamadı: $RESTORE_FILE"
  exit 1
fi

# Verify checksum if .sha256 file exists
CHECKSUM_FILE="${RESTORE_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
  echo "[*] SHA-256 doğrulama yapılıyor..."
  sha256sum -c "$CHECKSUM_FILE"
  echo "[+] Checksum doğrulandı."
else
  echo "[!] Uyarı: ${CHECKSUM_FILE} bulunamadı, checksum atlanıyor."
fi

# Load environment variables safely
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_NAME="${POSTGRES_DB:-personal_workspace}"
DB_USER="${POSTGRES_USER:-workspace_user}"

echo "========================================================"
echo "DİKKAT: $DB_NAME veritabanının üzerine yazılacaktır!"
echo "Yedek dosyası: $RESTORE_FILE"
echo "========================================================"
read -p "Devam etmek istediğinize emin misiniz? (e/N): " CONFIRM
if [ "$CONFIRM" != "e" ] && [ "$CONFIRM" != "E" ] && [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "[-] Geri yükleme iptal edildi."
  exit 0
fi

echo "[*] Mevcut veritabanı bağlantıları sonlandırılıyor ve geri yükleniyor..."
docker exec -i personal-workspace-postgres pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists < "$RESTORE_FILE" || true

echo "[+] Geri yükleme işlemi tamamlandı."
