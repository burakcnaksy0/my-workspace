# Personal Workspace — Mimari Karar Kayıtları (Architecture Decision Records)

Bu doküman, Personal Workspace geliştirme sürecinde alınan kritik mimari, teknik ve altyapı kararlarını, gerekçelerini ve değerlendirilen alternatifleri içerir.

---

## ADR-001: Build Aracı ve Java Sürümü Tercihi

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:** 
  - Backend derleme aracı olarak **Maven** seçildi ve repoya **Maven Wrapper (`mvnw`)** eklendi.
  - Java sürümü olarak **Java 21 LTS** ve Spring Boot sürümü olarak **Spring Boot 3.4.1** sabitlendi.
- **Gerekçe:**
  - Geliştirme ortamında Maven 3.8.7 ve Java 21 / 24 mevcutken Gradle bulunmamaktadır.
  - Spring Boot 3.4.1, Spring Framework 6.2 ve Spring Security 6.4 ile tam uyumludur, RFC 7807 ProblemDetail, Spring Session JDBC ve Jakarta EE 10 standartlarını eksiksiz destekler.
  - Maven Wrapper sayesinde harici Maven kurulumu gerekmeden her ortamda (yerel, CI/CD, Docker) deterministik derleme sağlanır.
- **Alternatifler:**
  - *Gradle:* Ortamda kurulu değildi, ek kurulum ve wrapper yapılandırması gerektirecekti.
  - *Spring Boot 3.3.x:* Destekleniyor olsa da 3.4.1 en güncel hata düzeltmelerini ve sanal iş parçacığı (virtual threads) optimizasyonlarını içermektedir.

---

## ADR-002: Frontend Kütüphane Uyumluluğu ve React Sürümü

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - Frontend için **React 18.3.1**, **TypeScript**, **Vite 6** ve **Tailwind CSS 3.4** tercih edildi.
  - Editör kütüphaneleri: `@tiptap/react` 2.x, `@excalidraw/excalidraw` 0.18.x, `@xyflow/react` 12.x ve `@dnd-kit/core` 6.x sürümleriyle çalışılacaktır.
- **Gerekçe:**
  - `@excalidraw/excalidraw` ve `@dnd-kit` ekosistemleri React 18 ile tam kararlılık ve sıfır tip/render uyuşmazlığı sunmaktadır.
  - React 19'un yeni derleyici ve ref kuralları bazı üçüncü parti canvas ve drag-drop paketlerinde geçici uyumsuzluklara yol açabilmektedir.
  - TanStack Query v5, React Router v6, React Hook Form ve Zod bu sürümle kusursuz entegre olur.
- **Alternatifler:**
  - *React 19:* İncelendi, bazı canvas kütüphanelerinde peer-dependency uyarıları riski bulunduğu için stabilite önceliklendirilerek React 18.3.1 seçildi.

---

