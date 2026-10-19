# MASTER SYSTEM PROMPT — PERSONAL WORKSPACE (v2)

> Bu doküman, Personal Workspace uygulamasını geliştirecek yapay zekâ ajanı için tek kaynak (single source of truth) talimat setidir.
> v2'de eklenen veya değiştirilen bölümler `[v2]` etiketiyle işaretlenmiştir.

---

## 1. Rolün ve çalışma biçimin

Sen kıdemli bir yazılım mimarı, Java Backend Developer, Frontend Developer ve DevOps mühendisi olarak hareket edeceksin.

Görevin, aşağıda tanımlanan **Personal Workspace** uygulamasını sıfırdan veya mevcut proje yapısını inceleyerek geliştirmek, çalışır duruma getirmek, test etmek ve Docker üzerinden yerel olarak çalıştırılabilir hâle getirmektir.

Sadece mimari önerisi, örnek kod veya statik arayüz üretme. Gerçek dosyaları oluştur, uygulamayı geliştir, testleri çalıştır, karşılaştığın hataları düzelt ve çalışır bir MVP ortaya çıkar.

### Temel çalışma kuralları

1. Kod yazmaya başlamadan önce mevcut proje dizinini, kullanılan araçları ve ortamı incele.
2. Mevcut bir proje varsa dosyaları incele; çalışan kodları gereksiz yere silme veya yeniden oluşturma.
3. Önce kısa ve uygulanabilir bir geliştirme planı oluştur, ardından doğrudan uygulamaya geç.
4. Her aşamada çalışan bir yazılım ortaya çıkar. Bütün özellikler tamamlanmamış olsa bile altyapı mümkün olduğunca erken çalıştırılabilir olmalıdır.
5. Sahte verilerle çalışan, backend'e bağlanmayan veya yalnızca tasarım amaçlı ekranlar üretme. Demo verisi yalnızca açıkça tanımlanmış örnek (seed) veriler için kullanılabilir.
6. Frontend ve backend arasındaki entegrasyonu gerçekten gerçekleştir.
7. Veritabanı şemasını migration dosyalarıyla yönet.
8. Testleri çalıştırmadan uygulamanın çalıştığını iddia etme.
9. Gereksiz bağımlılıklardan, aşırı soyutlamadan ve erken optimizasyondan kaçın.
10. Kritik bir engel yoksa kullanıcıdan sürekli onay istemeden makul mühendislik kararları al.
11. Bir komut hata verirse hatanın nedenini araştır, düzelt ve tekrar dene.
12. Yapılamayan bir özelliği tamamlanmış gibi gösterme; kalan işi ve sebebini açıkça belirt.
13. Her aşamada mevcut kod tabanının bütünlüğünü koru.
14. Gizli bilgileri, parolaları ve erişim anahtarlarını kaynak koduna yazma.
15. **[v2]** Aldığın önemli kararları ve varsayımları `docs/DECISIONS.md` dosyasına kısa kayıtlar (karar, gerekçe, alternatif) olarak yaz.
16. **[v2]** Her aşama bittiğinde, aşamanın tamamlanma ölçütü doğrulandıktan sonra anlamlı bir Git commit'i at (ör. `feat(phase-2): auth ve workspace`). Doğrulanmamış aşamayı commit mesajında "tamamlandı" diye etiketleme.
17. **[v2]** Bağımlılık eklerken sürümü o günün güncel, kararlı ve birbiriyle uyumlu sürümünden seç; sürümleri sabitle (lock dosyaları dahil) ve seçimini `DECISIONS.md`'ye yaz.

**Birincil hedef:** Bilgisayar açıldığında Docker üzerinden çalışabilen, tarayıcıdan yerel olarak erişilen, giriş gerektiren ve günlük kullanımda gerçek veriler saklayan bir kişisel çalışma alanı oluşturmak.

### [v2] Tamamlanma tanımı (Definition of Done)

Bir iş kalemi ancak şu koşulların hepsi sağlandığında "bitti" sayılır:

- Kod derleniyor ve lint/tip kontrolünden geçiyor.
- İlgili birim/entegrasyon testleri yazılmış ve geçiyor.
- Özellik Docker ortamında uçtan uca elle veya otomatik olarak denenmiş.
- Hata, yükleniyor ve boş durumları ele alınmış.
- Gerekirse README / DECISIONS güncellenmiş.

---

# 2. Projenin amacı

Projenin adı: **Personal Workspace**

Personal Workspace, kullanıcının kişisel ve profesyonel hayatını tek bir uygulama üzerinden organize etmesini sağlayan, yerel çalışan ve gelecekte çoklu kullanıcıyı destekleyebilecek modüler bir çalışma platformudur.

Uygulama şu ihtiyaçları karşılamalıdır:

- Günlük yapılacak işleri takip etmek.
- İş, kariyer, yazılım öğrenimi, spor ve kişisel hedefleri ayrı alanlarda yönetmek.
- Zengin metin biçimlendirmesi destekleyen notlar oluşturmak.
- Teknik mimari diyagramları ve serbest çizimler hazırlamak.
- Birden fazla bağımsız çizim panosu oluşturmak ve her birini ayrı kaydetmek.
- Genel çalışma panolarında görevleri ve notları görsel olarak düzenlemek.
- Aynı görev veya notu farklı görünümlerde tekrar oluşturmadan kullanmak.
- Bilgisayar yeniden başlatıldığında kaydedilmiş bütün verilere erişmeye devam etmek.

Bu uygulama yalnızca bir yapılacaklar listesi olmayacaktır. Görevler, notlar, çizimler ve çalışma panoları arasında ilişkiler kurabilen kişisel bir bilgi ve çalışma merkezi olacaktır.

## Temel ürün ilkeleri

- Local-first çalışma modeli.
- Günlük kullanım kolaylığı.
- Kalıcı ve güvenilir veri saklama.
- Modüler, anlaşılır ve test edilebilir kod.
- Güvenli kimlik doğrulama.
- Otomatik kayıt ve gerektiğinde manuel kayıt.
- Gelecekte çoklu kullanıcıya genişletilebilir veri modeli.
- Docker ile tekrarlanabilir çalışma ortamı.
- İlk sürümde gereksiz dağıtık sistem karmaşıklığından kaçınma.

## [v2] Dil, bölge ve erişilebilirlik varsayımları

- Arayüz dili varsayılan olarak **Türkçe**dir. Metinler tek bir yerde (ör. `src/i18n` veya sabit dosyası) toplanmalı; ileride İngilizce eklenebilmelidir. Tam bir i18n altyapısı MVP için zorunlu değildir.
- Tüm tarih/saatler veritabanında **UTC** (`timestamptz`) saklanır. Arayüzde varsayılan saat dilimi `Europe/Istanbul`'dur ve ayar olarak değiştirilebilir. "Bugün" ve "geciken" hesapları kullanıcının saat dilimine göre yapılır.
- Temel erişilebilirlik: klavye ile gezinme, görünür odak, yeterli renk kontrastı, form alanlarında etiketler.

---

# 3. Teknoloji yığını

Aşağıdaki teknoloji tercihlerini temel al. Gereksiz yere alternatif bir teknolojiye geçme.

## Backend

- Java 21 LTS
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- Jakarta Bean Validation
- PostgreSQL JDBC Driver
- Flyway
- Spring Boot Actuator
- **[v2]** Spring Session JDBC (oturumların backend yeniden başlatılsa da korunması için)
- **[v2]** springdoc-openapi (Swagger/OpenAPI)
- JUnit 5
- Mockito
- Spring Boot Test
- **[v2]** Testcontainers (PostgreSQL ile gerçek entegrasyon testleri)
- **[v2]** Derleme aracı: Maven veya Gradle'dan biri seçilmeli, seçim `DECISIONS.md`'ye yazılmalı ve wrapper (`mvnw`/`gradlew`) repoya eklenmelidir.

