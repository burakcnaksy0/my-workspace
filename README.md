# Personal Workspace

Kişisel ve profesyonel hayatı tek bir çatı altında organize etmeyi sağlayan, **local-first**, modüler ve Docker tabanlı kişisel çalışma platformu.

> **Durum:** MVP tamamlandı ve doğrulandı — Tüm 6 geliştirme aşaması tamamlanmış, testler geçmiş, Docker üzerinden çalışır durumda.

---

## 🚀 Hızlı Başlangıç

### Önkoşullar

- **Docker** (v24+) ve **Docker Compose** (v2.20+)
- İsteğe bağlı yerel geliştirme için:
  - **Java 21 LTS** & Maven
  - **Node.js 22+** & npm

### 1. Ortam Yapılandırması

```bash
# Proje dizinine girin
cd personal-workspace

# Örnek ortam değişkenlerini kopyalayın ve düzenleyin
cp .env.example .env
```

`.env` dosyasını düzenleyerek en az şu değişkenleri ayarlayın:

| Değişken | Açıklama | Örnek |
|---|---|---|
| `POSTGRES_PASSWORD` | Veritabanı parolası | Güçlü rastgele parola |
| `BOOTSTRAP_ADMIN_USERNAME` | İlk admin kullanıcı adı | `admin` |
| `BOOTSTRAP_ADMIN_PASSWORD` | İlk admin parolası (min 8 karakter) | Güçlü parola |

> [!CAUTION]
> `.env` dosyasını **asla Git'e commitlemeyin**. `.gitignore` tarafından zaten dışlanmıştır. `.env.example` dosyası güvenli şablondur.

### 2. Servisleri Başlatın

```bash
# Betik ile (sağlık kontrolü bekler)
./scripts/start.sh

# veya doğrudan
docker compose up -d --build
```

### 3. Tarayıcıdan Erişin

Konteynerler healthy durumuna geçince:

