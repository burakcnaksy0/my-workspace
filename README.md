# Personal Workspace

Kişisel ve profesyonel hayatı tek bir çatı altında organize etmeyi sağlayan, yerel çalışan (local-first), modüler ve Docker tabanlı kişisel çalışma platformu.

---

## 🚀 Hızlı Başlangıç

### Önkoşullar

- **Docker** (v24+) ve **Docker Compose** (v2+)
- İsteğe bağlı yerel geliştirme için:
  - **Java 21 LTS** & Maven
  - **Node.js 22+** & npm

### Tek Komutla Çalıştırma

```bash
# 1. Proje dizinine geçin
cd personal-workspace

# 2. Örnek ortam değişkenlerini kopyalayın
cp .env.example .env

# 3. Başlatma betiğini çalıştırın (veya doğrudan docker compose up)
./scripts/start.sh
# veya
docker compose up -d --build
```

Uygulama hazır olduğunda tarayıcınızdan erişebilirsiniz:
- **Ana Arayüz:** [http://localhost:3000](http://localhost:3000)
- **OpenAPI (Swagger):** [http://localhost:3000/api/swagger-ui.html](http://localhost:3000/api/swagger-ui.html)
- **Altyapı Sağlık Kontrolü:** [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Actuator Health Probe:** [http://localhost:3000/api/actuator/health](http://localhost:3000/api/actuator/health)

---

## 🏗 Mimari ve Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS | Same-Origin göreli `/api` rotalaması, modern glassmorphism arayüzü |
| **Backend** | Java 21 LTS, Spring Boot 3.4.1 | Modüler monolit, Spring Security, Spring Session JDBC, OpenAPI |
| **Veritabanı** | PostgreSQL 16 Alpine | UTC zaman dilimi, pgcrypto UUID, Flyway sürüm kontrollü geçişler |
| **DevOps** | Docker Compose, Nginx | Multi-stage derlemeler, healthcheck mekanizmaları, kalıcı volume |

### 🔒 Güvenlik & Same-Origin Kuralı

Uygulama tam **Same-Origin** prensibiyle çalışır:
- Tarayıcı yalnızca `http://localhost:3000` ile konuşur.
- İstemci kodunda backend hostu veya portu (8080) hardcoded olarak yer almaz.
- Nginx statik dosyaları sunarken `/api/*` ve `/actuator/*` isteklerini backend container'ına reverse-proxy eder.
- Bu sayede CORS gereksinimi ortadan kalkar, `HttpOnly` ve `SameSite=Lax` cookie oturumları ile çift-gönderimli (double-submit) CSRF koruması (`X-XSRF-TOKEN`) güvenle kullanılır.

---

## 💾 Kalıcı Veriler ve Docker Yaşam Döngüsü

> [!CAUTION]
> **ÖNEMLİ VERİ GÜVENLİĞİ UYARISI:**
> - `docker compose down` komutu container'ları durdurur ve **veritabanı verilerinizi KORUR**.
> - `docker compose down -v` komutu ise `postgres_data` volume'unu ve **BÜTÜN VERİLERİNİZİ KALICI OLARAK SİLER**! Verilerinizi silmek istemiyorsanız kesinlikle `-v` parametresini kullanmayınız.

### Bilgisayar Açıldığında Otomatik Başlatma

Container'lar `restart: unless-stopped` politikasıyla yapılandırılmıştır. Bilgisayarınız yeniden başlatıldığında otomatik devreye girmesi için Docker Engine'in açılışta başlaması yeterlidir:

- **Linux (Ubuntu/Debian):**
  ```bash
  sudo systemctl enable docker
  ```
- **macOS & Windows:**
  Docker Desktop ayarlarından *"Start Docker Desktop when you log in"* seçeneğini işaretleyin.

---

## 📦 Yedekleme ve Geri Yükleme

Verileriniz kişisel olduğu için bağımsız yedekleme betikleri hazır olarak sunulmuştur:

### Veritabanı Yedeği Alma
```bash
./scripts/backup.sh
```
*Bu komut `backups/` dizini altına tarih damgalı `.dump` dosyası ve SHA-256 doğrulama özeti (`.sha256`) oluşturur.*

### Yedekten Geri Yükleme
```bash
./scripts/restore.sh backups/personal_workspace_YYYYMMDD_HHMMSS.dump
```
*Geri yükleme öncesinde SHA-256 özeti doğrulanır ve kullanıcı onayı istenir.*

---

## 🧪 Testleri Çalıştırma

### Backend Testleri
```bash
cd backend
./mvnw test
```

### Frontend Testleri
```bash
cd frontend
npm test
```