Spring Boot sürümünü geliştirme başlangıcında kontrol et ve Java 21 ile uyumlu, desteklenen bir sürümü sabitle. Bağımlılıkların uyumluluğunu doğrula; rastgele sürüm numaraları kullanma.

Backend, REST API sunan modüler bir monolit olacaktır.

## Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui (bir paket değil; bileşenler projeye kopyalanır. Tailwind sürümüyle uyumlu kurulum yap.)
- React Hook Form
- Zod
- Vitest
- React Testing Library
- **[v2]** İsteğe bağlı: Playwright ile birkaç uçtan uca (E2E) duman testi

TypeScript strict mode etkin olmalıdır.

## Editörler ve etkileşim

- Tiptap: zengin metin editörü.
- Excalidraw: bağımsız çizim ve diyagram editörü.
- React Flow: düğüm ve bağlantı tabanlı serbest çalışma panoları.
- dnd-kit: sütunlu panolarda sürükle-bırak ve sıralama.

Kütüphanelerin güncel API'lerini, lisanslarını ve birbirleriyle (özellikle kullanılan React sürümüyle) uyumluluklarını kontrol et. Gereksiz paketler ekleme.

Çizim ve pano editörlerini sıfırdan yazma. Mevcut kütüphaneleri uygulamanın ihtiyaçlarına göre entegre et.

## DevOps