- **🌐 Ana Arayüz:** [http://localhost:3000](http://localhost:3000)
- **📖 OpenAPI / Swagger:** [http://localhost:3000/api/swagger-ui.html](http://localhost:3000/api/swagger-ui.html)
- **🩺 Sağlık Kontrolü:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🏗 Mimari ve Teknoloji Yığını

| Katman | Teknoloji | Sürüm | Açıklama |
|---|---|---|---|
| **Frontend** | React, TypeScript, Vite | 18.3.1 / 5.x / 6.x | Same-Origin `/api` rotalaması, glassmorphism arayüz |
| **CSS** | Tailwind CSS, shadcn/ui | 3.4 | Koyu tema, cam efektleri |
| **Editörler** | Tiptap, Excalidraw | güncel | Zengin metin, çizim |
| **Backend** | Java 21 LTS, Spring Boot | 3.4.1 | Modüler monolit, Spring Security, Spring Session JDBC |
| **Veritabanı** | PostgreSQL | 16-alpine | UTC, pgcrypto UUID, Flyway migration |
| **DevOps** | Docker Compose, Nginx | v2 / 1.27 | Multi-stage build, healthcheck, kalıcı volume |

### 🔒 Güvenlik & Same-Origin Kuralı

- Tarayıcı yalnızca `http://localhost:3000` ile konuşur — backend hostu hiçbir zaman istemci koduna yazılmaz.
- Nginx, `/api/*` ve `/actuator/*` isteklerini backend container'ına reverse-proxy eder.
- **CSRF Koruması:** Double-submit cookie (`X-XSRF-TOKEN` başlığı) ile korunur.
- **Oturum:** Spring Session JDBC — container yeniden başlatılsa bile oturum korunur.
- **Parola:** BCrypt hash, loglara asla yazılmaz.
- **Giriş Hız Sınırı:** Art arda başarısız denemeler kilitlenir.

---

## 🎯 Özellikler

| Modül | Özellikler |
|---|---|
| **Dashboard** | Bugünkü & geciken görevler, hızlı görev/not ekleme, son notlar |
| **Görevler** | CRUD, öncelik (LOW/MEDIUM/HIGH), son tarih, durum (TODO/IN_PROGRESS/DONE), alan filtresi |
| **Notlar** | Tiptap zengin metin editörü, otomatik/manuel kayıt, içerik arama, etiketler |
| **Çizimler** | Excalidraw entegrasyonu, çoklu bağımsız belge, PNG/SVG/JSON dışa aktarma |
| **Çalışma Panoları** | Sütunlu Kanban + Serbest tuval (yerel sürükle-bırak implementasyonu), `mapped_status` senkronizasyonu |
| **Alanlar** | İş & Kariyer, Yazılım Öğrenimi, Spor, Kişisel — düzenlenebilir |
| **İçerik Bağlantıları** | Görev ↔ Not ↔ Çizim arası yönsüz çapraz referanslar; kart detay modalında listeleme/ekleme/silme, içerik silinince bağlantılar otomatik temizlenir |

---

## 💾 Kalıcı Veriler ve Docker Yaşam Döngüsü

> [!CAUTION]
> **VERİ GÜVENLİĞİ:**
> - `docker compose down` → Container'ları durdurur, **veriler KORUNUR** ✅
> - `docker compose down -v` → Named volume'ları **KALICI OLARAK SİLER** ❌
>
> Verilerinizi silmek istemiyorsanız `-v` parametresini **kesinlikle kullanmayın**.

### Bilgisayar Açıldığında Otomatik Başlatma

Container'lar `restart: unless-stopped` politikasıyla yapılandırılmıştır:

- **Linux (systemd):**
  ```bash
  sudo systemctl enable docker
  sudo systemctl start docker
  ```
- **macOS & Windows:** Docker Desktop → Ayarlar → *"Start Docker Desktop when you log in"* seçeneğini işaretleyin.

---

## 📦 Yedekleme ve Geri Yükleme

Verileriniz kişisel olduğu için bağımsız yedekleme betikleri hazır sunulmuştur.

### Veritabanı Yedeği Alma

```bash
./scripts/backup.sh
```

- `backups/` dizinine tarih damgalı `.dump` dosyası oluşturur (PostgreSQL custom format `-Fc`)
- SHA-256 doğrulama özeti (`.sha256`) oluşturur
- Sıfır baytlık yedek başarısız sayılır
- Çıkış kodu 0 = başarı, 1 = hata
- Saklama politikası: `BACKUP_RETENTION_DAYS` (varsayılan 14) günden eski yedekler otomatik silinir; `0` değeri temizliği kapatır

### Planlı Otomatik Yedekleme

Betik tek seferliktir; düzenli aralık için sistem zamanlayıcınızdan yararlanın:

**cron** (her gece 03:00):

```cron
0 3 * * * /yol/ki/proje/scripts/backup.sh >> /yol/ki/proje/backups/backup.log 2>&1
```

**systemd timer** (kron sonrası çalışan makinelerde güvenilir seçenek):

```ini
# ~/.config/systemd/user/workspace-backup.service
[Unit]
Description=Personal Workspace DB backup

[Service]
Type=oneshot
ExecStart=/yol/ki/proje/scripts/backup.sh
```

```ini
# ~/.config/systemd/user/workspace-backup.timer
[Unit]
Description=Daily workspace backup

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl --user enable --now workspace-backup.timer
```

> [!NOTE]
> Zamanlayıcının `docker` grubu erişimi olan bir kullanıcıyla çalışması gerekir. Yedekler makineyle aynı diskte durduğu için kritik verilerde `backups/` dizisini harici/kirilabilir bir medyaya da kopyalamanız önerilir.

### Yedekten Geri Yükleme

```bash
./scripts/restore.sh backups/personal_workspace_YYYYMMDD_HHMMSS.dump
```

- Geri yükleme öncesinde SHA-256 özeti doğrulanır
- Kullanıcı onayı istenir (yanlışlıkla üzerine yazma önlenir)
- `--clean --if-exists` ile mevcut verinin üzerine güvenle yazar

> [!IMPORTANT]
> `.env` dosyası (veritabanı parolaları) yedeğe dahil **edilmez**. `.env` dosyanızı ayrıca güvenli bir yerde (şifreli depolama, parola yöneticisi vb.) saklayın. `.env` olmadan geri yükleme çalışmaz.

---

## 🧪 Testleri Çalıştırma

### Backend Birim Testleri (JUnit 5 / Mockito)

```bash
cd backend
./mvnw test -Dtest="TaskServiceTest,NoteServiceTest,DrawingServiceTest,BoardServiceTest,HealthControllerTest" --no-transfer-progress
```

**Sonuç:** 28/28 test geçer.

### Backend Entegrasyon Testleri (Testcontainers + gerçek PostgreSQL)

```bash
cd backend
./mvnw test -Dtest="PostgresContainerIntegrationTest" --no-transfer-progress
```

**Sonuç:** 1/1 test geçer — Bootstrap, Flyway migration ve entity doğrulaması gerçek PostgreSQL üzerinde çalışır.

### Tüm Backend Testleri

```bash
cd backend
./mvnw test --no-transfer-progress
```

**Sonuç:** 29/29 test geçer.

### Frontend Birim Testleri (Vitest / React Testing Library)

```bash
cd frontend
npm test -- --run
```

**Sonuç:** 8/8 test geçer (4 test dosyası).

### Frontend Tip Kontrolü

```bash
cd frontend
npm run lint
```

**Sonuç:** 0 TypeScript hatası.

---

## ⚙️ Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `POSTGRES_DB` | Evet | Veritabanı adı |
| `POSTGRES_USER` | Evet | Veritabanı kullanıcısı |
| `POSTGRES_PASSWORD` | Evet | Veritabanı parolası |
| `BOOTSTRAP_ADMIN_USERNAME` | Evet | İlk yönetici kullanıcı adı |
| `BOOTSTRAP_ADMIN_PASSWORD` | Evet | İlk yönetici parolası (≥8 karakter) |
| `BOOTSTRAP_DEFAULT_WORKSPACE` | Hayır | İlk çalışma alanı adı (varsayılan: `Kişisel Çalışma Alanım`) |
| `SESSION_COOKIE_SECURE` | Hayır | Oturum çerezi `Secure` bayrağı (varsayılan: `false`, yalnızca localhost HTTP) |
| `SESSION_MAX_INACTIVE_INTERVAL_SECONDS` | Hayır | Oturum boşta kalma süresi (varsayılan: 86400) |
| `BACKUP_RETENTION_DAYS` | Hayır | `scripts/backup.sh` saklama süresi, gün (varsayılan: 14; `0` = temizleme yok) |
| `SPRING_PROFILES_ACTIVE` | Hayır | Aktif Spring profili (varsayılan: `prod`) |
| `FRONTEND_PORT` | Hayır | Host üzerindeki erişim portu (varsayılan: 3000) |

---

## 🗄️ Veritabanı Migrasyonları

Flyway migrasyonları uygulama başlarken **otomatik** uygulanır. Mevcut migration dosyası:

| Versiyon | Dosya | İçerik |
|---|---|---|
| `V1` | `V1__init_schema.sql` | Tam şema: users, workspaces, areas, tasks, notes, drawings, boards, board_columns, board_items, board_edges, tags, spring_session |

`ddl-auto=validate` kullanılır; Hibernate şemayı otomatik oluşturmaz/değiştirmez.

---

## 📁 Proje Yapısı

```
workspace/
├── backend/                    # Spring Boot 3.4.1 (Java 21)
│   ├── src/main/java/com/personalworkspace/
│   │   ├── common/             # SecurityConfig, GlobalExceptionHandler
│   │   ├── identity/           # User, AuthService, LoginRateLimiter
│   │   ├── workspace/          # Workspace, Membership, Area
│   │   ├── task/               # Task CRUD ve durum yönetimi
│   │   ├── notes/              # Note, Tag, Tiptap JSON saklama
│   │   ├── drawings/           # DrawingDocument, Excalidraw saklama
│   │   ├── boards/             # Board, BoardColumn, BoardItem, BoardEdge
│   │   └── dashboard/          # Dashboard metrikleri
│   ├── src/main/resources/db/migration/V1__init_schema.sql
│   └── Dockerfile              # Multi-stage: maven → eclipse-temurin:21-jre
├── frontend/                   # React 18 + TypeScript + Vite 6
│   ├── src/features/           # auth, dashboard, tasks, notes, drawings, boards
│   ├── nginx.conf              # Same-Origin reverse proxy
│   └── Dockerfile              # Multi-stage: node:22-alpine → nginx:1.27-alpine
├── scripts/
│   ├── start.sh                # Docker compose up + health bekleme
│   ├── backup.sh               # pg_dump (-Fc) + SHA-256
│   └── restore.sh              # SHA-256 doğrulama + pg_restore
├── docs/
│   ├── DECISIONS.md            # Mimari Karar Kayıtları (ADR-001 — ADR-009)
│   └── TESLIM_RAPORU.md        # Teslim ve durum raporu
├── compose.yaml
├── .env.example
└── README.md
```

---

## 🐛 Bilinen Sınırlamalar

- Çöp kutusu / geri alma (soft delete) V2'ye bırakıldı; silmeler kalıcıdır (UI'da onay istenir).
- Yedekler zamanlayıcı hizmeti olarak paketlenmez; README'deki cron/systemd timer örneğiyle günlük otomatik yedek kurabilirsiniz (saklama politikası betiğe dahildir).
- Playwright E2E testleri eklenmedi; birim ve entegrasyon testleri mevcut.