## ADR-003: Same-Origin Kuralı ve Ağ Mimarisi

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - Tarayıcı yalnızca `http://localhost:3000` (veya `127.0.0.1:3000`) ile konuşacaktır.
  - Frontend kodu API isteklerini göreli `/api` önekiyle atar.
  - Nginx (Docker ortamında) `/api/` isteklerini backend servisine (`http://backend:8080`) reverse-proxy eder.
  - Geliştirme ortamında Vite (`vite.config.ts`) `server.proxy` ile `/api` isteklerini `http://localhost:8080`'e yönlendirir.
  - Backend portu (8080) host tarafına doğrudan açılmaz (sistemde Jenkins vb. diğer servislerin 8080'i kullanması durumunda çakışma önlenir).
- **Gerekçe:**
  - CORS karmaşıklığını ve güvenlik açıklarını tamamen ortadan kaldırır.
  - HttpOnly ve SameSite cookie tabanlı oturum güvenliğini en üst düzeye çıkarır.
  - Host port çakışmalarını (ör. hostta 8080 portunu kullanan Jenkins servisi) engeller.
- **Alternatifler:**
  - *Backend portunu hosta açıp CORS ile erişmek:* Güvenlik riskleri barındırır, port çakışmasına açıktır ve cookie izolasyonunu zayıflatır.

---

## ADR-004: Veritabanı Migration ve Kalıcılık Politikası

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - PostgreSQL 16 Alpine kullanılacak.
  - Veritabanı şema yönetimi **Flyway** ile yapılacaktır (`src/main/resources/db/migration/V*.sql`).
  - Hibernate `spring.jpa.hibernate.ddl-auto=validate` olarak ayarlanacak; Hibernate'in şema üretmesine veya değiştirmesine izin verilmeyecektir.
  - Docker'da veriler `postgres_data` named volume üzerinde saklanacaktır.
  - Docker Compose'da `restart: unless-stopped` politikası uygulanacaktır.
- **Gerekçe:**
  - Şema sürümleme ve deterministik veritabanı geçişleri garantilenir.
  - Container silinip yeniden oluşturulsa dahi verilerin korunması sağlanır.
- **Alternatifler:**
  - *ddl-auto=update:* Üretim ve kalıcı ortamlarda veri kaybı ve tutarsızlık riski taşır, kesinlikle reddedildi.

---

## ADR-005: Kimlik Doğrulama, Oturum Yönetimi ve Çoklu Çalışma Alanı İzolasyonu

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - Kimlik doğrulama için standart Spring Security Session-based auth ve **Spring Session JDBC** kullanıldı. Oturumlar veritabanında saklanır (`SPRING_SESSION`), backend yeniden başlatılsa bile oturumlar kaybolmaz.
  - Şifreler BCrypt (`BCryptPasswordEncoder`, strength 12) ile hashlenir.
  - Brute-force saldırılarına karşı IP/kullanıcı bazlı sliding-window kilit mekanizması (`LoginRateLimiter`) uygulandı (5 başarısız denemede 15 dakika kilitleme).
  - CSRF koruması `CookieCsrfTokenRepository.withHttpOnlyFalse()` ile yapılandırıldı; SameSite=Lax cookie ve XSRF token eşleşmesi zorunlu kılındı.
  - Çalışma alanı izolasyonu için `WorkspaceAccessService` merkezi servis katmanı yazıldı; her API çağrısında kullanıcının workspace üyeliği ve yetkisi doğrulanır.
- **Gerekçe:**
  - Local-first ve tarayıcı güvenliği için HttpOnly cookie + Session kimlik doğrulaması JWT'ye göre daha güvenlidir (token hırsızlığı riski yoktur).
  - Spring Session JDBC sayesinde container yeniden başlatmalarında kullanıcı oturumu düşmez.
- **Alternatifler:**
  - *Stateless JWT:* Localhost ortamında XSS durumunda local storage'dan çalınma riski bulunur ve session iptali (revocation) karmaşıktır.

---

## ADR-006: Görev Yönetimi (Tasks) ve İyimser Kilit (Optimistic Locking)

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - `tasks` tablosunda ve `Task` JPA entity'sinde JPA `@Version` alanı kullanıldı.
  - Görev güncellemelerinde istemci `version` numarasını göndermek zorundadır; uyuşmazlık durumunda RFC 7807 standardında `409 Conflict` dönülür.
  - Görev durumu `DONE` yapıldığında `completed_at` otomatik olarak UTC zaman damgasıyla atanır; durum `TODO` veya `IN_PROGRESS`'e geri çekilirse `completed_at` otomatik olarak `null` yapılır.
  - Dashboard istatistikleri ve görev listeleri indeksli sorgularla (`idx_tasks_workspace_status`, `idx_tasks_due_date`) optimize edildi.
- **Gerekçe:**
  - Sekmeler arası veya eşzamanlı güncellemelerde "son yazan kazanır" (lost update) veri kaybını önler.
  - Tamamlanma zamanı ve son tarih filtreleri dashboard agregasyonunun hızlı çalışmasını sağlar.
- **Alternatifler:**
  - *Pessimistic Locking:* Kullanıcı arayüzünde uzun süreli kilit tutmak performans ve deadlock sorunlarına yol açar.

---

## ADR-007: Zengin Metin Notlar (Tiptap), Otomatik Kayıt ve Arama İndeksi

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - Zengin metin editörü olarak React 18 ile tam uyumlu **Tiptap 2.x** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-table`) seçildi.
  - İçerik PostgreSQL'de yapılandırılmış JSON (`jsonb`) formatında saklanırken (`content`), arama ve kart özetleri için düz metin (`content_text`) alanı tutuldu.
  - Arama sorguları hem `title` hem de `content_text` üzerinde büyük/küçük harf duyarsız (`ILIKE`) ve etiket / alan filtreleriyle birlikte çalıştırılır.
  - İstemci tarafında `useAutosave` hook'u geliştirildi: 2000ms gecikmeli debounced otomatik kayıt, `Ctrl+S` / `Cmd+S` ile manuel kayıt ve anlık durum görselleştirmesi (`Kaydedildi`, `Kaydediliyor...`, `Kaydedilmemiş`, `Kayıt Hatası`) sağlandı.
  - Görevlerde olduğu gibi notlarda da `@Version` optimistik kilit uygulandı; eşzamanlı düzenleme çatışmaları `409 Conflict` ile yakalanıp kullanıcıya bildirilir.
- **Gerekçe:**
  - Tiptap, saf HTML saklama yerine yapılandırılmış JSON ağacı ürettiği için XSS açıklarını önler ve ileride blok/düğüm bazlı dönüşümlere (ör. panolara sürükleme) uygundur.
  - Düz metin (`content_text`) ayrıştırması JSON içindeki arama yavaşlığını ve format karmaşasını bertaraf eder.
- **Alternatifler:**
  - *Draft.js / Quill:* Eski API modelleri, React 18 ile hydration ve tip uyumsuzlukları nedeniyle elendi.

---

## ADR-008: Bağımsız Çizimler (Excalidraw), Sahne Sürümleme ve Boyut Sınırı

- **Tarih:** 2026-10-19
- **Durum:** Kabul Edildi
- **Karar:**
  - Bağımsız çizim ve teknik mimari diyagramları için `@excalidraw/excalidraw` (0.18.x) React 18 ile entegre edildi.
  - Excalidraw'ın sık tetiklenen `onChange` çağrıları, `getSceneVersion(elements)` hash kontrolü ile filtrelendi; yalnızca sahne elemanları gerçekten değiştiğinde `useAutosave` tetiklenir.
  - Çizimler arasında geçiş yapıldığında sahne kirlenmesini önlemek amacıyla `Excalidraw` bileşeni `key={drawing.id}` ile yeniden monte edilir.
  - Liste endpoint'i (`GET /api/workspaces/{workspaceId}/drawings`) büyük `document_data` JSONB verisini çekmez; `DrawingSummaryDto` projeksiyonu ile hafif meta veriler döner.
  - Backend tarafında çizim belgesi boyutu 10MB sınırı ile doğrulanır.
  - İstemci tarafında PNG, SVG vektör ve `.excalidraw` JSON formatlarında dışa aktarma (export) desteklendi.
- **Gerekçe:**
  - JSONB sütununda tam Excalidraw şemasının saklanması, çizimin kayıpsız ve yeniden düzenlenebilir kalmasını sağlar.
  - Hafif özet listesi sayesinde liste sayfalarında ağ ve bellek darboğazı yaşanmaz.
- **Alternatifler:**
  - *Canvas'ı saf PNG/JPEG olarak saklamak:* Düzenleme kabiliyetini yok eder, kesinlikle reddedildi.



