#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Load environment variables safely
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_NAME="${POSTGRES_DB:-personal_workspace}"
DB_USER="${POSTGRES_USER:-workspace_user}"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/personal_workspace_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

mkdir -p "$BACKUP_DIR"

echo "[*] Veritabanı yedeği alınıyor: $BACKUP_FILE"

# Execute pg_dump inside postgres container using custom archive format (-Fc)
if ! docker exec personal-workspace-postgres pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_FILE"; then
  echo "[-] Hata: pg_dump başarısız oldu!"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Verify non-zero size
if [ ! -s "$BACKUP_FILE" ]; then
  echo "[-] Hata: Yedek dosyası sıfır bayt! Başarısız sayıldı."
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Generate SHA256 checksum
sha256sum "$BACKUP_FILE" > "$CHECKSUM_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[+] Yedek başarıyla tamamlandı!"
echo "    Dosya:     $BACKUP_FILE ($FILE_SIZE)"
echo "    Doğrulama: $CHECKSUM_FILE"

# Retention: keep only the last N days of backups (default 14).
# Set BACKUP_RETENTION_DAYS in .env to change; 0 disables cleanup.
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
if [ "$RETENTION_DAYS" -gt 0 ]; then
  PRUNED=$(find "$BACKUP_DIR" -maxdepth 1 \( -name 'personal_workspace_*.dump' -o -name 'personal_workspace_*.dump.sha256' \) -mtime +"$RETENTION_DAYS" -print -delete | wc -l)
  if [ "$PRUNED" -gt 0 ]; then
    echo "[+] Saklama politikası: $RETENTION_DAYS günden eski $PRUNED dosya silindi."
  fi
fi
