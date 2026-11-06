/**
 * Not editöründe "Hazır Şablon" menüsünden eklenen HTML iskeletleri.
 * İçerik tiptap editörünün insertContent komutuyla doğrudan enjekte edilir.
 */
export interface NoteTemplate {
  id: string;
  name: string;
  desc: string;
  icon: string;
  html: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'weekly-plan',
    name: 'Haftalık Planlayıcı',
    desc: 'Haftalık hedefler, günlük plan ve notlar tablosu',
    icon: '📋',
    html: `
      <h2>📋 Haftalık Planlayıcı & Hedefler</h2>
      <p>Bu haftanın odak noktaları ve günlük aksiyon planı.</p>
      <table>
        <thead>
          <tr>
            <th>Gün</th>
            <th>Öncelikli Görevler / İşler</th>
            <th>Hedef & Çıktı</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Pazartesi</strong></td><td>Haftalık planlama ve toplantılar</td><td>Haftalık hedefler netleştirildi</td><td>Planlandı</td></tr>
          <tr><td><strong>Salı</strong></td><td>Ana proje geliştirme / çalışma</td><td>Modül 1 tamamlanacak</td><td>Bekliyor</td></tr>
          <tr><td><strong>Çarşamba</strong></td><td>İncelemeler ve ara değerlendirme</td><td>Geri bildirimler toplandı</td><td>Bekliyor</td></tr>
          <tr><td><strong>Perşembe</strong></td><td>Derin çalışma / uygulama</td><td>Rapor / çıktı teslimi</td><td>Bekliyor</td></tr>
          <tr><td><strong>Cuma</strong></td><td>Hafta kapanışı ve dokümantasyon</td><td>Haftalık özet rapor</td><td>Bekliyor</td></tr>
          <tr><td><strong>Cumartesi</strong></td><td>Kişisel gelişim & okumalar</td><td>2 saat odaklanma</td><td>Bekliyor</td></tr>
          <tr><td><strong>Pazar</strong></td><td>Haftalık retrospektif & dinlenme</td><td>Yeni haftaya hazırlık</td><td>Bekliyor</td></tr>
        </tbody>
      </table>
      <p></p>
    `,
  },
  {
    id: 'meeting-notes',
    name: 'Toplantı Notu & Kararlar',
    desc: 'Gündem, katılımcılar, alınan kararlar ve aksiyonlar',
    icon: '💼',
    html: `
      <h2>💼 Toplantı Notu: [Toplantı Konusu]</h2>
      <p><strong>Katılımcılar:</strong> Ekip | <strong>Konum / Link:</strong> Online</p>
      <h3>🎯 Toplantı Gündemi</h3>
      <ul>
        <li>1. Madde: Öncelikli hedefler ve mevcut durum</li>
        <li>2. Madde: Karşılaşılan engeller ve çözüm önerileri</li>
      </ul>
      <h3>✅ Alınan Kararlar</h3>
      <ul>
        <li>Karar 1: ...</li>
        <li>Karar 2: ...</li>
      </ul>
      <h3>📌 Aksiyon Maddeleri</h3>
      <table>
        <thead>
          <tr>
            <th>Aksiyon</th>
            <th>Sorumlu</th>
            <th>Termin Tarihi</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Gereksinim dokümanını tamamla</td><td>Proje Lideri</td><td>Cuma</td><td>Açık</td></tr>
          <tr><td>Müşteri sunumunu hazırla</td><td>Ürün Sorumlusu</td><td>Pazartesi</td><td>Açık</td></tr>
        </tbody>
      </table>
      <p></p>
    `,
  },
  {
    id: 'project-sprint',
    name: 'Proje & Sprint Planı',
    desc: 'Proje kapsamı, teslim edilecekler ve sprint hedefleri',
    icon: '🚀',
    html: `
      <h2>🚀 Proje & Sprint Planı: [Proje Adı]</h2>
      <p><strong>Sprint Hedefi:</strong> Bu sprintte teslim edilecek temel değer ve özellikler.</p>
      <h3>📦 Kapsam & Teslimatlar</h3>
      <table>
        <thead>
          <tr>
            <th>Modül / Özellik</th>
            <th>Açıklama</th>
            <th>Öncelik</th>
            <th>Teslim</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Temel Fonksiyonlar</td><td>Temel API ve iş kuralları</td><td>Yüksek</td><td>Sprint Sonu</td></tr>
          <tr><td>Arayüz Entegrasyonu</td><td>Kullanıcı etkileşimleri ve formlar</td><td>Orta</td><td>Sprint Sonu</td></tr>
        </tbody>
      </table>
      <p></p>
    `,
  },
  {
    id: 'workout-plan',
    name: 'Haftalık Spor Programı',
    desc: 'Bölgeler, hareketler, set x tekrar ve kilo tablosu',
    icon: '🏋️',
    html: `
      <h2>🏋️‍♂️ Haftalık Antrenman ve Spor Programı</h2>
      <p>Hedef Kas Grupları & Egzersiz Planı</p>
      <table>
        <thead>
          <tr>
            <th>Gün</th>
            <th>Bölge / Kas Grubu</th>
            <th>Egzersiz / Hareket</th>
            <th>Set x Tekrar</th>
            <th>Hedef Ağırlık / Not</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Pazartesi</strong></td><td>Göğüs & Triceps</td><td>Bench Press</td><td>4 x 8-10</td><td>70 kg</td></tr>
          <tr><td><strong>Salı</strong></td><td>Sırt & Biceps</td><td>Lat Pulldown</td><td>4 x 10</td><td>60 kg</td></tr>
          <tr><td><strong>Çarşamba</strong></td><td>Dinlenme / Kardiyo</td><td>30 dk Tempolu Yürüyüş</td><td>1 Seans</td><td>Hafif tempo</td></tr>
          <tr><td><strong>Perşembe</strong></td><td>Bacak & Karın</td><td>Barbell Squat</td><td>4 x 8</td><td>80 kg</td></tr>
          <tr><td><strong>Cuma</strong></td><td>Omuz & Kol</td><td>Overhead Press</td><td>4 x 10</td><td>45 kg</td></tr>
          <tr><td><strong>Cumartesi</strong></td><td>Full Body / Kardiyo</td><td>Fonksiyonel Egzersizler</td><td>3 Tur</td><td>Kondisyon</td></tr>
          <tr><td><strong>Pazar</strong></td><td>Dinlenme</td><td>Esneme & Mobilite</td><td>20 dk</td><td>Toparlanma</td></tr>
        </tbody>
      </table>
      <p></p>
    `,
  },
];