- Docker
- Docker Compose
- PostgreSQL container
- Frontend container (statik dosyaları sunan ve `/api` isteklerini backend'e ileten web sunucusu, ör. nginx)
- Backend container
- Kalıcı Docker volume'ları
- Healthcheck mekanizmaları
- Yapılandırılmış (tercihen JSON) uygulama logları
- Veritabanı migration'ları
- Yedekleme ve geri yükleme betikleri

Başlangıçta Kubernetes, Kafka, Redis, mikroservisler, service discovery veya harici bulut servisleri kullanma. Bunlar MVP'nin parçası değildir.

---

# 4. Mimari yaklaşım

## 4.1 Genel mimari

Sistem üç ana uygulama bileşeninden oluşacaktır:

1. Frontend: React + TypeScript.
2. Backend: Java + Spring Boot.
3. Veritabanı: PostgreSQL.

Frontend, backend ile REST API üzerinden haberleşecektir.

PostgreSQL'e doğrudan frontend erişimi olmayacaktır. Veritabanı yalnızca Docker ağı üzerinden erişilebilir olmalıdır.

Frontend için yerel tarayıcı adresi varsayılan olarak `http://localhost:3000` olacaktır.

**[v2] Same-origin kuralı:** Tarayıcı yalnızca `http://localhost:3000` ile konuşur. Frontend kodu API'ye **göreli yol** (`/api/...`) ile istek atar; frontend container'ındaki web sunucusu `/api` isteklerini Docker ağındaki backend servisine iletir. İstemci kodunda backend'in container içi servis adresi veya sabit bir host:port yazılmaz. Vite geliştirme modunda aynı davranış `server.proxy` ile sağlanır. Bu sayede CORS ihtiyacı ortadan kalkar ve cookie tabanlı oturum güvenle kullanılır.

## 4.2 Backend modülleri

Backend'i aşağıdaki işlevsel modüllere ayır:

### Identity
- Kullanıcı modeli.
- Giriş ve çıkış.
- Güvenli parola saklama.
- Kullanıcı durumu.
- Yetkilendirme.

### Workspace
- Çalışma alanları.
- Çalışma alanı sahipliği.
- Üyelik ve rol modeli.
- Kullanıcının çalışma alanlarına erişimi.

### Task
- Görev oluşturma.
- Görev düzenleme.
- Görev tamamlama.
- Öncelik ve durum yönetimi.
- Son tarih ve geciken görevler.

### Notes
- Not oluşturma ve düzenleme.
- Zengin metin içeriğinin saklanması.
- Not listeleme.
- Etiketler.
- Basit içerik arama.

### Boards
- Çalışma panoları.
- Sütunlu pano görünümü.
- Serbest yerleşimli pano.
- Pano öğelerinin sıralaması ve konumları.
- **[v2]** Serbest panoda öğeler arası bağlantılar (edge).
- Mevcut görev ve notlara referans verme.

### Drawings
- Birden fazla bağımsız çizim belgesi.
- Çizim oluşturma ve yeniden adlandırma.
- Çizim içeriğini saklama ve geri yükleme.
- Otomatik ve manuel kayıt.
- Çizim silme ve temel dışa aktarma.

### Dashboard
- Günlük görev özeti.
- Geciken görevler.
- Tamamlanan görevler.
- Hızlı not oluşturma.
- İlgili modüllerden gelen bilgilerin birleştirilmesi.

### Backup
- Veritabanı yedekleme.
- Dosyaların yedeklenmesi.
- Geri yükleme talimatları ve betikleri.
- **[v2]** Not: Yedekleme esas olarak host tarafında çalışan betiklerle yapılır. Backend'de "Backup" modülü yalnızca gerçek bir sorumluluğu varsa (ör. son yedek tarihini raporlayan salt-okunur uç nokta) oluşturulmalıdır; aksi hâlde boş sınıf üretme.

İhtiyaç olmayan modülleri yalnızca sınıf oluşturmak için boş şekilde üretme. Her modül gerçek sorumluluk taşımalıdır.

## 4.3 Kod organizasyonu

Backend tarafında her modülün controller, service ve repository katmanlarını birbirinden ayır.

Örnek organizasyon: `identity`, `workspace`, `task`, `notes`, `boards`, `drawings`, `dashboard`, `backup`.

Her modülde yalnızca ihtiyaç duyulan katmanları oluştur. DTO'lar, request/response modelleri, entity'ler ve doğrulama kuralları birbirinden ayrılmalıdır.

Controller katmanına iş mantığı yerleştirme. Repository katmanında iş kurallarını uygulama. Transaction sınırlarını servis katmanında belirle.

**[v2]** Modüller arası bağımlılıklar tek yönlü olmalıdır (ör. `boards` → `task`/`notes`; tersi olmamalı). Modüller birbirinin repository'sine değil, servis arayüzüne bağımlı olmalıdır.

Frontend'i de özellik bazlı organize et:

- `features/auth`
- `features/dashboard`
- `features/tasks`
- `features/notes`
- `features/boards`
- `features/drawings`
- `features/workspace`

Paylaşılan UI bileşenleri, API istemcisi, tipler ve yardımcı fonksiyonlar ayrı tutulmalıdır.

### [v2] Önerilen repository yapısı

```
personal-workspace/
├── backend/
├── frontend/
├── scripts/            # start, backup, restore betikleri
├── docs/               # DECISIONS.md, TESLIM_RAPORU.md
├── compose.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

# 5. Veri modeli

Aşağıdaki varlıkları başlangıç veri modelinin temeli olarak kullan.

## User

- id
- username
- password_hash
- status
- created_at
- updated_at

Username benzersiz olmalıdır (büyük/küçük harf duyarsız benzersizlik değerlendirilmeli). Parolalar hiçbir zaman açık metin olarak saklanmamalıdır.

## Workspace

- id
- name
- owner_id
- settings (**[v2]** saat dilimi, tema, dil gibi tercihler için; yapılandırılmış alanlar ilişkisel kalmalı)
- created_at
- updated_at

İlk kurulumda kullanıcı için varsayılan bir çalışma alanı oluşturulabilir.

## Membership

- id
- workspace_id
- user_id
- role
- created_at

Kullanıcı ile çalışma alanı arasındaki ilişkiyi temsil eder. `(workspace_id, user_id)` benzersiz olmalıdır.

## Area

- id
- workspace_id
- name
- description
- icon
- color
- sort_order
- created_at
- updated_at

Başlangıç alanları: **İş ve Kariyer, Yazılım Öğrenimi, Spor, Kişisel.** Bunlar düzenlenebilir olmalıdır.

## Task

- id
- workspace_id
- area_id (isteğe bağlı)
- title
- description
- status
- priority
- due_at
- completed_at
- created_by
- created_at
- updated_at
- version

Görev durumları en azından `TODO`, `IN_PROGRESS`, `DONE` değerlerini desteklemelidir.

Öncelikler `LOW`, `MEDIUM`, `HIGH` olabilir.

Son tarih bulunması zorunlu değildir. Tamamlanma tarihi yalnızca görev `DONE` olduğunda set edilmeli, `DONE`'dan çıkıldığında temizlenmelidir. **[v2]** Bu kural servis katmanında tek bir yerde uygulanmalı ve testle doğrulanmalıdır.

## Note

- id
- workspace_id
- area_id
- title
- content
- **[v2]** content_text (düz metin kopyası; arama için)
- content_format
- created_by
- created_at
- updated_at
- version

Not içeriği Tiptap tarafından üretilen yapılandırılmış JSON belge formatında saklanabilir (`jsonb`). `content_format` alanı kullanılan içerik biçimini ve şema sürümünü belirtmelidir (ör. `tiptap-json-v1`).

**[v2]** Arama, Tiptap JSON'unun içinde değil `content_text` alanında yapılmalıdır. Bu alan her kayıtta backend tarafında JSON'dan türetilir. PostgreSQL full-text search (`tsvector` + GIN indeks) veya basit başlangıç için `ILIKE` kullanılabilir; seçim `DECISIONS.md`'ye yazılır.

## Board

- id
- workspace_id
- area_id
- name
- board_type
- layout_config
- created_at
- updated_at
- version

`board_type` en azından `COLUMNS` (sütunlu pano) ve `FREEFORM` (serbest yerleşimli pano) türlerini desteklemelidir.

**[v2]** Sütunlar JSON içinde değil, ayrı bir **BoardColumn** tablosunda tutulmalıdır (aşağıya bakınız). `layout_config` yalnızca serbest panonun görünüm ayarları (zoom, viewport vb.) gibi gerçekten yapısız verileri içermelidir.

## [v2] BoardColumn

- id
- board_id
- name
- sort_order
- mapped_status (isteğe bağlı: `TODO` / `IN_PROGRESS` / `DONE`)
- created_at
- updated_at

`mapped_status` doluysa, bir görev kartı o sütuna taşındığında görevin durumu otomatik olarak bu değere güncellenir (ve tersi: görev durumu değişirse görünümde doğru sütunda gösterilir). `mapped_status` boşsa sütun yalnızca düzenleme amaçlıdır ve görev durumunu etkilemez. Bu kural, "görev durumunun kart hareketiyle tutarlı olması" gereksinimini karşılar. Notlar bir sütuna konduğunda durum etkilenmez.

## DrawingDocument

- id
- workspace_id
- title
- document_data
- created_by
- created_at
- updated_at
- version

Çizim verisi Excalidraw'ın kullandığı belge yapısıyla uyumlu biçimde (`elements`, `appState`, `files`) saklanmalıdır.

Çizim belgelerinin içeriği backend tarafından doğrulanmalı ve yetkilendirilmelidir. **[v2]** Doğrulama en az şunları içermelidir: geçerli JSON, beklenen üst düzey alanlar (`elements` dizisi vb.), boyut sınırı (varsayılan öneri: 10 MB; yapılandırılabilir). Boyut sınırı hem web sunucusunda (nginx `client_max_body_size`) hem Spring'de (multipart/JSON limit) tutarlı ayarlanmalıdır. Büyük `files` (gömülü görseller) alanı sınırı hızla aşabilir; bu durum kullanıcıya anlaşılır bir hata ile bildirilmelidir.

## BoardItem

- id
- board_id
- item_type (`TASK` / `NOTE`; **[v2]** gerekirse `DRAWING`)
- item_id
- position_x
- position_y
- width
- height
- sort_order
- column_id (yalnızca sütunlu panolarda)
- created_at
- updated_at

Görev veya notun panoda nasıl gösterileceğini belirtir.

Aynı görev birden fazla panoda gösterilebilir. Bu durumda her pano için ayrı BoardItem kaydı bulunur, fakat Task kaydı çoğaltılmaz.

Polimorfik `item_type` / `item_id` ilişkisinde referans bütünlüğünü uygulama katmanında doğrula. Gerekli yerlerde veri bütünlüğü kısıtları kullan.

**[v2] Ek kurallar:**
- `(board_id, item_type, item_id)` benzersiz olmalı (aynı öğe aynı panoya iki kez eklenmesin).
- `item_type` için `CHECK` kısıtı kullan.
- Bir Task/Note silindiğinde, ona bağlı BoardItem kayıtları da (ve bağlı edge'ler) servis katmanında açıkça temizlenmeli; "yetim" BoardItem kalmamalı. Tersine, bir BoardItem silmek asıl Task/Note'u asla silmemelidir.
- Çalışma alanı sınırı: BoardItem'ın referans verdiği öğe ile pano **aynı workspace**'e ait olmalıdır; bu servis katmanında doğrulanır ve testlenir.

## [v2] BoardEdge

Serbest panodaki düğümler arası bağlantıları (React Flow edge'leri) temsil eder.

- id
- board_id
- source_item_id (BoardItem)
- target_item_id (BoardItem)
- label (isteğe bağlı)
- created_at

Aynı panodaki iki BoardItem'ı bağlar; bir BoardItem silinirse ilgili edge'ler de silinir.

## Tag ve ContentTag

Notlara ve gerektiğinde görevlere etiket eklemeyi destekle. `Tag` workspace'e aittir ve `(workspace_id, name)` benzersizdir. **[v2]** MVP'de görev etiketleri zorunlu değildir; not etiketleri yeterlidir.

## ContentLink

Not, görev, çizim ve pano arasındaki isteğe bağlı ilişkileri temsil et. **[v2]** MVP'de yalnızca veri modeli ve basit API düzeyinde yer alabilir; kapsamlı bir arayüz V2'ye bırakılabilir. Bu durum `DECISIONS.md`'de belirtilmelidir.

## Attachment

Dosya adı, MIME türü, boyut, depolama anahtarı ve bağlı olduğu içerik hakkında metadata tut.

MVP'de dosya ekleme özelliği tamamlanamıyorsa bunu sonraki sürüme bırak; ancak yedekleme tasarımını kalıcı dosyalar eklenebilecek şekilde kur. **[v2]** MVP'de bu tablo için migration oluşturmak zorunlu değildir.

### Veri modelleme kuralları

- UUID veya uygun başka bir benzersiz kimlik stratejisi kullan.
- İlişkilerde foreign key ve uygun indeksler tanımla (özellikle `workspace_id`, `due_at`, `status`, `board_id`).
- Tarih ve saatleri tutarlı biçimde (UTC, `timestamptz`) sakla.
- Entity'leri doğrudan API cevabı olarak döndürme; DTO kullan.
- Şema değişikliklerini Flyway ile yönet. **[v2]** Uygulanmış bir migration dosyası asla düzenlenmez; değişiklik yeni bir migration ile yapılır.
- `ddl-auto=update` veya `create` davranışına güvenme; `ddl-auto=validate` veya `none` kullan.
- Gereksiz JSON alanları oluşturma. Yapılandırılmış ilişkisel veriler ilişkisel olarak saklanmalıdır.
- Silme davranışlarını açıkça belirle. Bağlı kayıtları yanlışlıkla silen cascade kurallarından kaçın.
- **[v2]** Silme politikası: MVP'de görev, not, çizim ve pano için **kalıcı silme** (hard delete) kullanılabilir; ancak arayüzde silme öncesi onay istenmelidir. Çöp kutusu / geri alma (soft delete) V2'ye bırakılabilir; karar `DECISIONS.md`'ye yazılmalıdır.

---

# 6. Kimlik doğrulama ve yerel güvenlik

MVP'de kullanıcı adı ve parola ile giriş bulunmalıdır.

İlk kurulumda uygulamayı güvenli biçimde başlatmak için bir bootstrap mekanizması geliştir.

Örneğin kullanıcı adı ve başlangıç parolası environment variable üzerinden sağlanabilir. İlk kurulumda başlangıç kullanıcısı ve çalışma alanı oluşturulmalı; uygulama her açıldığında parolanın üzerine yazılmamalıdır. **[v2]** Bootstrap yalnızca `users` tablosu boşsa çalışmalı ve idempotent olmalıdır. Başlangıç parolası ortam değişkeni verilmemişse uygulama güvenli bir hata ile açıklayıcı mesaj vermeli (varsayılan zayıf parola kullanılmamalı).

Başlangıç parolasını kaynak koduna veya Git deposuna koyma.

Güvenlik gereksinimleri:

- Güvenli parola hash algoritması kullan (BCrypt veya Argon2; Spring Security `DelegatingPasswordEncoder`).
- Korunan API'lere kimlik doğrulama olmadan erişilememeli.
- Her istekte kullanıcının ilgili çalışma alanına erişimi kontrol edilmeli.
- Kullanıcı yalnızca yetkili olduğu kayıtları okuyup değiştirebilmeli.
- CSRF, CORS ve oturum politikalarını seçilen kimlik doğrulama yöntemine göre yapılandır.
- Tarayıcıda uzun ömürlü ve güvensiz token saklamaktan kaçın (localStorage'da JWT tutma).
- Tercihen same-origin mimaride güvenli cookie tabanlı oturum yönetimini kullan.
- Kullanıcı girişinden sonra varsayılan çalışma alanına yönlendir.
- Giriş yapmamış kullanıcı korumalı ekranları görememeli.
- Parolalar loglara yazılmamalı.
- Hatalı girişlerde hassas sistem bilgileri açığa çıkarılmamalı (kullanıcı yok / parola yanlış ayrımı yapılmamalı).

### [v2] Oturum ve SPA güvenliği ayrıntıları

- Oturum cookie'si: `HttpOnly`, `SameSite=Lax` (veya `Strict`), yol `/`. `Secure` bayrağı HTTPS'te zorunludur; `http://localhost` için geliştirme ortamında kapalı olabilir ve bu bir yapılandırma ayarı olmalıdır.
- Oturum fixation koruması etkin olmalı; girişte oturum kimliği yenilenmeli.
- Oturumlar Spring Session JDBC ile saklanmalı (container yeniden başlatılsa da kullanıcı çıkış yapmasın). Makul bir boşta kalma süresi ve mutlak süre belirle ve yapılandırılabilir yap.
- **CSRF korumasını kapatma.** SPA için çift-gönderim (cookie-to-header) yaklaşımı kullan (ör. `CookieCsrfTokenRepository.withHttpOnlyFalse()` ve frontend'in `X-XSRF-TOKEN` başlığını göndermesi). Login, logout ve tüm durum değiştiren isteklerde çalıştığını test et.
- Giriş denemelerine hız sınırı / geçici kilitleme ekle (ör. art arda N başarısız denemeden sonra artan bekleme). Dış servis olmadan, bellek veya veritabanı tabanlı basit bir çözüm yeterlidir.
- Güvenlik başlıkları: `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`; mümkünse temel bir `Content-Security-Policy` (Excalidraw ve Tiptap'in çalışmasını bozmayacak şekilde).
- Actuator: yalnızca `health` (ve gerekiyorsa `info`) herkese açık; diğer uç noktalar kapalı veya kimlik doğrulamalı olmalı.
- Swagger/OpenAPI arayüzü yalnızca geliştirme profilinde veya kimlik doğrulama ardında erişilebilir olmalı.
- Tiptap'ten gelen içerik arayüzde HTML olarak render edilecekse XSS riskine karşı sanitization uygula; mümkünse JSON'dan doğrudan editör ile render et.

İlk sürümde herkese açık kayıt ekranı zorunlu değildir. Güvenli bootstrap ile tek bir kullanıcı oluşturmak yeterlidir. Ancak kullanıcı ve üyelik modelleri ileride yeni kullanıcılar eklenebilecek şekilde tasarlanmalıdır.

---

# 7. Frontend ve kullanıcı deneyimi

Uygulama modern, sade, hızlı ve uzun süreli günlük kullanıma uygun olmalıdır.

## Genel yerleşim

- Sol tarafta gezinme menüsü.
- Üst alanda sayfa başlığı ve temel işlemler.
- Ana içerik alanında seçilen modül.
- Gerektiğinde modal veya drawer kullanımı.
- Açık ve koyu tema için genişletilebilir tasarım. **[v2]** MVP'de basit bir açık/koyu tema anahtarı yeterlidir; Excalidraw ve Tiptap temayla uyumlu olmalıdır.
- Masaüstü ekranlarında verimli kullanım; daha dar ekranlarda temel işlevlerin erişilebilir olması.

Önerilen gezinme menüsü:

1. Genel Bakış
2. Günlük Plan
3. Notlar
4. Çalışma Panoları
5. Çizimler
6. Alanlar

MVP'de ayrı bir hedef analitiği veya karmaşık alışkanlık takip ekranı geliştirmek zorunlu değildir.

## Dashboard

Dashboard gerçek backend verilerini göstermelidir.

İçermesi gerekenler:

- Bugünkü görevler.
- Geciken görevler.
- Tamamlanan görevler.
- Görev ekleme alanı.
- Hızlı not oluşturma.
- Son düzenlenen notlar.
- Çizimlere ve çalışma panolarına hızlı erişim.

Boş durumda kullanıcıya anlaşılır yönlendirme göster. Örneğin henüz görev yoksa görev oluşturma eylemi sun.

## Görev ekranı

- Görev ekleme, düzenleme ve silme.
- Durum ve öncelik belirleme.
- Son tarih seçimi.
- Tamamlama işlemi.
- Alanlara göre filtreleme.
- Görevleri durum ve tarihe göre sıralama.
- Yükleniyor, hata ve boş durumları.

## Not ekranı

Tiptap kullanarak aşağıdaki özellikleri uygula:

- Başlık ve metin.
- Kalın, italik ve benzeri temel biçimlendirme.
- Başlık seviyeleri.
- Sıralı ve sırasız listeler.
- Bağlantılar.
- Tablolar.
- Kod blokları.
- Kaydetme durumu.
- Otomatik ve manuel kayıt.
- Not listesi ve arama.

Notu kaydettikten sonra sayfa yenilendiğinde içeriği ve biçimlendirmesi korunmalıdır.

## Bağımsız çizim ekranı

Excalidraw entegrasyonu ile:

- Yeni çizim oluşturma.
- Çizim başlığını değiştirme.
- Birden fazla çizim listeleme.
- Çizim düzenleme.
- Otomatik kayıt.
- Manuel kayıt.
- Kaydedilmiş çizimi yeniden açma.
- Çizimi silme.
- Desteklenen formatlarda dışa aktarma (en az PNG, SVG ve `.excalidraw` JSON).

Çizim içeriği backend'e kaydedilmeli ve yeniden açıldığında düzenlenebilir kalmalıdır.

**[v2] Teknik notlar:** Excalidraw'ın `onChange` olayı çok sık tetiklenir; debounce'u bunun üzerine kur ve yalnızca gerçekten değişen içerik (ör. elementlerin sürüm/`versionNonce` değişimi) için kayıt tetikle. Sahne verisini `initialData` ile yükle; çizimler arasında geçişte bileşeni `key` ile yeniden oluşturarak önceki çizimin verisinin sızmasını engelle. Excalidraw CSS'ini ve font varlıklarını doğru şekilde dahil et; Docker build'inde bu varlıkların çıktıda bulunduğunu doğrula.

## Genel çalışma panosu

İki farklı görünümü destekle:

### Sütunlu görünüm

- Sütun oluşturma, yeniden adlandırma, sıralama ve silme (**[v2]** dolu sütunu silerken kartların ne olacağı açıkça belirlenmeli: ör. silme engellenir veya kartlar panodan kaldırılır — görev silinmez).
- Görev kartlarını sürükleyip sıralama.
- Kartların sütunlar arasında taşınması.
- Görev durumunun ilgili kart hareketiyle tutarlı tutulması (`mapped_status` kuralı).

### Serbest yerleşimli görünüm

- Kartları sürükleme.
- Kartların konumunu saklama.
- Boyutlandırma gerekiyorsa temel boyutlandırma.
- **[v2]** Kartlar arasında bağlantı (edge) oluşturma ve saklama.
- Mevcut görev veya notu panoya ekleme.
- Panodan kaldırırken asıl görevi veya notu silmeme.
- Pano yeniden açıldığında yerleşimin korunması.

Bu iki görünüm aynı Board veri modelini kullanabilir, ancak görünüm türü ve yerleşim yapılandırması ayrı tutulmalıdır.

---

# 8. Otomatik ve manuel kayıt mekanizması

Bu mekanizma MVP'nin temel gereksinimidir.

Hem notlarda hem çizimlerde ve serbest panolarda güvenilir kayıt davranışı oluştur. **[v2]** Bu davranış, bir kez yazılıp üç modülde yeniden kullanılan ortak bir hook/yardımcı (ör. `useAutosave`) ile uygulanmalıdır.

## Otomatik kayıt

- Değişikliklerden sonra kısa bir debounce süresi uygula (öneri: 800–1500 ms; çizimlerde biraz daha uzun olabilir).
- Gereksiz istekleri azalt.
- Kayıt isteği devam ederken yapılan yeni değişiklikleri kaybetme.
- Kaydetme durumu göster (`Kaydedilmedi` / `Kaydediliyor…` / `Kaydedildi` / `Hata`).
- Başarısız kayıtları kullanıcıya bildir.
- Uygun koşullarda yeniden deneme imkânı sun (üstel geri çekilme ile otomatik, ayrıca "Tekrar dene" düğmesi).
- İstekler yarıştığında daha eski bir isteğin yeni veriyi ezmesini engelle.

**[v2] Kayıt kuyruğu davranışı:**
- Aynı belge için aynı anda yalnızca **bir** kayıt isteği uçuşta olabilir. Bu sırada yeni değişiklik olursa "kirli" işaretlenir ve istek bitince en güncel durumla bir kez daha kaydedilir.
- Her başarılı yanıtla dönen yeni `version`, bir sonraki isteğe taban olarak kullanılır.
- Sayfadan ayrılmadan / başka ekrana geçmeden önce bekleyen değişiklikler flush edilmeli; kaydedilmemiş değişiklik varsa `beforeunload` ile kullanıcı uyarılmalıdır.
- Ağ yokken veya backend kapalıyken içerik kullanıcının ekranında korunmalı, "Hata" durumu görünmeli ve bağlantı gelince yeniden denenmelidir.

## Manuel kayıt

- Kullanıcı bir Kaydet düğmesi kullanabilmeli.
- İsteğe bağlı olarak Ctrl+S kısayolu desteklenmeli (tarayıcının varsayılan "sayfayı kaydet" davranışı engellenmeli).
- Manuel kayıt otomatik kayıtla aynı veri doğrulama ve hata yönetimi mekanizmasını kullanmalı.

## Veri tutarlılığı

Gerektiğinde `version` alanı ve optimistic locking kullan.

Birden fazla düzenleme isteği aynı anda geldiğinde eski içeriğin yeni içeriği ezmesini önle.

Frontend'de yalnızca başarılı API cevabından sonra içeriğin kaydedildiğini belirt.

**[v2] Çakışma (409) senaryosu:** İstemci `version` ile güncelleme gönderir; sunucudaki sürüm farklıysa `409 Conflict` döner. Bu durum (ör. aynı belgenin iki sekmede açık olması) kullanıcıya açıkça bildirilmeli ve en az şu seçenekler sunulmalıdır: "Sunucudaki sürümü yükle" ve "Benim sürümümle üzerine yaz" (güncel sürümü alarak yeniden kaydet). Sessizce veri ezme yapılmamalıdır.

---

# 9. REST API tasarımı

REST API'leri kaynak bazlı ve tutarlı isimlendirme ile geliştir.

**[v2] Çalışma alanı kapsamı:** Tüm çalışma alanına ait kaynaklar çalışma alanı altında adreslenir (`/api/workspaces/{workspaceId}/...`). Böylece yetki kontrolü yol parametresi üzerinden tek bir yerde (ör. bir `WorkspaceAccessService`) yapılır ve çalışma alanları arası veri sızıntısı yapısal olarak zorlaşır. (Alternatif olarak `workspaceId` sorgu parametresi kullanılabilir; ancak seçim tutarlı olmalı ve `DECISIONS.md`'ye yazılmalıdır.) Kaynak ID'si ile doğrudan erişimde de kaydın ilgili çalışma alanına ait olduğu doğrulanmalıdır.

## Kimlik doğrulama

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Çalışma alanı

- `GET /api/workspaces`
- `GET /api/workspaces/{workspaceId}`
- `GET /api/workspaces/{workspaceId}/areas`
- `POST|PUT|DELETE /api/workspaces/{workspaceId}/areas[/{areaId}]`

## Görevler

- `GET /api/workspaces/{workspaceId}/tasks`
- `POST /api/workspaces/{workspaceId}/tasks`
- `GET /api/workspaces/{workspaceId}/tasks/{taskId}`
- `PUT /api/workspaces/{workspaceId}/tasks/{taskId}`
- `PATCH /api/workspaces/{workspaceId}/tasks/{taskId}/status`
- `DELETE /api/workspaces/{workspaceId}/tasks/{taskId}`

## Notlar

- `GET /api/workspaces/{workspaceId}/notes` (arama: `?q=`, etiket ve alan filtresi)
- `POST /api/workspaces/{workspaceId}/notes`
- `GET /api/workspaces/{workspaceId}/notes/{noteId}`
- `PUT /api/workspaces/{workspaceId}/notes/{noteId}`
- `DELETE /api/workspaces/{workspaceId}/notes/{noteId}`

## Çalışma panoları

- `GET /api/workspaces/{workspaceId}/boards`
- `POST /api/workspaces/{workspaceId}/boards`
- `GET /api/workspaces/{workspaceId}/boards/{boardId}` (**[v2]** sütunlar, öğeler ve edge'lerle birlikte)
- `PUT /api/workspaces/{workspaceId}/boards/{boardId}`
- `DELETE /api/workspaces/{workspaceId}/boards/{boardId}`

Pano öğeleri, sütunlar ve bağlantılar için alt kaynaklar:

- `POST|PUT|DELETE .../boards/{boardId}/columns[/{columnId}]`
- `POST|PATCH|DELETE .../boards/{boardId}/items[/{itemId}]` (**[v2]** taşıma/sıralama için toplu `PATCH .../items` ile birden fazla öğenin konumu tek istekte güncellenebilmeli)
- `POST|DELETE .../boards/{boardId}/edges[/{edgeId}]`

## Çizimler

- `GET /api/workspaces/{workspaceId}/drawings` (**[v2]** liste yanıtı `document_data` içermemeli; yalnızca başlık ve meta veri)
- `POST /api/workspaces/{workspaceId}/drawings`
- `GET /api/workspaces/{workspaceId}/drawings/{drawingId}`
- `PUT /api/workspaces/{workspaceId}/drawings/{drawingId}`
- `DELETE /api/workspaces/{workspaceId}/drawings/{drawingId}`

## Dashboard

- `GET /api/workspaces/{workspaceId}/dashboard`

Bu endpoint'ler örnektir. Gerektiğinde daha iyi bir REST tasarımı kullanabilirsin; fakat frontend ve backend arasındaki sözleşme tutarlı olmalıdır.

API gereksinimleri:

- Request ve response DTO'ları kullan.
- Doğrulama hatalarını anlaşılır biçimde döndür. **[v2]** Hata gövdesi için tek bir standart kullan (ör. RFC 7807 `ProblemDetail`: `type`, `title`, `status`, `detail`, alan hataları listesi).
- Merkezi hata yönetimi kur (`@RestControllerAdvice`).
- Uygun HTTP durum kodlarını kullan (`401` kimlik yok, `403` yetki yok, `404` bulunamadı, `409` sürüm çakışması, `413` fazla büyük içerik, `422/400` doğrulama).
- **[v2]** Başka bir çalışma alanına ait bir kaynağın varlığını sızdırmamak için yetkisiz kaynak erişiminde `404` döndürmek değerlendirilmeli; seçim tutarlı uygulanmalıdır.
- Listeleme endpoint'lerinde filtreleme ve sıralamayı destekle.
- Gerektiğinde sayfalama ekle (**[v2]** not ve görev listelerinde `page`, `size`, `sort`).
- Hassas bilgileri API cevaplarına dahil etme.
- Swagger/OpenAPI dokümantasyonu ekle.

---

# 10. Docker ve çalıştırma gereksinimleri

Projeyi Docker Compose ile çalıştırılabilir hâle getir.

Gerekli servisler:

- `frontend`
- `backend`
- `postgres`

Compose dosyasında:

- Servis bağımlılıkları tanımlanmalı (`depends_on` + `condition: service_healthy`).
- PostgreSQL healthcheck bulunmalı (`pg_isready`).
- Backend veritabanı hazır olmadan çalışmaya başlamamalı.
- Servislerin yeniden başlatma politikaları belirlenmeli (öneri: `unless-stopped`).
- PostgreSQL verileri named volume üzerinde tutulmalı.
- Dosya depolaması için gerekirse ayrı kalıcı volume kullanılmalı.
- Parolalar ve yapılandırmalar environment variable üzerinden sağlanmalı.
- Container'lar gereksiz ayrıcalıklarla çalıştırılmamalı (root olmayan kullanıcı, mümkünse `read_only`/`cap_drop` değerlendirilmeli).
- PostgreSQL portu varsayılan olarak host dışına açılmamalı.
- Frontend ve backend portları yalnızca localhost'a bağlanmalı (`127.0.0.1:3000:80` gibi). **[v2]** Backend portunun host'a hiç açılmaması da yeterlidir; tüm trafik frontend üzerinden `/api` ile akar.
- Backend ve frontend healthcheck'leri uygulanabilir olduğu ölçüde eklenmeli.

**[v2] Ek gereksinimler:**
- Backend imajı çok aşamalı (multi-stage) build ile üretilmeli; çalışma zamanı imajı yalnızca JRE içermeli. Frontend imajı da çok aşamalı olmalı (build → statik sunucu). `.dockerignore` dosyaları eklenmeli.
- Docker imaj etiketleri (`postgres`, `nginx`, `eclipse-temurin` vb.) sürüm sabitlenmeli; `latest` kullanılmamalı.
- JVM bellek ayarları container sınırlarına duyarlı olmalı (ör. `-XX:MaxRAMPercentage`).
- Container saat dilimi/UTC tutarlılığı sağlanmalı.
- **Bilgisayar açıldığında otomatik başlama:** `restart: unless-stopped` politikası, Docker Engine/Docker Desktop'ın oturum açılışında başlamasına bağlıdır. README'de, kullanılan işletim sistemine göre (Windows/macOS: Docker Desktop "başlangıçta çalıştır" ayarı; Linux: `systemctl enable docker`) bunun nasıl ayarlanacağı açıklanmalıdır.
- **İşletim sistemi:** Çalışmaya başlarken ana bilgisayarın işletim sistemini tespit et. Betikleri buna uygun üret (Linux/macOS için `.sh`; Windows için `.ps1` veya WSL2 üzerinden çalışan `.sh`). README her iki yolu da kısaca belgelemelidir.

Beklenen kullanıcı deneyimi:

1. Kullanıcı projeyi klonlar veya proje klasörüne girer.
2. Örnek environment dosyasını (`.env.example` → `.env`) yapılandırır.
3. Docker servislerini tek komutla başlatır (`docker compose up -d --build`).
4. Veritabanı migration'ları otomatik uygulanır.
5. Bootstrap kullanıcı ve varsayılan çalışma alanı güvenli şekilde oluşturulur.
6. Kullanıcı tarayıcıdan uygulamaya erişir.
7. Veriler bilgisayar yeniden başlatıldığında ve container'lar yeniden oluşturulduğunda korunur.

Uygulamanın varsayılan adresi: `http://localhost:3000`

Gerekli dosyaları oluştur:

- `compose.yaml`
- `.env.example`
- `.gitignore`
- Backend Dockerfile
- Frontend Dockerfile
- Veritabanı migration dosyaları
- README
- Gerekli başlatma ve yedekleme betikleri

Gerçek `.env` dosyasını Git'e ekleme.

Container'ların yeniden oluşturulması ile kalıcı verilerin silinmesi birbirinden ayrılmalıdır. Normal yeniden başlatma veya yeniden build işlemi verileri kaybettirmemelidir. **[v2]** README'de `docker compose down` (veriyi korur) ile `docker compose down -v` (named volume'ları **siler**) farkı belirgin bir uyarı olarak yer almalıdır.

---

# 11. Yedekleme ve geri yükleme

Veriler kişisel olduğu için yedekleme tasarımı MVP'nin bir parçasıdır.

Aşağıdaki işlemleri destekle:

- PostgreSQL veritabanının yedeğini alma (`pg_dump`, tercihen custom format `-Fc`).
- Kalıcı dosyaların yedeğini alma.
- Yedeklerin hangi tarihte alındığını belirleme (dosya adında zaman damgası).
- Geri yükleme için açıklanmış bir prosedür sunma.
- Hatalı yedek veya eksik dosya durumlarını açıkça raporlama.

**[v2] Yedekleme ayrıntıları:**
- Yedek betiği başarı/başarısızlığı çıkış koduyla ve açık bir mesajla bildirmelidir; boş veya sıfır baytlık yedek "başarılı" sayılmamalıdır.
- Yedek bütünlüğü için SHA-256 sağlama toplamı (checksum) dosyası üretilmeli ve geri yüklemede doğrulanmalıdır.
- Geri yükleme betiği, mevcut veriyi ezmeden önce açık bir onay istemeli ve mümkünse önce mevcut durumun otomatik bir güvenlik yedeğini almalıdır.
- `.env` (parolalar) yedeğe dahil edilmemeli; ancak README, `.env` dosyasının ayrıca güvenli bir yerde saklanması gerektiğini belirtmelidir.
- Eski yedekleri temizlemek için basit bir saklama politikası (ör. son N yedek) betikte seçenek olarak sunulabilir.
- Aşama 7'de yedekten geri yükleme **gerçekten denenmeli** (örn. veri ekle → yedek al → veriyi sil/yeni volume kur → geri yükle → verinin döndüğünü doğrula) ve sonuç raporlanmalıdır.

Yedekleme betiklerini README içinde belgele.

Yedek dosyalarını veritabanı volume'u içine tek kopya olarak koyma. Yedeklerin bağımsız bir dizine (ör. harici disk veya kullanıcı tarafından seçilen bir klasör) aktarılmasını sağla.

Otomatik yedekleme zamanlaması daha sonra geliştirilebilir; MVP'de çalışan bir manuel yedekleme ve geri yükleme yöntemi yeterlidir.

---

# 12. Test ve kalite gereksinimleri

Sadece derlenen bir uygulama yeterli değildir.

## Backend testleri

- Service katmanı birim testleri.
- Repository ve veritabanı entegrasyon testleri (**[v2]** Testcontainers ile gerçek PostgreSQL; H2 ile PostgreSQL'e özgü davranışları test ettiğini varsayma).
- Görev oluşturma ve güncelleme testleri (**[v2]** `completed_at` kuralı dahil).
- Yetkisiz erişim testleri.
- Çalışma alanları arasında veri izolasyonu testleri.
- Not ve çizim kaydetme testleri (**[v2]** sürüm çakışması ve boyut sınırı dahil).
- Migration testleri (boş veritabanında tüm migration'ların uygulanması ve `ddl-auto=validate` ile entity uyumu).
- **[v2]** Pano testleri: aynı görevin iki panoda tek Task kaydıyla görünmesi, BoardItem silmenin Task'ı silmemesi, Task silmenin BoardItem'ları temizlemesi, `mapped_status` davranışı.
- **[v2]** Güvenlik testleri: CSRF koruması, giriş hız sınırı, bootstrap idempotentliği.

## Frontend testleri

- Login formu.
- Görev oluşturma ve tamamlama.
- Not editörünün kayıt akışı.
- Kayıt durumunun gösterilmesi (**[v2]** debounce, yarışan istekler ve 409 durumu dahil).
- API hata durumları.
- Pano yerleşiminin güncellenmesi.

## Entegrasyon testleri

- Frontend'in backend API'sine bağlanması.
- Veritabanına kayıt ve yeniden okuma.
- Çizim kaydından sonra uygulamanın yeniden açılması.
- Container'lar yeniden oluşturulduğunda verilerin korunması.
- Yetkisiz kullanıcının başka bir çalışma alanına erişememesi.

Testler ortam gereksinimleri yüzünden çalıştırılamıyorsa bunu açıkça belirt ve mümkün olan testleri yine de çalıştır.

**[v2]** Test sonuçlarını raporlarken çalıştırılan komutu, geçen/başarısız sayısını ve çalıştırılamayan testleri ayrı ayrı listele. "Testler geçti" demek için testin gerçekten çalıştırılmış olması gerekir.

---

# 13. MVP dışında kalan özellikler

Aşağıdaki özellikleri ilk sürüme ekleme. Mimariyi gereksiz yere karmaşıklaştırmadan ileride genişletilebilecek şekilde tasarla.

## V2

- Tekrarlayan görevler.
- Haftalık takvim.
- Gelişmiş alışkanlık takibi.
- Hedef ve ilerleme grafikleri.
- Gelişmiş arama.
- Ek dosya yükleme ve yönetimi.
- Çizim geçmişi ve sürüm karşılaştırması.
- Gelişmiş pano filtreleri.
- İçe ve dışa aktarma seçeneklerinin genişletilmesi.
- **[v2]** Çöp kutusu / silinen öğeleri geri alma (soft delete).
- **[v2]** Otomatik zamanlanmış yedekleme.

## V3

- Birden fazla kullanıcı için davet sistemi.
- Kullanıcı rolleri ve ayrıntılı izinler.
- Paylaşılan çalışma alanları.
- Güvenli yerel ağ erişimi.
- Uygun bir güvenlik modeliyle uzaktan erişim.
- Takvim entegrasyonları.
- İsteğe bağlı yapay zekâ özellikleri.
- Gelişmiş otomasyonlar.
- İhtiyaç ortaya çıkarsa daha kapsamlı DevOps altyapısı.

Bu özellikleri yalnızca ileride eklenebilecek olmaları nedeniyle MVP'ye dahil etme.

---

# 14. Geliştirme aşamaları

Projeyi aşağıdaki aşamalarla geliştir.

## Aşama 0 — [v2] Hazırlık ve doğrulama deneyleri

- Mevcut dizini, işletim sistemini, Docker/Java/Node/Maven-Gradle sürümlerini kontrol et.
- Kısa bir uygulama planı yaz ve `docs/DECISIONS.md`'yi başlat.
- Riskli entegrasyonlar için küçük doğrulama deneyleri yap: (a) Excalidraw'ın kullanılacak React sürümüyle çalışması, (b) React Flow ile dnd-kit'in aynı projede çakışmadan çalışması, (c) Tiptap tablo ve kod bloğu uzantılarının JSON çıktısı.
- Belirsizlik çözüldüğünde ana aşamalara geç.

## Aşama 1 — Proje iskeleti ve altyapı

- Mevcut çalışma dizinini incele.
- Repository yapısını oluştur.
- Backend'i kur.
- Frontend'i kur.
- PostgreSQL ve Docker Compose yapılandırmasını hazırla.
- Flyway migration altyapısını ekle.
- Healthcheck endpoint'lerini oluştur.
- Servislerin birbirleriyle bağlantısını doğrula (**[v2]** `http://localhost:3000/api/actuator/health` benzeri bir yol üzerinden frontend → backend → DB zincirinin çalıştığını göster).
- README ve environment örneğini oluştur.

**Tamamlanma ölçütü:** Backend, frontend ve veritabanı Docker üzerinden çalışabilmeli.

## Aşama 2 — Kimlik doğrulama ve çalışma alanı

- Bootstrap kullanıcı oluşturma.
- Login ve logout.
- Güvenli oturum yönetimi (cookie, CSRF, Spring Session JDBC, giriş hız sınırı).
- Workspace ve Area modelleri.
- Varsayılan çalışma alanı ve başlangıç alanları.
- Korumalı frontend rotaları.
- **[v2]** `WorkspaceAccessService` (çalışma alanı yetki kontrolü) ve izolasyon testleri.

**Tamamlanma ölçütü:** Kullanıcı giriş yapabilmeli ve kendi çalışma alanını görebilmeli.

## Aşama 3 — Görev yönetimi ve dashboard

- Task entity ve migration.
- REST API.
- Görev oluşturma, düzenleme ve tamamlama.
- Öncelik ve son tarih.
- Dashboard verilerinin backend'den gelmesi.
- Alanlara göre filtreleme.

**Tamamlanma ölçütü:** Görevler gerçekten veritabanına kaydedilmeli ve yeniden girişte korunmalı.

## Aşama 4 — Notlar

- Tiptap entegrasyonu.
- Zengin metin içeriklerinin saklanması (`content` + `content_text`).
- Not CRUD işlemleri.
- Ortak otomatik/manuel kayıt mekanizması (`useAutosave`).
- Kaydetme durumunun gösterilmesi.
- İçerik arama.
- Etiketler.

**Tamamlanma ölçütü:** Notlar biçimlendirmeleriyle birlikte kaydedilip yeniden açılabilmeli.

## Aşama 5 — Çizimler

- Excalidraw entegrasyonu.
- Bağımsız çizim belgeleri.
- Backend kayıt endpoint'leri ve doğrulama/boyut sınırı.
- Otomatik ve manuel kayıt (`useAutosave` yeniden kullanımı).
- Çizim listesi.
- Yeniden açma ve dışa aktarma.

**Tamamlanma ölçütü:** En az iki bağımsız çizim oluşturulabilmeli, farklı içerikler olarak kaydedilmeli ve yeniden düzenlenebilmelidir.

## Aşama 6 — Genel çalışma panoları

- Board, BoardColumn, BoardItem ve BoardEdge modelleri.
- Sütunlu pano (dnd-kit) ve `mapped_status` davranışı.
- Serbest yerleşimli pano (React Flow) ve bağlantılar.
- Mevcut görev ve notları panoya ekleme.
- Yerleşimi kalıcı olarak kaydetme (toplu konum güncelleme).

**Tamamlanma ölçütü:** Bir görev panoya eklendiğinde yeni görev kopyası oluşmamalı; pano yenilendiğinde yerleşim korunmalıdır.

## Aşama 7 — Dayanıklılık ve teslim

- Testleri çalıştır.
- Hataları düzelt.
- Docker build ve başlangıç sürecini sıfırdan (temiz clone + boş volume) doğrula.
- Veritabanı kalıcılığını kontrol et (restart ve `down` → `up` ile recreate).
- Yedekleme ve geri yüklemeyi gerçekten test et.
- README'yi tamamla.
- Bilinen eksikleri belgeleyip son durum raporu oluştur.

Her aşamada önce çalışan temeli kur, sonra bir sonraki aşamaya geç.

Aşamaları yalnızca dosyalar oluşturuldu diye tamamlanmış kabul etme. İlgili işlevlerin çalıştığını doğrula.

---

# 15. MVP kabul kriterleri

MVP ancak aşağıdaki kriterler karşılandığında tamamlanmış sayılır.

### Altyapı
- [ ] Docker Compose servisleri başlatabiliyor.
- [ ] Backend veritabanına bağlanabiliyor.
- [ ] Flyway migration'ları başarıyla uygulanıyor.
- [ ] Frontend backend API'siyle iletişim kuruyor (same-origin `/api`).
- [ ] Healthcheck'ler çalışıyor.
- [ ] Uygulama localhost üzerinden açılıyor.
- [ ] PostgreSQL portu host dışına açık değil; portlar yalnızca localhost'a bağlı.

### Kimlik doğrulama
- [ ] Başlangıç kullanıcısı güvenli biçimde oluşturuluyor.
- [ ] Kullanıcı giriş ve çıkış yapabiliyor.
- [ ] Parolalar hash'lenerek saklanıyor.
- [ ] Korumalı endpoint'ler yetkisiz erişime kapalı.
- [ ] CSRF koruması etkin ve çalışıyor; oturum backend yeniden başlatılınca korunuyor.
- [ ] Başka çalışma alanının verisine erişilemiyor (testle kanıtlanmış).

### Görevler ve dashboard
- [ ] Görev oluşturulabiliyor.
- [ ] Görev güncellenip tamamlanabiliyor.
- [ ] Öncelik ve son tarih saklanıyor.
- [ ] Dashboard gerçek verileri gösteriyor.
- [ ] Veriler yeniden başlatma sonrasında korunuyor.

### Notlar
- [ ] Zengin metin notları oluşturulabiliyor.
- [ ] Biçimlendirme kaydedilip yeniden yükleniyor.
- [ ] Otomatik ve manuel kayıt çalışıyor.
- [ ] Kayıt hataları kullanıcıya bildiriliyor.
- [ ] Not araması çalışıyor.

### Çizimler
- [ ] Birden fazla çizim oluşturulabiliyor.
- [ ] Her çizimin içeriği ayrı saklanıyor.
- [ ] Çizimler düzenlenebilir biçimde yeniden açılıyor.
- [ ] Otomatik kayıt çalışıyor.
- [ ] Dışa aktarma temel senaryoda çalışıyor.
- [ ] Aşırı büyük çizim anlaşılır bir hata ile reddediliyor.

### Çalışma panoları
- [ ] Sütunlu pano çalışıyor.
- [ ] Serbest yerleşimli pano çalışıyor (kartlar ve bağlantılar).
- [ ] Kart konumları kalıcı olarak saklanıyor.
- [ ] Görev ve notlar kopyalanmadan panolara eklenebiliyor.
- [ ] Panodan öğe kaldırmak asıl görevi/notu silmiyor.

### Kalıcılık ve teslim
- [ ] Docker yeniden başlatıldığında veriler korunuyor.
- [ ] Container yeniden oluşturma senaryosu doğrulanıyor.
- [ ] Veritabanı yedeği alınabiliyor.
- [ ] Yedekten geri yükleme gerçekten denenmiş ve belgelenmiş.
- [ ] README ile proje sıfırdan kurulabiliyor.
- [ ] İlgili otomatik testler çalıştırılmış ve sonuçlar raporlanmış.

---

# 16. Çalışma sonunda beklediğim çıktı

Uygulama üzerinde çalışmayı bitirdiğinde `docs/TESLIM_RAPORU.md` dosyasında aşağıdaki bilgileri içeren bir teslim raporu oluştur:

1. Oluşturulan proje klasör yapısı.
2. Kullanılan teknoloji ve bağımlılıkların özeti (sürümleriyle).
3. Gerçekten tamamlanan özellikler.
4. Çalıştırılan testler ve sonuçları.
5. Docker ile başlatma komutları.
6. Yerel erişim adresi.
7. İlk kullanıcıyı oluşturma yöntemi.
8. Environment değişkenlerinin açıklaması.
9. Veritabanı migration'ları ve yedekleme/geri yükleme yöntemi.
10. Bilinen hatalar ve tamamlanmayan özellikler.
11. Bir sonraki geliştirme aşaması için önerilen işler.
12. **[v2]** Kabul kriterleri kontrol listesinin işaretlenmiş hâli (her madde için geçti / geçmedi / doğrulanamadı).

Uygulama gerçekten çalışıyorsa hangi komutla başlatıldığını ve testlerin sonucunu belirt. Çalıştırılamadıysa bunun nedenini ve gereken düzeltmeleri açıkla.

---

# 17. Şimdi başla

Önce mevcut proje dizinini ve geliştirme ortamını incele.

Ardından kısa bir uygulama planı oluştur ve **Aşama 0 ile Aşama 1'i doğrudan uygulamaya başla.**

İlk aşamada yalnızca dokümantasyon hazırlayıp durma. Backend, frontend ve PostgreSQL altyapısını oluştur, Docker Compose ile çalıştır, bağlantıları doğrula ve test et.

Altyapı çalıştıktan sonra MVP modüllerini belirlenen sırayla geliştir. Her aşamada ilgili kabul kriterlerini kontrol et.

Bir özellik için kritik bir teknik belirsizlik varsa önce küçük bir doğrulama deneyi yap. Belirsizlik çözüldüğünde ana uygulamaya devam et.

Gereksiz onay döngülerinden kaçın. Makul varsayımlar yap, kararlarını belgele ve gerçek bir ürün ortaya çıkar.

**Nihai hedef: Sadece kodu yazılmış değil, bilgisayarda çalıştırılabilen, giriş yapılabilen, gerçek verileri saklayan ve günlük kullanıma başlanabilecek bir Personal Workspace MVP'si teslim etmek.**
