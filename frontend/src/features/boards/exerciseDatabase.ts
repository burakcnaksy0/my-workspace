export type ExerciseCategory = 'Göğüs' | 'Sırt' | 'Omuz' | 'Bacak' | 'Kol' | 'Karın' | 'Kardiyo';
export type ExerciseDifficulty = 'Başlangıç' | 'Orta' | 'İleri' | 'Başlangıç / Orta' | 'Orta / İleri';

export interface ExerciseInfo {
  id: string;
  name: string;
  nameTr: string;
  aliases: string[];
  category: ExerciseCategory;
  targetMuscles: {
    primary: string[];
    secondary: string[];
  };
  equipment: string;
  difficulty: ExerciseDifficulty;
  benchAngle?: string;
  recommendedSets: string;
  instructions: string[];
  breathing: string;
  proTips: string[];
  commonMistakes: string[];
  alternatives: string[];
  accentColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcılar
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  Göğüs: '#3b82f6',
  Sırt: '#10b981',
  Omuz: '#8b5cf6',
  Bacak: '#f59e0b',
  Kol: '#ec4899',
  Karın: '#06b6d4',
  Kardiyo: '#ef4444',
};

const DEFAULT_BREATHING: Record<ExerciseCategory, string> = {
  Göğüs: 'Ağırlığı indirirken/açarken nefes alın, iterken/kapatırken nefes verin.',
  Sırt: 'Çekerken nefes verin, kolları uzatırken nefes alın.',
  Omuz: 'Ağırlığı kaldırırken nefes verin, indirirken nefes alın.',
  Bacak: 'İnerken nefes alın, kalkarken/iterken nefes verin.',
  Kol: 'Güç uygularken nefes verin, kontrollü bırakırken nefes alın.',
  Karın: 'Kasılma anında nefes verin, başlangıç pozisyonunda nefes alın.',
  Kardiyo: 'Ritmik ve derin nefes alın; burundan al, ağızdan ver. Nefesi tutmayın.',
};

interface ExtraOpts {
  benchAngle?: string;
  breathing?: string;
  accentColor?: string;
}

/** Kısa tanımlı egzersiz oluşturucu (tekrarı azaltmak için). */
function E(
  id: string,
  name: string,
  nameTr: string,
  category: ExerciseCategory,
  aliases: string[],
  muscles: [string[], string[]],
  equipment: string,
  difficulty: ExerciseDifficulty,
  recommendedSets: string,
  instructions: string[],
  proTips: string[],
  commonMistakes: string[],
  alternatives: string[],
  extra: ExtraOpts = {},
): ExerciseInfo {
  return {
    id,
    name,
    nameTr,
    aliases,
    category,
    targetMuscles: { primary: muscles[0], secondary: muscles[1] },
    equipment,
    difficulty,
    benchAngle: extra.benchAngle,
    recommendedSets,
    instructions,
    breathing: extra.breathing ?? DEFAULT_BREATHING[category],
    proTips,
    commonMistakes,
    alternatives,
    accentColor: extra.accentColor ?? CATEGORY_COLORS[category],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EGZERSİZ VERİTABANI
// ─────────────────────────────────────────────────────────────────────────────

export const EXERCISE_DATABASE: ExerciseInfo[] = [
  // ── GÖĞÜS (CHEST) ──────────────────────────────────────────────────────────
  E(
    'high-cable-crossover', 'High Cable Crossover', 'Üstten Kablo Göğüs Çaprazlama (Alt & İç Göğüs)', 'Göğüs',
    ['high cable crossover', 'cable crossover', 'cable cross', 'crossover', 'kablo crossover', 'high cable fly', 'cable fly', 'alt gogus cable', 'kablo acis', 'cable chest fly'],
    [['Alt ve İç Göğüs (Sternal Pektoral)', 'Büyük Göğüs Kası'], ['Ön Omuz (Anterior Deltoid)', 'Biceps Kısa Başı', 'Serratus Anterior']],
    'Çift Makaralı Kablo İstasyonu (Dual Cable Tower), Tekli El Tutamaçları', 'Orta', '3 - 4 Set x 12 - 15 Tekrar (Tepe Kasılma & Şekillendirme)',
    [
      'Makaraları omuz ve baş hizasının üzerindeki en üst kademeye sabitleyin.',
      'Tutamaçları kavrayıp istasyonun tam ortasında 1-2 adım öne çıkın; gerilimi hissedin.',
      'Dengenizi sağlamak için bir ayağınızı hafifçe öne koyun (split stance), gövdenizi 15-20° öne eğin.',
      'Dirseklerinizi çok hafif kırın ve hareket boyunca bu açıyı sabit tutun.',
      'Kabloları aşağı ve öne, kasık hizasına doğru dairesel bir yay çizerek birleştirin.',
      'En alt tepe kasılmada ellerinizi hafifçe üst üste getirip alt göğsü 1-2 saniye sıkın.',
      'Kolları 2-3 saniyelik negatif tempoyla göğüste derin bir esneme hissedene kadar açın.',
    ],
    [
      'Hareketi pres gibi değil, devasa bir ağaca sarılıyormuş gibi dairesel bir sarılma açışıyla yapın.',
      'Gövdenizi sallayarak belden ivme almayın; hareket saf göğüs kaslarıyla gerçekleşmeli.',
      'Kablolar hareketin her noktasında kesintisiz gerilim sunar.',
    ],
    [
      'Dirsekleri fazla bükerek hareketi triceps itişine çevirmek.',
      'Omuzları öne yuvarlayarak göğüs aktivasyonunu kaybetmek.',
      'Çok ağır takıp vücut ağırlığıyla kabloları aşağı çekmek.',
    ],
    ['Low Cable Crossover', 'Pec Deck / Machine Fly', 'Decline Dumbbell Fly'],
    {
      benchAngle: 'Ayakta, 15°-20° Öne Eğimli Gövde',
      breathing: 'Kabloları önde birleştirirken nefes verin, kollar açılırken nefes alın.',
      accentColor: '#0ea5e9',
    },
  ),
  E(
    'low-cable-crossover', 'Low-to-High Cable Fly', 'Alttan Üste Kablo Göğüs Açış (Üst Göğüs)', 'Göğüs',
    ['low cable crossover', 'low to high cable fly', 'low cable fly', 'alttan kablo', 'ust gogus kablo', 'cable upper chest fly'],
    [['Üst Göğüs (Klavikular Pektoral)'], ['Ön Omuz', 'Serratus Anterior']],
    'Kablo İstasyonu, Tekli Tutamaçlar', 'Orta', '3 Set x 12 - 15 Tekrar',
    [
      'Makaraları en alt kademeye ayarlayın ve tutamaçları kavrayın.',
      'Hafif öne eğik, bir ayak önde sağlam bir duruş alın; dirsekleri hafif bükün.',
      'Kolları aşağıdan yukarıya, çene hizasına doğru kavis çizerek birleştirin.',
      'Tepede üst göğsü 1 saniye sıkın ve kontrollüce başlangıca dönün.',
    ],
    ['Dirsek açısını sabit tutun; hareket omuzdan değil göğüsten gelmeli.', 'Omuzları yukarı kaldırmayın (trapez devreye girmesin).'],
    ['Ağırlığı kollarla çekmek.', 'Gövdeyi geriye savurmak.'],
    ['Incline Dumbbell Fly', 'Incline Dumbbell Press', 'High Cable Crossover'],
  ),
  E(
    'incline-dumbbell-press', 'Incline Dumbbell Press', 'Eğik Sehpa Dumbbell Göğüs Pres', 'Göğüs',
    ['incline dumbell press', 'incline dumbbell press', 'incline dumbbell', 'incline dumbell', 'incline press', 'eğik sehpa press', 'üst göğüs dumbell', 'ust gogus press', 'incline db press', 'dumbbell incline press'],
    [['Üst Göğüs (Klavikular Pektoral)', 'Ön Omuz (Anterior Deltoid)'], ['Arka Kol (Triceps)', 'Serratus Anterior']],
    'Ayarlanabilir Eğimli Bench (30°-45°), 2 Adet Dumbbell', 'Orta', '3 - 4 Set x 8 - 12 Tekrar (Hipertrofi Odaklı)',
    [
      'Sehpayı 30° ile maksimum 45° açıya ayarlayın (daha dik açılar yükü ön omuzlara bindirir).',
      'Dumbbell’ları dizlerinizin üzerine alıp sehpaya oturun.',
      'Sırtüstü yatarken dizlerinizle iterek dumbbell’ları omuz/göğüs hizasına taşıyın.',
      'Kürek kemiklerinizi geriye çekip sehpaya sabitleyin, göğsünüzü öne çıkarın.',
      'Dumbbell’ları yukarı itin; tepede dirsekleri kilitlemeden üst göğsü sıkın.',
      'Ağırlıkları 2-3 saniyelik negatif tempoyla, dirsekler gövdeyle 45°-60° açı yapacak şekilde indirin.',
    ],
    [
      'Dirsekleri omuz hizasında 90° yana açmayın; 45-60° omuz kapsülünü korur.',
      'Tepe noktada dumbbell’ları çarptırmayın; gerilimi sürekli tutun.',
      'Dumbbell, barbell’a kıyasla daha geniş hareket aralığı ve bağımsız kol dengesi sağlar.',
    ],
    ['Sehpa açısını 60°’ye kadar dikleştirmek.', 'Ağırlığı göğüsten zıplatmak.', 'Ayakları yerden kaldırmak.'],
    ['Incline Barbell Bench Press', 'Incline Hammer Strength Machine', 'Low-to-High Cable Fly'],
    { benchAngle: '30° - 45° Eğim', breathing: 'Dumbbell’ları indirirken nefes alın; iterken nefesi kuvvetlice verin.', accentColor: '#3b82f6' },
  ),
  E(
    'incline-barbell-bench-press', 'Incline Barbell Bench Press', 'Eğik Sehpa Barbell Göğüs Pres', 'Göğüs',
    ['incline bench press', 'incline barbell', 'incline barbell press', 'egik bench', 'ust gogus barbell'],
    [['Üst Göğüs', 'Ön Omuz'], ['Triceps', 'Serratus Anterior']],
    'Olimpik Bar, Eğimli Bench (30°-45°), Plakalar', 'Orta', '3 - 4 Set x 6 - 10 Tekrar',
    [
      'Sehpayı 30° civarına ayarlayın ve gözleriniz barın altında olacak şekilde uzanın.',
      'Barı omuz genişliğinden biraz geniş tutun, kürek kemiklerini sabitleyin.',
      'Barı köprücük kemiğinin biraz altına, üst göğse kontrollüce indirin.',
      'Patlayıcı şekilde yukarı itin.',
    ],
    ['Açı arttıkça omuz devreye girer; 30° ideal.', 'Ayaklarla yeri iterek stabilite sağlayın.'],
    ['Barı boynuna doğru indirmek.', 'Kalçayı sehpadan kaldırmak.'],
    ['Incline Dumbbell Press', 'Smith Machine Incline Press'],
    { benchAngle: '30° Eğim' },
  ),
  E(
    'flat-barbell-bench-press', 'Barbell Bench Press', 'Düz Sehpa Barbell Göğüs Pres', 'Göğüs',
    ['bench press', 'barbell bench', 'duz bench', 'bench', 'göğüs pres', 'gogus pres', 'chest press', 'flat bench press', 'barbell chest press'],
    [['Orta ve Alt Göğüs (Pectoralis Major)'], ['Ön Omuz', 'Triceps (Arka Kol)']],
    'Olimpik Bar, Düz Bench, Ağırlık Plakaları', 'Orta', '4 Set x 6 - 10 Tekrar',
    [
      'Gözleriniz barın tam altında olacak şekilde düz sehpaya uzanın.',
      'Barı omuz genişliğinden biraz geniş, bilekler bükülmeden kavrayın.',
      'Ayak tabanlarınızı yere sağlamca basın, kürek kemiklerinizi sehpaya gömün.',
      'Barı raftan çıkarıp göğsün orta/alt kısmına (meme ucu hizası) kontrollüce indirin.',
      'Bar göğse hafifçe temas ettikten sonra patlayıcı güçle yukarı itin.',
    ],
    ['Bar yolunun hafifçe geriye (omuzlara doğru) açılı bir eğri çizmesi en güçlü yoldur.', 'Bar avuç içinin topuk kısmına oturmalı, bilekler geriye bükülmemeli.'],
    ['Barı göğüsten zıplatmak.', 'Kalçayı sehpadan kaldırmak.', 'Dirsekleri gövdeye 90° açarak omuzları sıkıştırmak.'],
    ['Dumbbell Bench Press', 'Chest Press Machine', 'Weighted Dips'],
    { benchAngle: 'Düz (0°)', breathing: 'Barı indirirken nefes alın, yukarı iterken nefes verin.' },
  ),
  E(
    'decline-barbell-bench-press', 'Decline Bench Press', 'Ters Eğimli Sehpa Göğüs Pres (Alt Göğüs)', 'Göğüs',
    ['decline bench', 'decline press', 'decline barbell press', 'ters egim press', 'alt gogus press'],
    [['Alt Göğüs'], ['Triceps', 'Ön Omuz']],
    'Decline Bench, Olimpik Bar', 'Orta', '3 Set x 8 - 10 Tekrar',
    [
      'Bacaklarınızı sehpanın pedlerine sabitleyip uzanın.',
      'Barı omuz genişliğinden biraz geniş tutun ve raftan alın.',
      'Barı alt göğse kontrollüce indirin.',
      'Dirsekleri kilitlemeden yukarı itin.',
    ],
    ['Mutlaka spotter ile veya güvenlik rafında yapın.', 'Eğimi 15-30° aralığında tutun.'],
    ['Barı kontrolsüz düşürmek.', 'Çok ağır yükle boyun bölgesine kan dolması.'],
    ['Decline Dumbbell Press', 'Dips', 'High Cable Crossover'],
    { benchAngle: '-15° ile -30° Ters Eğim' },
  ),
  E(
    'flat-dumbbell-press', 'Flat Dumbbell Press', 'Düz Sehpa Dumbbell Göğüs Pres', 'Göğüs',
    ['dumbbell bench press', 'dumbbell press', 'db bench', 'dumbbell chest press', 'dambil pres', 'flat dumbbell press'],
    [['Göğüs (Pectoralis Major)'], ['Ön Omuz', 'Triceps']],
    'Düz Bench, 2 Adet Dumbbell', 'Başlangıç / Orta', '3 - 4 Set x 8 - 12 Tekrar',
    [
      'Dumbbell’ları dizlerinizde taşıyarak sırtüstü uzanın ve omuz hizasına alın.',
      'Kürek kemiklerini geriye sabitleyin.',
      'Dumbbell’ları göğüs hizasına kadar kontrollüce indirin.',
      'Yukarı iterken hafifçe içe doğru birleştirin.',
    ],
    ['Barbell’a göre daha geniş ROM sağlar; sol-sağ dengesizliğini giderir.'],
    ['Dirsekleri 90° yana açmak.', 'Çok ağır alıp ROM’u kısaltmak.'],
    ['Barbell Bench Press', 'Push-up', 'Machine Chest Press'],
    { benchAngle: 'Düz (0°)' },
  ),
  E(
    'decline-dumbbell-press', 'Decline Dumbbell Press', 'Ters Eğimli Dumbbell Göğüs Pres', 'Göğüs',
    ['decline dumbbell press', 'decline dumbbell', 'decline db press'],
    [['Alt Göğüs'], ['Triceps', 'Ön Omuz']],
    'Decline Bench, 2 Adet Dumbbell', 'Orta', '3 Set x 8 - 12 Tekrar',
    [
      'Ayaklarınızı sabitleyip dumbbell’larla decline sehpaya uzanın.',
      'Dumbbell’ları alt göğüs hizasından yukarı itin.',
      'Kontrollüce indirin.',
    ],
    ['Ağırlıkları sehpaya yerleştirirken yardım alın.'],
    ['Aşırı hızlı negatif.'],
    ['Decline Bench Press', 'Dips'],
    { benchAngle: '-15° ile -30° Ters Eğim' },
  ),
  E(
    'dumbbell-fly', 'Flat Dumbbell Fly', 'Düz Sehpa Dumbbell Göğüs Açış', 'Göğüs',
    ['dumbbell fly', 'dumbell fly', 'chest fly', 'dambıl açış', 'dambil acis', 'göğüs açış', 'gogus acis', 'flat fly'],
    [['Göğüs Kası (Pectoralis Major - Dış ve İç Lifler)'], ['Ön Omuz', 'Biceps Kısa Başı']],
    'Düz Bench, 2x Orta Ağırlıkta Dumbbell', 'Orta', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Düz sehpaya uzanın, dumbbell’ları göğüs üzerinde kollar hafif bükülü tutun.',
      'Dirseklerdeki hafif bükümü hareket boyunca sabit tutun.',
      'Kolları iki yana geniş bir yay çizerek göğüste derin gerilme hissedene kadar indirin.',
      'Göğüs kaslarını sıkarak başlangıç noktasına toplayın.',
    ],
    ['Ağırlığı abartmayın; ana amaç derin esneme ve tepe kasılmadır.'],
    ['Dirsekleri tamamen kilitleyip tendonları zorlamak.', 'Kolları omuz hizasının çok altına düşürmek.'],
    ['Pec Deck Machine', 'Cable Fly', 'Incline Dumbbell Fly'],
    { benchAngle: 'Düz (0°)', breathing: 'Kolları açarken nefes alın, kapatırken nefes verin.', accentColor: '#38bdf8' },
  ),
  E(
    'incline-dumbbell-fly', 'Incline Dumbbell Fly', 'Eğik Sehpa Dumbbell Göğüs Açış', 'Göğüs',
    ['incline fly', 'incline dumbbell fly', 'incline dumbell fly', 'egik acis'],
    [['Üst Göğüs'], ['Ön Omuz', 'Biceps Kısa Başı']],
    'Eğimli Bench (30°), 2x Dumbbell', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Sehpayı 30° ayarlayıp dumbbell’larla uzanın.',
      'Kolları hafif bükülü şekilde yanlara doğru kontrollüce açın.',
      'Üst göğsü sıkarak dumbbell’ları göğüs üzerinde birleştirin.',
    ],
    ['Hafif ağırlıkla geniş esneme hedefleyin.'],
    ['Hareketi pres gibi yapmak.'],
    ['Low-to-High Cable Fly', 'Pec Deck'],
    { benchAngle: '30° Eğim' },
  ),
  E(
    'pec-deck', 'Pec Deck / Machine Fly', 'Pec Deck Makinesi Göğüs Açış', 'Göğüs',
    ['pec deck', 'machine fly', 'butterfly', 'butterfly makinesi', 'pec fly', 'peck deck'],
    [['Göğüs (İç Lifler)'], ['Ön Omuz']],
    'Pec Deck Makinesi', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Koltuğu kollar göğüs hizasında olacak şekilde ayarlayın.',
      'Sırtınızı yaslayıp kolları birleştirin.',
      'Ortada 1-2 saniye sıkıp yavaşça açın.',
    ],
    ['Omuzları geride tutun, göğsü dışarı çıkarın.'],
    ['Omuzları öne yuvarlamak.'],
    ['Cable Fly', 'Dumbbell Fly'],
  ),
  E(
    'machine-chest-press', 'Machine Chest Press', 'Makine Göğüs Pres', 'Göğüs',
    ['machine chest press', 'makine pres', 'seated chest press', 'hammer strength press', 'chest press machine', 'gogus makinesi'],
    [['Göğüs'], ['Ön Omuz', 'Triceps']],
    'Chest Press Makinesi', 'Başlangıç', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Tutamaçlar göğüs hizasında olacak şekilde koltuğu ayarlayın.',
      'Sırtınızı yaslayıp kürek kemiklerini geriye alın.',
      'İterek kolları uzatın, tepede göğsü sıkın.',
      'Yavaşça geri bırakın.',
    ],
    ['Yeni başlayanlar ve tükeniş setleri için güvenli bir seçenektir.'],
    ['Omuzları yukarı kaldırmak.'],
    ['Dumbbell Bench Press', 'Push-up'],
  ),
  E(
    'push-up', 'Push-up', 'Şınav', 'Göğüs',
    ['push up', 'pushup', 'push-up', 'sinav', 'şınav', 'press up'],
    [['Göğüs', 'Ön Omuz', 'Triceps'], ['Core', 'Serratus Anterior']],
    'Vücut Ağırlığı', 'Başlangıç', '3 - 4 Set x Maksimum Tekrar',
    [
      'Eller omuzlardan biraz geniş, vücut baştan topuğa düz.',
      'Dirsekleri 45° açıyla bükerek göğsü yere yaklaştırın.',
      'Göğsü ve triceps’i kullanarak yukarı itin.',
    ],
    ['Karın ve kalçayı sıkılı tutarak bel çökmesini önleyin.', 'Zorlaştırmak için ayakları yükseltin, kolaylaştırmak için dizlerde yapın.'],
    ['Belin çökmesi.', 'Yarım tekrar.'],
    ['Bench Press', 'Diamond Push-up', 'Dips'],
  ),
  E(
    'dips', 'Parallel Bar Dips', 'Paralel Bar Dips (Alt Göğüs & Arka Kol)', 'Göğüs',
    ['dips', 'dip', 'chest dips', 'göğüs dips', 'gogus dips', 'paralel bar', 'tricep dips', 'weighted dips'],
    [['Alt Göğüs (Pectoralis Major - Alt Baş)', 'Triceps (Arka Kol)'], ['Ön Omuz', 'Core']],
    'Paralel Dips Barları (Gerektiğinde Ağırlık Kemeri)', 'Orta', '3 Set x 8 - 12 Tekrar',
    [
      'Paralel barlara tutunup kendinizi yukarı itin.',
      'Gövdenizi 30° öne eğin ve dirsekleri hafifçe dışarı açın (göğüs odağı).',
      'Dirsekler 90° açı yapana kadar kontrollüce inin.',
      'Göğüs ve arka kollarla başlangıç noktasına itin.',
    ],
    ['Gövde ne kadar öne eğilirse göğüs o kadar çok çalışır; dik durursanız yük triceps’e kayar.'],
    ['Aşırı aşağı inip omuz kapsülünü zorlamak.', 'Yetersiz derinlik.'],
    ['Decline Bench Press', 'Cable Crossover', 'Close Grip Bench Press'],
    { breathing: 'İnerken nefes alın, yukarı kalkarken nefes verin.' },
  ),
  E(
    'landmine-press', 'Landmine Press', 'Landmine Pres (Üst Göğüs & Omuz)', 'Göğüs',
    ['landmine press', 'land mine press', 'landmine'],
    [['Üst Göğüs', 'Ön Omuz'], ['Triceps', 'Core', 'Serratus Anterior']],
    'Barbell, Landmine Aparatı veya Köşe, Plakalar', 'Orta', '3 Set x 8 - 12 Tekrar (Her Kol)',
    [
      'Barın ucunu omuz hizasında tutarak dik durun.',
      'Barı yukarı ve ileri doğru, kolu tamamen uzatana kadar itin.',
      'Kontrollüce omuz hizasına geri indirin.',
    ],
    ['Omuz sağlığı dostu bir pres varyasyonudur.'],
    ['Belden geriye yaslanmak.'],
    ['Incline Dumbbell Press', 'Overhead Press'],
  ),

  // ── SIRT (BACK) ────────────────────────────────────────────────────────────
  E(
    'lat-pulldown', 'Lat Pulldown', 'Geniş Tutuş Sırt Çekiş (Lat Pulldown)', 'Sırt',
    ['lat pulldown', 'lat pull down', 'lat pull', 'sırt çekiş', 'sirt cekis', 'pulldown', 'genis tutus lat', 'wide grip pulldown'],
    [['Kanat Kasları (Latissimus Dorsi)'], ['Biceps', 'Teres Major', 'Arka Omuz', 'Rhomboids']],
    'Kablolu Lat Pulldown İstasyonu, Geniş Bar', 'Başlangıç', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Diz destek süngerini bacaklarınız sıkıca oturacak şekilde ayarlayın.',
      'Barı omuz genişliğinden geniş, avuç içleri ileri bakacak şekilde tutun.',
      'Göğsünüzü açın ve gövdeyi 15-20° geriye eğin.',
      'Dirseklerinizle başlatarak barı üst göğüs hizasına çekin.',
      'Tepede 1 saniye sıkın, barı kontrollüce yukarı bırakın.',
    ],
    ['Dirsekleri aşağı ve arkaya çekmeye odaklanın.', 'İvme için vücudu savurmayın.'],
    ['Barı enseye çekmek.', 'Aşırı geriye yatıp bele yüklenmek.'],
    ['Pull-ups (Barfiks)', 'Close Grip Pulldown', 'Straight Arm Pulldown'],
  ),
  E(
    'close-grip-pulldown', 'Close Grip Pulldown', 'Dar / V-Tutuş Sırt Çekiş', 'Sırt',
    ['close grip pulldown', 'v bar pulldown', 'dar tutus lat', 'neutral grip pulldown', 'dar lat pulldown'],
    [['Latissimus Dorsi (Alt Lifler)', 'Orta Sırt'], ['Biceps', 'Rhomboids']],
    'Lat Pulldown İstasyonu, V-Bar', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'V-bar’ı tutup dizlerinizi sabitleyin.',
      'Hafif geriye yaslanıp barı üst karna doğru çekin.',
      'Dirsekleri vücuda yakın tutarak sıkın ve bırakın.',
    ],
    ['Alt kanat bölgesini hedeflemek için dirsekler gövdeye yakın seyretsin.'],
    ['Omuzları kulaklara çekmek.'],
    ['Lat Pulldown', 'Seated Cable Row'],
  ),
  E(
    'pull-ups', 'Pull-up / Chin-up', 'Barfiks (Vücut Ağırlığıyla Sırt Çekiş)', 'Sırt',
    ['pull up', 'pull ups', 'pull-up', 'pull-ups', 'pullup', 'barfiks', 'chin up', 'chin-up', 'chinup'],
    [['Kanat Kasları (Latissimus Dorsi)'], ['Biceps', 'Arka Omuz', 'Core']],
    'Barfiks Demiri', 'İleri', '3 - 4 Set x Maksimum Tekrar',
    [
      'Barı omuz genişliğinden biraz geniş kavrayın.',
      'Omuzlarınızı aşağı çekerek (scapular depression) başlayın.',
      'Çeneniz barın üzerine çıkana kadar çekin.',
      'Kontrollüce inerek kanatların tam esnemesini sağlayın.',
    ],
    ['Bacak sallamadan vücudu stabil tutun.', 'Chin-up (avuç içi sana dönük) biceps katkısını artırır.'],
    ['Yarım tekrar.', 'Kipping (sallanma) ile ivme almak.'],
    ['Lat Pulldown', 'Assisted Pull-up Machine'],
    { breathing: 'Yukarı çekerken nefes verin, aşağı inerken nefes alın.' },
  ),
  E(
    'barbell-row', 'Barbell Bent-Over Row', 'Eğilerek Barbell Sırt Çekiş', 'Sırt',
    ['barbell row', 'bent over row', 'bent-over row', 'barbell sirt', 'rowing', 'pendlay row', 'eğilerek çekiş'],
    [['Orta Sırt (Rhomboids, Trapez)', 'Latissimus Dorsi'], ['Arka Omuz', 'Biceps', 'Erector Spinae (Bel)']],
    'Olimpik Bar, Ağırlık Plakaları', 'Orta', '3 - 4 Set x 8 - 10 Tekrar',
    [
      'Ayaklar omuz genişliğinde, kalçayı geriye iterek gövdeyi 45° öne eğin.',
      'Sırtı dümdüz kilitleyip barı omuz genişliğinde kavrayın.',
      'Barı göbek deliğinize doğru, dirsekleri geriye sürerek çekin.',
      'Tepede sıkıp kontrollüce indirin.',
    ],
    ['Karın kaslarını sürekli sıkarak belin kamburlaşmasını önleyin.'],
    ['Gövdeyi yukarı kaldırarak ivme almak.', 'Boynu yukarı kırmak.'],
    ['T-Bar Row', 'Dumbbell Row', 'Seated Cable Row'],
  ),
  E(
    'dumbbell-row', 'One-Arm Dumbbell Row', 'Tek Kol Dumbbell Sırt Çekiş', 'Sırt',
    ['dumbbell row', 'dumbell row', 'one arm row', 'single arm row', 'tek kol row', 'db row', 'tek kol sirt'],
    [['Latissimus Dorsi', 'Orta Sırt'], ['Biceps', 'Arka Omuz']],
    'Bench, Dumbbell', 'Başlangıç', '3 - 4 Set x 10 - 12 Tekrar (Her Kol)',
    [
      'Bir diz ve eli sehpaya yerleştirin, sırtı yere paralel tutun.',
      'Dumbbell’ı kalçaya doğru, dirseği vücuda yakın çekin.',
      'Tepede sıkıp kontrollüce indirin.',
    ],
    ['Gövdeyi döndürmeden yalnızca kolun hareket etmesine izin verin.'],
    ['Omuzdan döndürerek ivme almak.'],
    ['Seated Cable Row', 'T-Bar Row'],
  ),
  E(
    'seated-cable-row', 'Seated Cable Row', 'Oturarak Kablolu Sırt Çekiş', 'Sırt',
    ['seated cable row', 'cable row', 'oturarak kurek', 'kablo row', 'seated row', 'oturarak sirt cekis'],
    [['Orta Sırt', 'Latissimus Dorsi', 'Rhomboids'], ['Biceps', 'Arka Omuz']],
    'Kablo Kürek İstasyonu, V-Bar Aparatı', 'Başlangıç', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Ayaklarınızı platforma koyun, dizler hafif bükülü.',
      'Gövde dik pozisyondayken V-barı karnınıza doğru çekin.',
      'Kürek kemiklerini birbirine sıkın.',
      'Kolları yavaşça uzatıp sırtın esnemesine izin verin.',
    ],
    ['Belinizi öne-arkaya aşırı sallamayın.'],
    ['Aşırı geriye yatmak.'],
    ['Chest-Supported Row', 'Dumbbell Row'],
  ),
  E(
    't-bar-row', 'T-Bar Row', 'T-Bar Sırt Çekiş', 'Sırt',
    ['t bar row', 't-bar row', 'tbar row', 'landmine row', 't bar'],
    [['Orta Sırt', 'Latissimus Dorsi'], ['Arka Omuz', 'Biceps', 'Bel']],
    'T-Bar Makinesi veya Landmine, V-Tutamak', 'Orta', '3 - 4 Set x 8 - 10 Tekrar',
    [
      'Barın üzerinde ayaklar iki yanda, kalçayı geriye itip öne eğilin.',
      'Tutamağı göğüs/üst karına doğru çekin.',
      'Kürek kemiklerini sıkıp yavaşça indirin.',
    ],
    ['Kalın orta sırt için en etkili harekettir.'],
    ['Sırtı yuvarlamak.'],
    ['Barbell Row', 'Chest-Supported Row'],
  ),
  E(
    'chest-supported-row', 'Chest-Supported Row', 'Göğüs Destekli Sırt Çekiş', 'Sırt',
    ['chest supported row', 'incline dumbbell row', 'seal row', 'machine row', 'makine sirt cekis', 'hammer row'],
    [['Orta Sırt', 'Latissimus Dorsi', 'Arka Omuz'], ['Biceps']],
    'Destekli Row Makinesi veya Eğimli Bench + Dumbbell', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Göğsünüzü pede yaslayın.',
      'Kolları uzatın ve dirsekleri geriye çekin.',
      'Tepede kürek kemiklerini sıkın ve yavaşça bırakın.',
    ],
    ['Bel yükü olmadığı için sırt izolasyonu için idealdir.'],
    ['Başı ileri uzatmak.'],
    ['Seated Cable Row', 'T-Bar Row'],
  ),
  E(
    'straight-arm-pulldown', 'Straight Arm Pulldown', 'Düz Kol Kablo Çekiş (Lat İzolasyon)', 'Sırt',
    ['straight arm pulldown', 'straight arm lat pulldown', 'duz kol pulldown', 'lat prayer'],
    [['Latissimus Dorsi'], ['Triceps Uzun Baş', 'Teres Major']],
    'Kablo İstasyonu, Düz Bar veya Halat', 'Orta', '3 Set x 12 - 15 Tekrar',
    [
      'Üst makarada bara uzanın, kollar hafif bükülü, gövde hafif öne eğik.',
      'Kolları düz tutarak barı uyluklara doğru kavisle indirin.',
      'Lat’ı sıkıp yavaşça yukarı bırakın.',
    ],
    ['Hareket tamamen omuz ekleminden gelmeli, dirsek açısı sabit kalsın.'],
    ['Kolları bükerek triceps pushdown’a çevirmek.'],
    ['Lat Pulldown', 'Dumbbell Pullover'],
  ),
  E(
    'dumbbell-pullover', 'Dumbbell Pullover', 'Dumbbell Pullover (Lat & Göğüs)', 'Sırt',
    ['pullover', 'dumbbell pullover', 'dumbell pullover', 'db pullover'],
    [['Latissimus Dorsi', 'Göğüs (Alt)'], ['Triceps Uzun Baş', 'Serratus']],
    'Bench, Dumbbell', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Bench’e sırtınızın üst kısmını yaslayıp dumbbell’ı iki elle göğsün üzerinde tutun.',
      'Kolları hafif bükülü şekilde başınızın arkasına doğru indirin.',
      'Lat ve göğüsle başlangıca geri çekin.',
    ],
    ['Kalçayı düşük tutup göğüs kafesini genişletin.'],
    ['Dirsekleri fazla bükmek.'],
    ['Straight Arm Pulldown', 'Lat Pulldown'],
  ),
  E(
    'conventional-deadlift', 'Conventional Deadlift', 'Deadlift (Yerden Ağırlık Kaldırma)', 'Sırt',
    ['deadlift', 'conventional deadlift', 'barbell deadlift', 'olu kaldirma', 'ölü kaldırma', 'dead lift'],
    [['Erector Spinae (Bel)', 'Gluteus', 'Hamstrings'], ['Trapez', 'Latissimus Dorsi', 'Önkol', 'Quadriceps']],
    'Olimpik Bar, Plakalar', 'İleri', '3 - 5 Set x 3 - 6 Tekrar',
    [
      'Ayaklar kalça genişliğinde, bar ayak ortasının üzerinde.',
      'Kalçayı geriye itip sırtı düz tutarak barı omuz genişliğinde kavrayın.',
      'Göğsü kaldırın, karnı sıkın ve yerden bacaklarla iterek kaldırın.',
      'Kalçayı öne iterek tamamen doğrulun, kontrollüce indirin.',
    ],
    ['Bar tüm hareket boyunca vücuda yakın seyretmeli.', 'Bel kemeri ve magnezyum ağır setlerde faydalıdır.'],
    ['Sırtı yuvarlamak.', 'Barı vücuttan uzaklaştırmak.', 'Kalçanın erken kalkması.'],
    ['Romanian Deadlift', 'Rack Pull', 'Trap Bar Deadlift'],
    { breathing: 'Kaldırmadan önce derin nefes alıp karnı sıkın (Valsalva); üstte nefesi verin.' },
  ),
  E(
    'sumo-deadlift', 'Sumo Deadlift', 'Sumo Deadlift', 'Bacak',
    ['sumo deadlift', 'sumo', 'sumo olu kaldirma'],
    [['Gluteus', 'Adductors', 'Hamstrings', 'Quadriceps'], ['Bel', 'Trapez']],
    'Olimpik Bar, Plakalar', 'İleri', '3 - 4 Set x 4 - 6 Tekrar',
    [
      'Ayakları omuzdan geniş, parmak uçları dışa dönük konumlandırın.',
      'Barı bacakların içinden kavrayın, göğsü kaldırın.',
      'Bacaklarla yeri iterek doğrulun ve kalçayı sıkın.',
    ],
    ['Dizler ayak yönünde açılmalı.'],
    ['Dizleri içe çökertmek.'],
    ['Conventional Deadlift', 'Goblet Squat'],
  ),
  E(
    'rack-pull', 'Rack Pull', 'Rack Pull (Üst Sırt & Trapez)', 'Sırt',
    ['rack pull', 'rack deadlift', 'blok pull'],
    [['Üst Sırt', 'Trapez', 'Erector Spinae'], ['Gluteus', 'Önkol']],
    'Squat Rack, Olimpik Bar', 'Orta', '3 Set x 5 - 8 Tekrar',
    [
      'Barı diz altı/üstü hizasında güvenlik pimlerine yerleştirin.',
      'Sırt düz, göğüs açık şekilde barı kavrayın.',
      'Kalçayı öne iterek doğrulun, trapezleri sıkın.',
    ],
    ['Kavrama gücünü geliştirmek için straps kullanabilirsiniz.'],
    ['Aşırı hiperekstansiyon.'],
    ['Deadlift', 'Barbell Shrug'],
  ),
  E(
    'hyperextension', 'Back Extension', 'Sırt Ekstansiyon / Hiperekstansiyon (Alt Sırt)', 'Sırt',
    ['back extension', 'hyperextension', 'hyper extension', 'bel egzersizi', 'alt sirt', 'roman chair', 'bel extension'],
    [['Erector Spinae (Bel)', 'Gluteus'], ['Hamstrings']],
    'Hiperekstansiyon Bankı', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Kalçanızı pedin kenarına yerleştirip ayakları sabitleyin.',
      'Gövdeyi bel kıvrımından öne indirin.',
      'Kalça ve belle gövdeyi vücut düz çizgi olana kadar kaldırın.',
    ],
    ['Üstte aşırı geriye kıvrılmayın; nötr omurga yeterli.'],
    ['Belden hiperekstansiyon yapmak.'],
    ['Good Morning', 'Romanian Deadlift'],
  ),
  E(
    'inverted-row', 'Inverted Row', 'Ters Kürek (Australian Pull-up)', 'Sırt',
    ['inverted row', 'australian pull up', 'body row', 'ters kurek', 'trx row'],
    [['Orta Sırt', 'Latissimus Dorsi'], ['Biceps', 'Arka Omuz', 'Core']],
    'Smith Bar / TRX / Düşük Barfiks', 'Başlangıç', '3 Set x 8 - 15 Tekrar',
    [
      'Barın altına uzanıp elleri omuzdan geniş kavrayın.',
      'Vücudu düz tutarak göğsü bara çekin.',
      'Kontrollüce uzanın.',
    ],
    ['Ayakları yükselterek zorluk artırın.'],
    ['Kalçanın çökmesi.'],
    ['Seated Cable Row', 'Pull-up'],
  ),
  E(
    'barbell-shrug', 'Barbell Shrug', 'Barbell / Dumbbell Omuz Silkme (Trapez)', 'Omuz',
    ['shrug', 'shrugs', 'barbell shrug', 'dumbbell shrug', 'trapez', 'trap', 'omuz silkme'],
    [['Üst Trapez'], ['Önkol', 'Levator Scapulae']],
    'Barbell veya Dumbbell', 'Başlangıç', '3 - 4 Set x 10 - 15 Tekrar',
    [
      'Ağırlıkları kollar düz olacak şekilde önünüzde/yanlarda tutun.',
      'Omuzları kulaklara doğru yukarı çekin.',
      'Tepede 1-2 saniye sıkıp kontrollüce bırakın.',
    ],
    ['Omuzları döndürmeyin; yalnızca düz yukarı-aşağı hareket.'],
    ['Başı öne uzatmak.', 'Biceps ile çekmek.'],
    ['Rack Pull', 'Face Pull'],
  ),

  // ── OMUZ (SHOULDERS) ───────────────────────────────────────────────────────
  E(
    'overhead-press', 'Overhead Press (OHP)', 'Ayakta Askeri Omuz Pres', 'Omuz',
    ['overhead press', 'military press', 'shoulder press', 'omuz press', 'ohp', 'barbell shoulder press', 'askeri pres', 'standing press'],
    [['Ön Omuz (Anterior Deltoid)', 'Yan Omuz (Lateral Deltoid)'], ['Triceps', 'Üst Göğüs', 'Core']],
    'Olimpik Bar veya Dumbbell Çifti', 'Orta', '3 - 4 Set x 8 - 10 Tekrar',
    [
      'Barı köprücük kemiği hizasında, eller omuz genişliğinde kavrayın.',
      'Kalça ve karını sıkarak sağlam bir gövde duruşu oluşturun.',
      'Barı çenenizin önünden dikey hatta başınızın üzerine itin.',
      'Bar baş hizasını geçince başınızı hafifçe öne alıp barı tam üzerinde kilitleyin.',
      'Kontrollüce köprücük kemiğine indirin.',
    ],
    ['Kalçayı sıkmak beli korur.'],
    ['Bacaklardan destek alarak itmek.', 'Belin aşırı bükülmesi.'],
    ['Seated Dumbbell Shoulder Press', 'Arnold Press', 'Machine Shoulder Press'],
    { breathing: 'İterken nefes verin, indirirken nefes alın.' },
  ),
  E(
    'seated-dumbbell-shoulder-press', 'Seated Dumbbell Shoulder Press', 'Oturarak Dumbbell Omuz Pres', 'Omuz',
    ['seated dumbbell press', 'dumbbell shoulder press', 'dumbell shoulder press', 'db shoulder press', 'dambil omuz press', 'seated shoulder press'],
    [['Ön ve Yan Omuz'], ['Triceps', 'Üst Trapez']],
    'Dik Sırt Destekli Bench, 2x Dumbbell', 'Orta', '3 - 4 Set x 8 - 12 Tekrar',
    [
      'Sehpayı 80-90° ayarlayıp dumbbell’ları omuz hizasında tutun.',
      'Dirsekleri 75° öne açarak dumbbell’ları yukarı itin.',
      'Üstte hafifçe birleştirip kontrollüce indirin.',
    ],
    ['Belinizi sehpadan koparmayın.'],
    ['Dirsekleri tam yana açmak.'],
    ['Overhead Press', 'Arnold Press'],
  ),
  E(
    'arnold-press', 'Arnold Press', 'Arnold Press', 'Omuz',
    ['arnold press', 'arnold', 'arnold dumbbell press'],
    [['Ön Omuz', 'Yan Omuz'], ['Triceps', 'Üst Göğüs']],
    '2x Dumbbell, Bench', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Dumbbell’ları avuç içleri size dönük olarak göğüs hizasında tutun.',
      'Yukarı iterken bilekleri dışa doğru döndürün.',
      'Üstte avuç içleri ileri baksın; geri dönüşte hareketi tersine çevirin.',
    ],
    ['Tüm deltoid başlarını çalıştırır; daha hafif ağırlıkla başlayın.'],
    ['Dönüşü aceleye getirmek.'],
    ['Seated Dumbbell Press', 'Overhead Press'],
  ),
  E(
    'machine-shoulder-press', 'Machine Shoulder Press', 'Makine Omuz Pres', 'Omuz',
    ['machine shoulder press', 'omuz makinesi', 'shoulder press machine', 'smith shoulder press'],
    [['Ön ve Yan Omuz'], ['Triceps']],
    'Omuz Pres Makinesi', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Koltuğu tutamaçlar omuz hizasında olacak şekilde ayarlayın.',
      'Sırtı yaslayıp kolları yukarı itin.',
      'Kontrollüce indirin.',
    ],
    ['Stabilite gerektirmediği için tükeniş setlerinde güvenlidir.'],
    ['Omuzları kulaklara çekmek.'],
    ['Seated Dumbbell Press'],
  ),
  E(
    'lateral-raise', 'Dumbbell Lateral Raise', 'Dumbbell Yan Omuz Açış', 'Omuz',
    ['lateral raise', 'lateral raises', 'side raise', 'yan omuz', 'omuz acis', 'side lateral', 'dambıl yana açış', 'yana acis', 'side delt raise'],
    [['Yan Omuz (Lateral Deltoid)'], ['Ön Omuz', 'Trapez']],
    '2 Adet Hafif / Orta Dumbbell', 'Başlangıç / Orta', '4 Set x 12 - 15 Tekrar',
    [
      'Dumbbell’ları yanlarda tutarak dik durun, dirsekleri hafif kırın.',
      'Dirseklerle yönlendirerek kolları omuz hizasına kadar kaldırın.',
      'Tepede yan omuzları hissedip 2 saniyede indirin.',
    ],
    ['Ağır kilolar yerine hafif kilolarla mükemmel form.', 'Küçük parmağınız hafif yukarıda olsun.'],
    ['Ağırlığı zıplayarak fırlatmak.', 'Trapezle kaldırmak.'],
    ['Cable Lateral Raise', 'Machine Lateral Raise'],
  ),
  E(
    'cable-lateral-raise', 'Cable Lateral Raise', 'Kablolu Yan Omuz Açış', 'Omuz',
    ['cable lateral raise', 'kablo yan omuz', 'cable side raise', 'machine lateral raise'],
    [['Yan Omuz'], ['Ön Omuz', 'Trapez']],
    'Kablo İstasyonu (alt makara)', 'Orta', '3 - 4 Set x 12 - 15 Tekrar',
    [
      'Alt makarayı karşı elinizle kavrayıp yana durun.',
      'Kolu omuz hizasına kadar yana kaldırın.',
      'Kontrollüce indirin.',
    ],
    ['Kablo, alt kısımda da sürekli gerilim sağlar.'],
    ['Gövdeyi yana yatırmak.'],
    ['Dumbbell Lateral Raise'],
  ),
  E(
    'front-raise', 'Front Raise', 'Dumbbell Ön Omuz Kaldırış', 'Omuz',
    ['front raise', 'dumbbell front raise', 'on omuz', 'plate front raise'],
    [['Ön Omuz'], ['Üst Göğüs', 'Serratus']],
    'Dumbbell, Plaka veya Kablo', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Ağırlığı uyluk önünde tutun.',
      'Kolu hafif bükülü şekilde omuz hizasına kadar kaldırın.',
      'Yavaşça indirin.',
    ],
    ['Pres hareketlerinden ön omuz yükü zaten alınır; hacmi kısıtlı tutun.'],
    ['Belden sallanmak.'],
    ['Overhead Press', 'Cable Front Raise'],
  ),
  E(
    'rear-delt-fly', 'Rear Delt Fly', 'Arka Omuz Dumbbell Açış (Bent-Over)', 'Omuz',
    ['rear delt fly', 'reverse fly', 'bent over lateral raise', 'arka omuz', 'rear delt raise', 'reverse dumbbell fly'],
    [['Arka Omuz (Posterior Deltoid)'], ['Rhomboids', 'Orta Trapez']],
    '2x Hafif Dumbbell', 'Başlangıç / Orta', '3 - 4 Set x 12 - 15 Tekrar',
    [
      'Kalçadan öne eğilin, sırt düz.',
      'Dumbbell’ları dirsekler hafif bükülü şekilde yanlara doğru kaldırın.',
      'Tepede arka omuzları sıkıp kontrollüce indirin.',
    ],
    ['Küçük ağırlıklar ve mükemmel form yeterlidir.'],
    ['Sırtla çekip trapezi devreye sokmak.'],
    ['Reverse Pec Deck', 'Face Pull'],
  ),
  E(
    'reverse-pec-deck', 'Reverse Pec Deck', 'Ters Pec Deck (Arka Omuz)', 'Omuz',
    ['reverse pec deck', 'reverse butterfly', 'ters pec deck', 'rear delt machine'],
    [['Arka Omuz'], ['Rhomboids', 'Orta Trapez']],
    'Pec Deck Makinesi', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Makineye göğsünüz pede dönük oturun.',
      'Kolları yanlara doğru açın.',
      'Tepede sıkıp kontrollüce bırakın.',
    ],
    ['Dirsek seviyesini omuz hizasında tutun.'],
    ['Kolları geriye aşırı çekmek.'],
    ['Face Pull', 'Rear Delt Fly'],
  ),
  E(
    'face-pull', 'Cable Face Pull', 'Kablolu Yüze Çekiş (Arka Omuz & Postür)', 'Omuz',
    ['face pull', 'facepull', 'arka omuz kablo', 'face pull halat', 'yuze cekis'],
    [['Arka Omuz (Posterior Deltoid)', 'Rotator Cuff'], ['Orta Trapez', 'Rhomboids']],
    'Kablo İstasyonu, Halat Aparatı', 'Başlangıç', '3 - 4 Set x 15 - 20 Tekrar',
    [
      'Makarayı göz hizasına getirin, halatı başparmaklar arkaya bakacak şekilde tutun.',
      'Halatı yüzünüze/alnınıza çekerken dirsekleri dışa ve yukarı açın.',
      'Bilekleri dışa döndürerek tepede arka omuzları sıkın.',
    ],
    ['Omuz sağlığı ve kamburluğu önlemek için en iyi hareketlerden biridir.'],
    ['Dirsekleri aşağı düşürmek.', 'Çok ağır yük.'],
    ['Reverse Pec Deck', 'Dumbbell Rear Delt Fly'],
    { breathing: 'Çekerken nefes verin, bırakırken nefes alın.' },
  ),
  E(
    'upright-row', 'Upright Row', 'Dik Çekiş (Omuz & Trapez)', 'Omuz',
    ['upright row', 'dik cekis', 'barbell upright row', 'cable upright row'],
    [['Yan Omuz', 'Üst Trapez'], ['Biceps', 'Ön Omuz']],
    'EZ-Bar, Barbell veya Kablo', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Barı dar-orta tutuşla uyluk önünde tutun.',
      'Dirsekleri yukarı yönlendirerek barı göğüs hizasına çekin.',
      'Kontrollüce indirin.',
    ],
    ['Omuz sıkışmasını önlemek için bar çene hizasına kadar çıkarılmamalı.'],
    ['Barı çok yukarı çekmek.'],
    ['Lateral Raise', 'Face Pull'],
  ),

  // ── BACAK (LEGS) ───────────────────────────────────────────────────────────
  E(
    'barbell-squat', 'Barbell Back Squat', 'Barbell Sırt Squat', 'Bacak',
    ['squat', 'squats', 'back squat', 'barbell squat', 'bacak squat', 'çömelme'],
    [['Ön Bacak (Quadriceps)', 'Kalça (Gluteus Maximus)'], ['Arka Bacak (Hamstrings)', 'Alt Sırt', 'Core']],
    'Squat Rack, Olimpik Bar, Plakalar', 'İleri', '4 Set x 6 - 8 Tekrar',
    [
      'Barı trapez kaslarınızın üzerine yerleştirin.',
      'Ayakları omuz genişliğinde, parmak uçlarını hafif dışa çevirin.',
      'Kalçayı geriye iterek uyluk kemiği yere paralel olana kadar inin.',
      'Topuklardan güç alarak dik duruşa yükselin.',
    ],
    ['Dizlerin içeri çökmesine asla izin vermeyin.', 'Göğüs açık, bakış ileride.'],
    ['Topukları yerden kaldırmak.', 'Sırtı yuvarlamak.'],
    ['Leg Press', 'Goblet Squat', 'Hack Squat'],
    { breathing: 'İnerken nefes alın, kalkışta nefes verin.' },
  ),
  E(
    'front-squat', 'Front Squat', 'Ön Squat', 'Bacak',
    ['front squat', 'on squat', 'barbell front squat'],
    [['Quadriceps', 'Gluteus'], ['Core', 'Üst Sırt']],
    'Squat Rack, Olimpik Bar', 'İleri', '3 - 4 Set x 5 - 8 Tekrar',
    [
      'Barı ön omuzlara yerleştirip dirsekleri yüksek tutun.',
      'Dik gövdeyle çömelin.',
      'Topuklarla iterek kalkın.',
    ],
    ['Esnek bilekler yoksa strap kullanın.'],
    ['Dirsekleri düşürmek.'],
    ['Goblet Squat', 'Hack Squat'],
  ),
  E(
    'goblet-squat', 'Goblet Squat', 'Goblet Squat', 'Bacak',
    ['goblet squat', 'dumbbell squat', 'kettlebell squat'],
    [['Quadriceps', 'Gluteus'], ['Core', 'Adductors']],
    'Dumbbell veya Kettlebell', 'Başlangıç', '3 Set x 10 - 15 Tekrar',
    [
      'Ağırlığı göğsünüzün önünde iki elle tutun.',
      'Dirsekleri dizlerin içine doğru sokarak çömelin.',
      'Topuklardan iterek kalkın.',
    ],
    ['Squat tekniğini öğrenmek için idealdir.'],
    ['Gövdeyi öne yıkmak.'],
    ['Barbell Squat', 'Leg Press'],
  ),
  E(
    'hack-squat', 'Hack Squat', 'Hack Squat Makinesi', 'Bacak',
    ['hack squat', 'hack', 'hack squat makinesi'],
    [['Quadriceps'], ['Gluteus', 'Hamstrings']],
    'Hack Squat Makinesi', 'Orta', '3 - 4 Set x 8 - 12 Tekrar',
    [
      'Sırtınızı yaslayıp ayakları platforma yerleştirin.',
      'Dizler 90° olana kadar inin.',
      'Topuklardan iterek kalkın.',
    ],
    ['Ayakları aşağı koyarsanız quadriceps vurgusu artar.'],
    ['Dizleri kilitlemek.'],
    ['Leg Press', 'Barbell Squat'],
  ),
  E(
    'leg-press', 'Leg Press 45°', '45 Derece Bacak Pres Makinesi', 'Bacak',
    ['leg press', 'legpress', 'bacak pres', '45 leg press'],
    [['Quadriceps (Ön Bacak)'], ['Gluteus (Kalça)', 'Hamstrings']],
    '45° Leg Press Makinesi', 'Başlangıç / Orta', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Sırtınızı koltuğa tamamen yaslayın, ayakları omuz genişliğinde platforma koyun.',
      'Güvenlik kilitlerini açın, dizler 90° olana kadar kontrollüce indirin.',
      'Topuklardan iterek yukarı kaldırın (dizleri kilitlemeyin).',
    ],
    ['Tepe noktada dizleri ASLA tam kilitlemeyin.'],
    ['Belin altını koltuktan kaldırmak.'],
    ['Hack Squat', 'Barbell Squat'],
  ),
  E(
    'bulgarian-split-squat', 'Bulgarian Split Squat', 'Bulgar Split Squat', 'Bacak',
    ['bulgarian split squat', 'split squat', 'bulgar squat', 'tek bacak squat', 'rear foot elevated split squat'],
    [['Quadriceps', 'Gluteus'], ['Hamstrings', 'Core', 'Adductors']],
    'Bench, Dumbbell (opsiyonel)', 'Orta', '3 Set x 8 - 12 Tekrar (Her Bacak)',
    [
      'Arka ayağınızı bench’e koyun, ön ayağı 60-90 cm öne yerleştirin.',
      'Gövdeyi dik tutarak ön dize kadar çömelin.',
      'Ön topuktan iterek kalkın.',
    ],
    ['Gövdeyi öne eğmek kalçayı, dik durmak quadriceps’i vurgular.'],
    ['Dizin ayak ucunun çok ilerisine geçmesi.'],
    ['Walking Lunge', 'Reverse Lunge'],
  ),
  E(
    'walking-lunge', 'Walking Lunge', 'Yürüyüşlü Lunge', 'Bacak',
    ['lunge', 'lunges', 'walking lunge', 'yuruyus lunge', 'dumbbell lunge', 'dumbell lunge'],
    [['Quadriceps', 'Gluteus'], ['Hamstrings', 'Core', 'Baldır']],
    'Dumbbell veya Barbell (opsiyonel)', 'Orta', '3 Set x 10 - 12 Adım (Her Bacak)',
    [
      'Dik durup bir adım öne atın.',
      'Arka diz yere yaklaşana kadar inin.',
      'Ön topukla iterek diğer bacakla öne adım atın.',
    ],
    ['Adım uzunluğu dizin 90° olmasını sağlamalı.'],
    ['Dizi içe çökertmek.'],
    ['Reverse Lunge', 'Bulgarian Split Squat'],
  ),
  E(
    'reverse-lunge', 'Reverse Lunge', 'Geri Lunge', 'Bacak',
    ['reverse lunge', 'geri lunge', 'back lunge'],
    [['Gluteus', 'Quadriceps'], ['Hamstrings', 'Core']],
    'Dumbbell veya Barbell', 'Başlangıç / Orta', '3 Set x 10 - 12 Tekrar (Her Bacak)',
    [
      'Dik durup bir ayağınızla geriye adım atın.',
      'Arka diz yere yaklaşana kadar inin.',
      'Ön topuktan iterek başlangıca dönün.',
    ],
    ['Diz üzerindeki stresi öne lunge’a göre azaltır.'],
    ['Gövdeyi aşırı öne eğmek.'],
    ['Walking Lunge', 'Step-Up'],
  ),
  E(
    'step-up', 'Step-Up', 'Step-Up (Basamağa Çıkış)', 'Bacak',
    ['step up', 'step-up', 'stepup', 'basamak cikis'],
    [['Quadriceps', 'Gluteus'], ['Hamstrings', 'Baldır']],
    'Bench veya Kutu, Dumbbell (opsiyonel)', 'Başlangıç', '3 Set x 10 - 12 Tekrar (Her Bacak)',
    [
      'Bir ayağınızı kutuya yerleştirin.',
      'Ön ayakla iterek yukarı çıkın.',
      'Kontrollüce aşağı inin.',
    ],
    ['Arka bacakla destek almayın.'],
    ['Zıplamak.'],
    ['Reverse Lunge', 'Bulgarian Split Squat'],
  ),
  E(
    'romanian-deadlift', 'Romanian Deadlift (RDL)', 'Rumen Deadlift (Arka Bacak & Kalça)', 'Bacak',
    ['romanian deadlift', 'rdl', 'arka bacak', 'stiff leg deadlift', 'stiff deadlift', 'rumen deadlift'],
    [['Arka Bacak (Hamstrings)', 'Kalça (Gluteus Maximus)'], ['Bel (Erector Spinae)', 'Trapez']],
    'Barbell veya 2x Ağır Dumbbell', 'Orta', '3 - 4 Set x 8 - 10 Tekrar',
    [
      'Barı omuz genişliğinde kavrayın, dizleri hafifçe kırın.',
      'Kalçayı arkaya iterek barı bacaklara yakın kaval kemiği ortasına kadar indirin.',
      'Arka bacakta gerilme hissedince kalçayı öne iterek doğrulun.',
    ],
    ['Gövdeyi eğmeye değil, kalçayı arkadaki duvara değdirmeye odaklanın.'],
    ['Sırtı kamburlaştırmak.', 'Barı vücuttan uzak tutmak.'],
    ['Lying Leg Curl', 'Good Morning'],
    { breathing: 'İnerken nefes alın, kalkarken nefes verin.' },
  ),
  E(
    'good-morning', 'Good Morning', 'Good Morning (Arka Zincir)', 'Bacak',
    ['good morning', 'goodmorning', 'barbell good morning'],
    [['Hamstrings', 'Bel', 'Gluteus'], ['Core']],
    'Barbell', 'İleri', '3 Set x 8 - 12 Tekrar',
    [
      'Barı sırtınıza yerleştirin, dizleri hafif kırın.',
      'Kalçayı geriye iterek gövdeyi yere paralele yaklaştırın.',
      'Kalçayı öne iterek doğrulun.',
    ],
    ['Hafif ağırlıkla başlayın.'],
    ['Sırtı yuvarlamak.'],
    ['Romanian Deadlift', 'Back Extension'],
  ),
  E(
    'leg-extension', 'Leg Extension', 'Oturarak Ön Bacak Açış', 'Bacak',
    ['leg extension', 'on bacak', 'bacak acis', 'quad extension', 'leg ext'],
    [['Ön Bacak (Quadriceps)'], []],
    'Leg Extension Makinesi', 'Başlangıç', '3 - 4 Set x 12 - 15 Tekrar',
    [
      'Diz ekleminizi makinenin dönme ekseniyle aynı hizaya getirin.',
      'Bacakları uzatarak tepede quadriceps’i 1 saniye sıkın.',
      'Yavaşça başlangıç pozisyonuna indirin.',
    ],
    ['Tepe noktada kası kilitli tutmak hipertrofiyi artırır.'],
    ['Ağırlığı hızlıca bırakmak.'],
    ['Sissy Squat', 'Goblet Squat'],
    { breathing: 'Uzatırken nefes verin, indirirken nefes alın.' },
  ),
  E(
    'lying-leg-curl', 'Lying Leg Curl', 'Yatarak Arka Bacak Curl', 'Bacak',
    ['lying leg curl', 'leg curl', 'hamstring curl', 'arka bacak curl', 'yatarak leg curl', 'prone leg curl'],
    [['Hamstrings'], ['Baldır (Gastrocnemius)']],
    'Lying Leg Curl Makinesi', 'Başlangıç', '3 - 4 Set x 10 - 15 Tekrar',
    [
      'Yüzüstü uzanıp pedi aşil tendonunun üstüne yerleştirin.',
      'Topukları kalçaya doğru çekin.',
      'Yavaşça uzatarak başlangıca dönün.',
    ],
    ['Kalçayı sehpadan kaldırmayın.'],
    ['Ağırlığı sallayarak çekmek.'],
    ['Seated Leg Curl', 'Romanian Deadlift'],
  ),
  E(
    'seated-leg-curl', 'Seated Leg Curl', 'Oturarak Arka Bacak Curl', 'Bacak',
    ['seated leg curl', 'oturarak leg curl', 'oturarak arka bacak'],
    [['Hamstrings'], ['Baldır']],
    'Seated Leg Curl Makinesi', 'Başlangıç', '3 Set x 10 - 15 Tekrar',
    [
      'Pedi aşil üstüne, uyluk pedini bacaklara sabitleyin.',
      'Topukları aşağı ve arkaya çekin.',
      'Kontrollüce bırakın.',
    ],
    ['Oturma pozisyonu hamstring’i gerilmiş halde çalıştırarak daha çok hipertrofi sağlayabilir.'],
    ['Kalçayı kaldırmak.'],
    ['Lying Leg Curl'],
  ),
  E(
    'hip-thrust', 'Barbell Hip Thrust', 'Barbell Kalça İtiş (Hip Thrust)', 'Bacak',
    ['hip thrust', 'hip thrusts', 'barbell hip thrust', 'kalca itis', 'glute bridge barbell', 'kalça itiş'],
    [['Gluteus Maximus'], ['Hamstrings', 'Quadriceps', 'Core']],
    'Bench, Olimpik Bar, Pad', 'Orta', '3 - 4 Set x 8 - 12 Tekrar',
    [
      'Üst sırtınızı bench’e yaslayıp barı kalçanıza yerleştirin.',
      'Ayakları yere basıp kalçayı yukarı itin.',
      'Tepede kalçayı 1-2 saniye sıkın ve kontrollüce indirin.',
    ],
    ['Tepede çene göğse yakın, kaburgalar aşağıda olsun.'],
    ['Belle aşırı geriye bükülmek.'],
    ['Glute Bridge', 'Cable Kickback'],
  ),
  E(
    'glute-bridge', 'Glute Bridge', 'Kalça Köprüsü (Glute Bridge)', 'Bacak',
    ['glute bridge', 'kalca kopru', 'hip bridge', 'bridge'],
    [['Gluteus Maximus'], ['Hamstrings', 'Core']],
    'Mat (opsiyonel Dumbbell)', 'Başlangıç', '3 Set x 12 - 20 Tekrar',
    [
      'Sırtüstü yatıp dizleri bükün, ayaklar yerde.',
      'Kalçayı yukarı kaldırın ve tepede sıkın.',
      'Kontrollüce indirin.',
    ],
    ['Ağırlık ekleyerek ilerletin.'],
    ['Belle yukarı itmek.'],
    ['Hip Thrust'],
  ),
  E(
    'cable-glute-kickback', 'Cable Glute Kickback', 'Kablolu Kalça Geri Tekme', 'Bacak',
    ['cable kickback', 'glute kickback', 'kalca tekme', 'donkey kick', 'cable glute kickback'],
    [['Gluteus Maximus'], ['Hamstrings']],
    'Kablo İstasyonu, Ayak Bilekliği', 'Başlangıç', '3 Set x 12 - 15 Tekrar (Her Bacak)',
    [
      'Bilekliği ayağınıza takıp makineye tutunun.',
      'Bacağı geriye ve yukarı doğru uzatın.',
      'Tepede kalçayı sıkıp kontrollüce dönün.',
    ],
    ['Belinizi aşırı bükmeden kalçayla yönlendirin.'],
    ['Bacağı savurmak.'],
    ['Hip Thrust', 'Glute Bridge'],
  ),
  E(
    'standing-calf-raise', 'Standing Calf Raise', 'Ayakta Baldır Kaldırma', 'Bacak',
    ['calf raise', 'standing calf raise', 'baldir', 'baldır', 'calf', 'baldir kaldirma'],
    [['Baldır (Gastrocnemius)'], ['Soleus']],
    'Baldır Makinesi veya Smith/Basamak', 'Başlangıç', '4 Set x 12 - 20 Tekrar',
    [
      'Ayak ucunuzu platformun kenarına yerleştirin.',
      'Topuklarınızı tam aşağı bırakıp esneyin.',
      'Parmak uçlarında yükselip tepede 1-2 saniye sıkın.',
    ],
    ['Tam ROM ve duraklamalı tekrar önemlidir.'],
    ['Yarım hareket ve zıplama.'],
    ['Seated Calf Raise', 'Leg Press Calf Raise'],
  ),
  E(
    'seated-calf-raise', 'Seated Calf Raise', 'Oturarak Baldır Kaldırma', 'Bacak',
    ['seated calf raise', 'oturarak baldir', 'soleus raise'],
    [['Soleus (Alt Baldır)'], ['Gastrocnemius']],
    'Seated Calf Makinesi', 'Başlangıç', '3 - 4 Set x 12 - 20 Tekrar',
    [
      'Dizler pedin altında, ayak uçları platformda oturun.',
      'Topukları tam aşağı bırakın.',
      'Yükselip tepede sıkın.',
    ],
    ['Soleus için diz bükük çalışmak şarttır.'],
    ['Hızlı hareket.'],
    ['Standing Calf Raise'],
  ),
  E(
    'hip-adduction', 'Hip Adduction Machine', 'Bacak İç Toplama Makinesi (Adductor)', 'Bacak',
    ['adductor', 'hip adduction', 'ic bacak', 'iç bacak', 'adductor machine', 'inner thigh'],
    [['Adductor Grubu (İç Bacak)'], []],
    'Adductor Makinesi', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Pedleri iç dizlere yerleştirip oturun.',
      'Bacakları birbirine doğru sıkın.',
      'Kontrollüce açın.',
    ],
    ['Tam ROM kullanın ama aşırı germeyin.'],
    ['Ağırlıkla zıplatmak.'],
    ['Sumo Squat', 'Cable Adduction'],
  ),
  E(
    'hip-abduction', 'Hip Abduction Machine', 'Bacak Dış Açma Makinesi (Abductor)', 'Bacak',
    ['abductor', 'hip abduction', 'dis bacak', 'dış bacak', 'abductor machine', 'outer thigh'],
    [['Gluteus Medius', 'Gluteus Minimus'], ['TFL']],
    'Abductor Makinesi', 'Başlangıç', '3 Set x 12 - 20 Tekrar',
    [
      'Pedleri dış dizlere yerleştirip oturun.',
      'Bacakları dışarı doğru açın.',
      'Kontrollüce kapatın.',
    ],
    ['Hafif öne eğilmek kalça orta lifini daha çok vurgular.'],
    ['Hızlı tekrar.'],
    ['Cable Hip Abduction', 'Side-Lying Leg Raise'],
  ),

  // ── KOL (ARMS) ─────────────────────────────────────────────────────────────
  E(
    'barbell-bicep-curl', 'Barbell Bicep Curl', 'Barbell Ön Kol / Biceps Bükme', 'Kol',
    ['bicep curl', 'biceps curl', 'barbell curl', 'on kol', 'biceps', 'barbell bicep', 'ez bar curl', 'z bar curl'],
    [['Biceps Brachii (Pazı)'], ['Brachialis', 'Önkol']],
    'Düz Bar veya Z-Bar (EZ-Bar)', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Barı avuç içleri yukarı, omuz genişliğinde kavrayın.',
      'Dirsekleri gövdenin yanına sabitleyin.',
      'Barı göğüs hizasına bükün, tepede biceps’i sıkın.',
      'Ağırlığı 2-3 saniyede kontrollüce indirin.',
    ],
    ['Gövdeyi sallayarak ivme almayın.'],
    ['Dirsekleri öne fırlatmak.'],
    ['Dumbbell Incline Curl', 'Preacher Curl', 'Hammer Curl'],
  ),
  E(
    'dumbbell-curl', 'Dumbbell Bicep Curl', 'Dumbbell Biceps Bükme', 'Kol',
    ['dumbbell curl', 'dumbell curl', 'db curl', 'alternating curl', 'dambil curl', 'biceps dumbbell'],
    [['Biceps Brachii'], ['Brachialis', 'Önkol']],
    '2x Dumbbell', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Dumbbell’ları yanlarda, avuç içleri ileri bakacak şekilde tutun.',
      'Dirsekleri sabitleyip bükün; yukarıda avuç içini hafifçe dışa çevirin (supinasyon).',
      'Kontrollüce indirin.',
    ],
    ['Dönüşümlü yaparak her kola odaklanın.'],
    ['Omuzu öne kaldırmak.'],
    ['Barbell Curl', 'Cable Curl'],
  ),
  E(
    'incline-dumbbell-curl', 'Incline Dumbbell Curl', 'Eğik Sehpa Dumbbell Curl (Biceps Uzun Baş)', 'Kol',
    ['incline curl', 'incline dumbbell curl', 'incline dumbell curl', 'egik curl'],
    [['Biceps Uzun Baş'], ['Brachialis']],
    'Eğimli Bench (45-60°), 2x Dumbbell', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Sehpayı 45-60° ayarlayıp sırtı yaslayın.',
      'Kollar aşağı sarkarken dumbbell’ları bükün.',
      'Tepede sıkıp yavaşça indirin.',
    ],
    ['Gerilmiş pozisyonda çalıştığı için uzun başı etkin vurgular.'],
    ['Dirsekleri öne kaydırmak.'],
    ['Barbell Curl', 'Preacher Curl'],
    { benchAngle: '45° - 60° Eğim' },
  ),
  E(
    'preacher-curl', 'Preacher Curl', 'Preacher Curl (Scott Curl)', 'Kol',
    ['preacher curl', 'scott curl', 'preacher', 'scott bench'],
    [['Biceps (Kısa Baş)'], ['Brachialis']],
    'Preacher Bench, EZ-Bar veya Dumbbell', 'Başlangıç / Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Kollarınızı pedin üzerine yerleştirin.',
      'Barı bükerek yukarı kaldırın.',
      'Alt noktada kolları tamamen açmadan yavaşça indirin.',
    ],
    ['Altta aşırı açılmak tendon yaralanma riskini artırır.'],
    ['Ağırlığı hızlı bırakmak.'],
    ['Concentration Curl', 'Cable Curl'],
  ),
  E(
    'concentration-curl', 'Concentration Curl', 'Konsantrasyon Curl', 'Kol',
    ['concentration curl', 'konsantrasyon curl', 'single arm curl'],
    [['Biceps Tepe'], ['Brachialis']],
    'Dumbbell, Bench', 'Başlangıç', '3 Set x 10 - 12 Tekrar (Her Kol)',
    [
      'Oturup dirseği iç uyluğa dayayın.',
      'Dumbbell’ı omuza doğru bükün.',
      'Tepede sıkıp indirin.',
    ],
    ['İzolasyon ve zihin-kas bağlantısı için idealdir.'],
    ['Gövdeyi savurmak.'],
    ['Preacher Curl'],
  ),
  E(
    'hammer-curl', 'Dumbbell Hammer Curl', 'Dumbbell Çekiç Bükme (Brachialis & Önkol)', 'Kol',
    ['hammer curl', 'cekiç curl', 'çekiç curl', 'cekic curl', 'hammer', 'dambıl çekiç', 'dumbbell hammer curl'],
    [['Brachialis', 'Brachioradialis (Önkol)'], ['Biceps Brachii']],
    '2x Dumbbell', 'Başlangıç', '3 - 4 Set x 10 - 12 Tekrar',
    [
      'Dumbbell’ları avuç içleri birbirine bakacak şekilde (nötr tutuş) tutun.',
      'Dirsekleri sabit tutarak ağırlıkları omuz hizasına kaldırın.',
      'Tepede önkol ve kolun dış kısmını sıkıp yavaşça indirin.',
    ],
    ['Kollara kalınlık ve hacim kazandırmak için en iyi egzersizlerden biridir.'],
    ['Bilekleri bükmek.'],
    ['Rope Cable Hammer Curl', 'Reverse Barbell Curl'],
  ),
  E(
    'cable-curl', 'Cable Curl', 'Kablolu Biceps Curl', 'Kol',
    ['cable curl', 'kablo curl', 'cable bicep curl', 'rope hammer curl', 'cable hammer curl'],
    [['Biceps'], ['Brachialis']],
    'Kablo İstasyonu, Düz Bar veya Halat', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Alt makarada bara yaklaşıp dirsekleri sabitleyin.',
      'Barı omuza doğru bükün.',
      'Kontrollüce indirin.',
    ],
    ['Kablo, hareket boyunca sabit gerilim sağlar.'],
    ['Dirsekleri öne taşımak.'],
    ['Barbell Curl', 'Preacher Curl'],
  ),
  E(
    'reverse-curl', 'Reverse Barbell Curl', 'Ters Tutuş Curl (Önkol)', 'Kol',
    ['reverse curl', 'reverse barbell curl', 'ters curl', 'onkol curl', 'forearm curl'],
    [['Brachioradialis (Önkol)', 'Brachialis'], ['Biceps']],
    'EZ-Bar veya Düz Bar', 'Başlangıç', '3 Set x 10 - 12 Tekrar',
    [
      'Barı avuç içi aşağı bakacak şekilde kavrayın.',
      'Dirsekleri sabitleyip yukarı bükün.',
      'Yavaşça indirin.',
    ],
    ['Hafif ağırlıkla başlayın.'],
    ['Bilekleri düşürmek.'],
    ['Hammer Curl', 'Wrist Curl'],
  ),
  E(
    'wrist-curl', 'Wrist Curl', 'Bilek Curl (Önkol)', 'Kol',
    ['wrist curl', 'bilek curl', 'forearm', 'onkol', 'wrist extension'],
    [['Önkol Fleksörleri'], ['Önkol Ekstansörleri']],
    'Dumbbell veya Barbell, Bench', 'Başlangıç', '3 Set x 15 - 20 Tekrar',
    [
      'Önkollarınızı sehpaya yaslayıp bilekler kenardan sarkıtın.',
      'Bilekleri yukarı bükün.',
      'Yavaşça indirin.',
    ],
    ['Hafif ağırlık ve yüksek tekrar.'],
    ['Önkolları yerinden oynatmak.'],
    ['Reverse Curl', 'Farmer’s Walk'],
  ),
  E(
    'triceps-pushdown', 'Cable Triceps Pushdown', 'Kablolu Arka Kol İtiş', 'Kol',
    ['triceps pushdown', 'tricep pushdown', 'pushdown', 'arka kol', 'cable pushdown', 'triceps', 'rope pushdown', 'halat pushdown'],
    [['Triceps Brachii (Yan ve Dış Baş)'], ['Önkol']],
    'Kablo İstasyonu, Halat veya Düz Bar', 'Başlangıç', '3 - 4 Set x 12 - 15 Tekrar',
    [
      'Dirseklerinizi gövdenin yanına sabitleyin.',
      'Ağırlığı aşağı iterek kolları tamamen düzleştirin.',
      'Tepe kasılmada triceps’i sıkın ve 90°’ye kadar kontrollüce bırakın.',
    ],
    ['Halat kullanıyorsanız en altta uçları dışa doğru açın.'],
    ['Omuzlarla ağırlığın üstüne abanmak.', 'Dirsekleri savurmak.'],
    ['Skull Crusher', 'Dips', 'Overhead Triceps Extension'],
    { breathing: 'Aşağı iterken nefes verin, bırakırken nefes alın.' },
  ),
  E(
    'skull-crusher', 'Skull Crusher / Lying Triceps Extension', 'Alna Triceps Pres (Arka Kol Uzun Baş)', 'Kol',
    ['skull crusher', 'skullcrusher', 'lying triceps extension', 'alna pres', 'french press', 'ez bar skull crusher'],
    [['Triceps Uzun Baş (Long Head)'], ['Triceps Yan Baş']],
    'Z-Bar (EZ-Bar) veya Dumbbell, Düz Bench', 'Orta', '3 Set x 10 - 12 Tekrar',
    [
      'Düz sehpaya uzanın, barı omuz hizasında kollar dikey tutun.',
      'Üst kolları sabit tutarak dirsekleri bükün ve barı alnınıza/başınızın gerisine indirin.',
      'Triceps ile barı başlangıca itin.',
    ],
    ['Dirsekleri dışa açmamaya özen gösterin.'],
    ['Dirsekleri ileri geri sallamak.'],
    ['Overhead Cable Extension', 'Dumbbell Triceps Kickback'],
    { breathing: 'İndirirken nefes alın, iterken nefes verin.' },
  ),
  E(
    'overhead-triceps-extension', 'Overhead Triceps Extension', 'Baş Üstü Triceps Uzatma', 'Kol',
    ['overhead triceps extension', 'overhead tricep extension', 'french curl', 'bas ustu triceps', 'overhead cable extension', 'dumbbell triceps extension'],
    [['Triceps Uzun Baş'], ['Triceps Yan Baş']],
    'Dumbbell, EZ-Bar veya Kablo (Halat)', 'Başlangıç / Orta', '3 Set x 10 - 15 Tekrar',
    [
      'Ağırlığı baş üzerinde tutarak dirsekleri yukarı sabitleyin.',
      'Dirsekleri bükerek ağırlığı başınızın arkasına indirin.',
      'Triceps’le yukarı uzatın.',
    ],
    ['Uzun başı en iyi germe egzersizlerinden biridir.'],
    ['Dirsekleri yana açmak.'],
    ['Skull Crusher', 'Triceps Pushdown'],
  ),
  E(
    'close-grip-bench-press', 'Close Grip Bench Press', 'Dar Tutuş Bench Press (Triceps)', 'Kol',
    ['close grip bench', 'close grip bench press', 'dar tutus bench', 'dar bench'],
    [['Triceps', 'İç Göğüs'], ['Ön Omuz']],
    'Olimpik Bar, Düz Bench', 'Orta', '3 - 4 Set x 6 - 10 Tekrar',
    [
      'Barı omuz genişliğinde veya biraz dar tutun.',
      'Dirsekleri vücuda yakın tutarak barı alt göğse indirin.',
      'Triceps’le yukarı itin.',
    ],
    ['Çok dar tutuş bileklere yük bindirir; omuz genişliği yeterli.'],
    ['Dirsekleri dışa açmak.'],
    ['Dips', 'Skull Crusher'],
  ),
  E(
    'bench-dips', 'Bench Dips', 'Bench Dips (Sehpa Arkası Triceps)', 'Kol',
    ['bench dips', 'bench dip', 'sehpa dips', 'triceps bench dips'],
    [['Triceps'], ['Ön Omuz', 'Alt Göğüs']],
    'Bench veya Sandalye', 'Başlangıç', '3 Set x 10 - 15 Tekrar',
    [
      'Ellerinizi sehpanın kenarına koyup kalçayı öne indirin.',
      'Dirsekleri 90° bükerek inin.',
      'Triceps’le yukarı itin.',
    ],
    ['Omuz sağlığı için fazla derin inmeyin.'],
    ['Omuzları kulaklara çekmek.'],
    ['Triceps Pushdown', 'Dips'],
  ),
  E(
    'triceps-kickback', 'Dumbbell Triceps Kickback', 'Dumbbell Triceps Kickback', 'Kol',
    ['triceps kickback', 'tricep kickback', 'kickback', 'dumbbell kickback'],
    [['Triceps (Yan Baş)'], []],
    'Dumbbell, Bench', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Öne eğilip üst kolu gövdeye paralel sabitleyin.',
      'Dirsekten kolu geriye doğru tamamen uzatın.',
      'Tepede sıkıp yavaşça bırakın.',
    ],
    ['Hafif ağırlık yeterli; ağır alırsanız form bozulur.'],
    ['Üst kolu düşürmek.'],
    ['Triceps Pushdown'],
  ),

  // ── KARIN (CORE) ───────────────────────────────────────────────────────────
  E(
    'plank', 'Forearm Plank', 'Önkol Plank (Core & Karın)', 'Karın',
    ['plank', 'core', 'karin', 'karın', 'statik karın', 'forearm plank'],
    [['Transversus Abdominis', 'Rectus Abdominis (Karın)'], ['Gluteus (Kalça)', 'Alt Sırt']],
    'Egzersiz Matı', 'Başlangıç', '3 Set x 45 - 60 Saniye',
    [
      'Dirsekleri tam omuzlarınızın altına yerleştirin.',
      'Vücudu baştan topuğa düz bir çizgi halinde tutun.',
      'Karnı yumruk yiyecekmiş gibi sıkın.',
    ],
    ['Dirsekleri ayaklara doğru izometrik çekerek kasılmayı artırın.'],
    ['Belin aşağı çökmesi.', 'Kalçayı yukarı kaldırmak.'],
    ['Hanging Leg Raise', 'Ab Wheel Rollout'],
    { breathing: 'Düzenli ve ritmik nefes alıp verin.' },
  ),
  E(
    'side-plank', 'Side Plank', 'Yan Plank (Oblik)', 'Karın',
    ['side plank', 'yan plank', 'oblik plank'],
    [['Oblikler', 'Quadratus Lumborum'], ['Gluteus Medius', 'Core']],
    'Mat', 'Başlangıç / Orta', '3 Set x 30 - 45 Saniye (Her Yan)',
    [
      'Yan yatıp dirseği omuz altına koyun.',
      'Kalçayı kaldırıp vücudu düz çizgide tutun.',
      'Süre dolana kadar bekleyin.',
    ],
    ['Üst kolu tavana uzatarak zorluk artırabilirsiniz.'],
    ['Kalçanın düşmesi.'],
    ['Plank', 'Russian Twist'],
    { breathing: 'Düzenli nefes alın.' },
  ),
  E(
    'hanging-leg-raise', 'Hanging Leg Raise', 'Barfiks Demiri Asılarak Bacak Kaldırma (Alt Karın)', 'Karın',
    ['hanging leg raise', 'leg raise', 'bacak kaldırma', 'bacak kaldirma', 'alt karın', 'alt karin', 'hanging knee raise', 'knee raise'],
    [['Alt Karın (Lower Abs)', 'Iliopsoas (Kalça Fleksörleri)'], ['Oblikler (Yan Karın)', 'Önkol Kavrama']],
    'Barfiks Demiri veya Dips İstasyonu', 'Orta', '3 Set x 12 - 15 Tekrar',
    [
      'Barfiks demirine asılın, gövdeyi sallamadan stabil tutun.',
      'Bacakları düz veya dizlerden hafif kırık şekilde 90°’ye kadar kaldırın.',
      'Tepede leğen kemiğinizi hafifçe yukarı yuvarlayarak alt karnı sıkın.',
      'Yavaşça indirin.',
    ],
    ['Sallanmamak için karın kaslarını sürekli aktif tutun.'],
    ['Bacakları savurarak ivmeyle kaldırmak.'],
    ['Captain’s Chair Leg Raise', 'Lying Floor Leg Raise'],
  ),
  E(
    'lying-leg-raise', 'Lying Leg Raise', 'Yerde Bacak Kaldırma', 'Karın',
    ['lying leg raise', 'floor leg raise', 'yerde bacak kaldirma', 'leg raises'],
    [['Alt Karın'], ['Kalça Fleksörleri']],
    'Mat', 'Başlangıç', '3 Set x 12 - 15 Tekrar',
    [
      'Sırtüstü yatıp elleri kalça altına koyun.',
      'Bacakları düz şekilde 90°’ye kaldırın.',
      'Yere değdirmeden yavaşça indirin.',
    ],
    ['Beli yere bastırarak çalışın.'],
    ['Belin yerden kalkması.'],
    ['Hanging Leg Raise', 'Dead Bug'],
  ),
  E(
    'crunch', 'Crunch', 'Mekik (Crunch)', 'Karın',
    ['crunch', 'crunches', 'mekik', 'sit up', 'situp', 'sit-up'],
    [['Rectus Abdominis (Üst Karın)'], ['Oblikler']],
    'Mat', 'Başlangıç', '3 Set x 15 - 20 Tekrar',
    [
      'Sırtüstü yatıp dizleri bükün.',
      'Elleri kulak arkasında, omuzları yerden kaldırarak karnı sıkın.',
      'Kontrollüce inin.',
    ],
    ['Boynunuzu çekmeyin; hareket karından gelmeli.'],
    ['Boyundan çekmek.'],
    ['Cable Crunch', 'Bicycle Crunch'],
  ),
  E(
    'cable-crunch', 'Cable Crunch', 'Kablolu Karın Crunch', 'Karın',
    ['cable crunch', 'kablo crunch', 'kablo karin', 'rope crunch'],
    [['Rectus Abdominis'], ['Oblikler']],
    'Kablo İstasyonu, Halat', 'Orta', '3 - 4 Set x 12 - 15 Tekrar',
    [
      'Üst makarada halatı başın yanında tutarak diz çökün.',
      'Omurgayı yuvarlayarak dirsekleri dizlere doğru indirin.',
      'Karnı sıkıp yavaşça yukarı dönün.',
    ],
    ['Kalçayı sabit tutup hareketi omurgadan yapın.'],
    ['Kalçayla çekmek.'],
    ['Crunch', 'Ab Wheel'],
  ),
  E(
    'bicycle-crunch', 'Bicycle Crunch', 'Bisiklet Mekiği', 'Karın',
    ['bicycle crunch', 'bisiklet mekigi', 'bisiklet karin', 'bicycle'],
    [['Oblikler', 'Rectus Abdominis'], ['Kalça Fleksörleri']],
    'Mat', 'Başlangıç', '3 Set x 20 - 30 Tekrar',
    [
      'Sırtüstü yatıp ellerinizi kulak arkasına koyun.',
      'Karşı dirsek ile dizi buluşturarak bisiklet pedalı çevirir gibi çalışın.',
      'Yavaş ve kontrollü olun.',
    ],
    ['Hız değil kasılma kalitesi önemlidir.'],
    ['Boynu çekmek.'],
    ['Russian Twist', 'Crunch'],
  ),
  E(
    'russian-twist', 'Russian Twist', 'Rus Twist (Oblik)', 'Karın',
    ['russian twist', 'rus twist', 'twist', 'oblik'],
    [['Oblikler'], ['Rectus Abdominis', 'Kalça Fleksörleri']],
    'Mat, Ağırlık Plakası veya Medicine Ball', 'Başlangıç / Orta', '3 Set x 20 Tekrar',
    [
      'Oturup gövdeyi hafif geriye yatırın, ayaklar yerde veya havada.',
      'Gövdeyi sağa-sola döndürün.',
      'Kontrollü tempo koruyun.',
    ],
    ['Dönüşü kollarla değil gövdeyle yapın.'],
    ['Sırtı yuvarlamak.'],
    ['Woodchopper', 'Side Plank'],
  ),
  E(
    'ab-wheel-rollout', 'Ab Wheel Rollout', 'Karın Tekerleği (Ab Wheel)', 'Karın',
    ['ab wheel', 'ab roller', 'rollout', 'ab wheel rollout', 'karin tekerlegi'],
    [['Rectus Abdominis', 'Core'], ['Latissimus', 'Omuz']],
    'Ab Wheel', 'İleri', '3 Set x 8 - 12 Tekrar',
    [
      'Dizlerinizin üstünde tekerleği tutun.',
      'Karnı sıkılı tutarak öne doğru yuvarlanın.',
      'Karnınızla geri çekin.',
    ],
    ['Belin çökmesine izin vermeyin; dizlerde başlayın.'],
    ['Belin çökmesi.'],
    ['Plank', 'Cable Crunch'],
  ),
  E(
    'mountain-climber', 'Mountain Climber', 'Dağ Tırmanıcı (Mountain Climber)', 'Karın',
    ['mountain climber', 'mountain climbers', 'dag tirmanici'],
    [['Core', 'Kalça Fleksörleri'], ['Omuz', 'Quadriceps']],
    'Mat', 'Başlangıç / Orta', '3 Set x 30 - 45 Saniye',
    [
      'Şınav pozisyonuna geçin.',
      'Dizleri sırayla göğse doğru çekin.',
      'Hızlı ve kontrollü tempoda devam edin.',
    ],
    ['Kalçayı sabit tutun.'],
    ['Kalçanın yukarı kalkması.'],
    ['Plank', 'Burpee'],
  ),
  E(
    'dead-bug', 'Dead Bug', 'Dead Bug (Core Stabilizasyon)', 'Karın',
    ['dead bug', 'deadbug', 'olu bocek'],
    [['Transversus Abdominis', 'Rectus Abdominis'], ['Kalça Fleksörleri']],
    'Mat', 'Başlangıç', '3 Set x 10 - 12 Tekrar (Her Taraf)',
    [
      'Sırtüstü yatıp kollar ve dizler 90° havada.',
      'Karşı kol ve bacağı yere yaklaştırın.',
      'Beli yere bastırarak başlangıca dönün.',
    ],
    ['Belin yerden kalkmamasına dikkat edin.'],
    ['Bel boşluğu bırakmak.'],
    ['Plank', 'Lying Leg Raise'],
  ),
  E(
    'woodchopper', 'Cable Woodchopper', 'Kablolu Odun Kesme (Oblik)', 'Karın',
    ['woodchopper', 'wood chopper', 'cable woodchop', 'odun kesme', 'cable twist'],
    [['Oblikler', 'Core'], ['Omuz', 'Kalça']],
    'Kablo İstasyonu', 'Orta', '3 Set x 12 - 15 Tekrar (Her Yan)',
    [
      'Kabloyu yüksekten tutup yana dönük durun.',
      'Gövdeyi çaprazlamasına aşağı doğru döndürerek çekin.',
      'Kontrollüce başlangıca dönün.',
    ],
    ['Hareketi kalça ve gövde rotasyonundan alın, kollarla çekmeyin.'],
    ['Belden aşırı dönmek.'],
    ['Russian Twist', 'Pallof Press'],
  ),

  // ── KARDİYO (CARDIO) ───────────────────────────────────────────────────────
  E(
    'treadmill-run', 'Treadmill Run', 'Koşu Bandında Koşu', 'Kardiyo',
    ['treadmill', 'kosu bandi', 'koşu bandı', 'running', 'jogging', 'kosu', 'koşu', 'treadmill run', 'run'],
    [['Quadriceps', 'Hamstrings', 'Baldır', 'Kalp-Dolaşım Sistemi'], ['Gluteus', 'Core']],
    'Koşu Bandı', 'Başlangıç / Orta', '20 - 40 Dakika (Orta Tempo)',
    [
      '3-5 dakika yürüyüşle ısının.',
      'Rahat konuşabileceğiniz tempoda koşuya geçin.',
      'Dizler hafif bükülü, adımlar kısa ve ritmik olsun.',
      'Son 3-5 dakikada tempoyu düşürerek soğuyun.',
    ],
    ['%1 eğim dış mekan koşusunu simüle eder.', 'Korkuluklara tutunmayın.'],
    ['Topukla sert basmak.', 'Başı öne eğmek.'],
    ['Incline Walk', 'Cycling', 'Elliptical'],
  ),
  E(
    'incline-walk', 'Incline Treadmill Walk', 'Eğimli Bantta Yürüyüş', 'Kardiyo',
    ['incline walk', 'incline walking', 'egimli yuruyus', 'eğimli yürüyüş', 'walking', 'yuruyus', 'yürüyüş', '12 3 30'],
    [['Gluteus', 'Hamstrings', 'Baldır', 'Kalp-Dolaşım Sistemi'], ['Quadriceps', 'Core']],
    'Koşu Bandı', 'Başlangıç', '20 - 45 Dakika (%8-12 Eğim, 5-6 km/s)',
    [
      'Eğimi %8-12, hızı 5-6 km/s aralığına ayarlayın.',
      'Dik duruşla, korkuluğa tutunmadan yürüyün.',
      'Nefesiniz hızlanmış ama kontrol altında olacak tempoda devam edin.',
    ],
    ['Yağ yakımı odaklı düşük etkili, eklem dostu bir seçenektir.'],
    ['Korkuluğa abanmak.'],
    ['Treadmill Run', 'Stair Climber'],
  ),
  E(
    'stationary-bike', 'Stationary Bike / Cycling', 'Bisiklet (Sabit / Spinning)', 'Kardiyo',
    ['bike', 'bisiklet', 'cycling', 'spinning', 'stationary bike', 'sabit bisiklet', 'spin', 'exercise bike'],
    [['Quadriceps', 'Gluteus', 'Hamstrings'], ['Baldır', 'Core']],
    'Sabit Bisiklet veya Spin Bisiklet', 'Başlangıç', '20 - 45 Dakika',
    [
      'Selenin yüksekliğini pedal en aşağıdayken diz hafif bükülü kalacak şekilde ayarlayın.',
      'Düşük dirençte 5 dakika ısının.',
      'Hedef tempoda ve dirençte devam edin; aralıklı sprintler ekleyebilirsiniz.',
    ],
    ['Düşük eklem yüklenmesi sayesinde bacak günü sonrası aktif toparlanma için idealdir.'],
    ['Sele çok alçak.', 'Omuzları kamburlaştırmak.'],
    ['Elliptical', 'Rowing Machine'],
  ),
  E(
    'elliptical', 'Elliptical Trainer', 'Eliptik Bisiklet', 'Kardiyo',
    ['elliptical', 'eliptik', 'cross trainer', 'crosstrainer'],
    [['Quadriceps', 'Gluteus', 'Hamstrings', 'Kalp-Dolaşım Sistemi'], ['Kollar', 'Core']],
    'Eliptik Makine', 'Başlangıç', '20 - 40 Dakika',
    [
      'Pedallara basıp tutamaçları kavrayın.',
      'Akıcı bir hareketle ileri veya geri pedal çevirin.',
      'Direnci hedef yoğunluğa göre ayarlayın.',
    ],
    ['Geri pedal çevirmek arka zincir kaslarını daha çok vurgular.'],
    ['Tutamaçlara yüklenmek.'],
    ['Treadmill Run', 'Cycling'],
  ),
  E(
    'rowing-machine', 'Rowing Machine', 'Kürek Makinesi', 'Kardiyo',
    ['rowing machine', 'kurek makinesi', 'kürek makinesi', 'ergometer', 'concept2', 'row machine'],
    [['Tüm Vücut', 'Latissimus', 'Quadriceps'], ['Hamstrings', 'Core', 'Biceps']],
    'Kürek Makinesi (Ergometer)', 'Orta', '15 - 30 Dakika veya 500m Aralıklar',
    [
      'Önce bacakları iterek, sonra gövdeyi geriye yatırarak ve son olarak kolları çekerek hareketi başlatın.',
      'Dönüşte sıra tersine: kollar, gövde, bacaklar.',
      'Ritmi 1:2 (çekiş:dönüş) oranında tutun.',
    ],
    ['Güç %60 bacaklardan, %20 gövdeden, %20 kollardan gelmeli.'],
    ['Önce kollarla çekmek.', 'Sırtı yuvarlamak.'],
    ['Cycling', 'Battle Ropes'],
  ),
  E(
    'stair-climber', 'Stair Climber', 'Merdiven Makinesi (StairMaster)', 'Kardiyo',
    ['stair climber', 'stairmaster', 'merdiven makinesi', 'stairs', 'stair master', 'merdiven'],
    [['Gluteus', 'Quadriceps', 'Baldır'], ['Hamstrings', 'Core']],
    'Merdiven Makinesi', 'Orta', '15 - 30 Dakika',
    [
      'Hafif tempoda başlayın.',
      'Dik duruşla tüm ayak tabanıyla basın.',
      'Korkuluğa hafifçe dokunun, ağırlığı vermeyin.',
    ],
    ['Kalça aktivasyonu için adımları uzun atın.'],
    ['Korkuluğa abanmak.'],
    ['Incline Walk', 'Step-Up'],
  ),
  E(
    'jump-rope', 'Jump Rope', 'İp Atlama', 'Kardiyo',
    ['jump rope', 'ip atlama', 'skipping', 'rope jumping'],
    [['Baldır', 'Kalp-Dolaşım Sistemi'], ['Omuz', 'Önkol', 'Core']],
    'Atlama İpi', 'Başlangıç / Orta', '5 - 10 Dakika veya 30sn Atla / 30sn Dinlen x 10',
    [
      'İpin boyunu kolların altına denk gelecek şekilde ayarlayın.',
      'Bileklerle çevirip parmak ucunda hafifçe zıplayın.',
      'Düzenli ritim yakalayın.',
    ],
    ['Zıplama yüksekliği 2-3 cm yeterlidir.'],
    ['Kollarla çevirmek.', 'Çok yüksek zıplamak.'],
    ['HIIT Sprints', 'Burpee'],
  ),
  E(
    'hiit-sprints', 'HIIT Sprint Intervals', 'HIIT Sprint Aralıklı Antrenman', 'Kardiyo',
    ['hiit', 'sprint', 'sprints', 'interval', 'interval training', 'aralikli antrenman', 'aralıklı', 'tabata'],
    [['Kalp-Dolaşım Sistemi', 'Quadriceps', 'Gluteus'], ['Hamstrings', 'Core']],
    'Koşu Bandı, Bisiklet veya Açık Alan', 'İleri', '8 - 10 Tur: 30sn Maksimum / 60-90sn Dinlenme',
    [
      '5-10 dakika dinamik ısınma yapın.',
      'Maksimum efora yakın 20-30 saniye sprint yapın.',
      'Hafif tempoda 60-90 saniye toparlanın.',
      'Tüm turlar bitince 5 dakika soğuyun.',
    ],
    ['Haftada 2-3 kereyi geçmeyin; toparlanma süresi önemlidir.'],
    ['Isınmayı atlamak.', 'Her turda efor düşmesine rağmen devam etmek.'],
    ['Jump Rope', 'Rowing Machine', 'Assault Bike'],
  ),
  E(
    'battle-ropes', 'Battle Ropes', 'Savaş İpleri (Battle Rope)', 'Kardiyo',
    ['battle rope', 'battle ropes', 'savas ipi', 'savaş ipi', 'rope waves'],
    [['Omuz', 'Kalp-Dolaşım Sistemi', 'Core'], ['Önkol', 'Bacaklar']],
    'Battle Rope', 'Orta', '6 - 10 Tur x 20 - 30 Saniye',
    [
      'Yarım squat pozisyonunda ipin uçlarını tutun.',
      'Kolları dönüşümlü olarak yukarı-aşağı dalgalandırın.',
      'Süre dolana kadar tempoyu koruyun.',
    ],
    ['Çeşitlendirmek için çift kol dalga veya daire hareketleri yapın.'],
    ['Sırtı yuvarlamak.'],
    ['HIIT Sprints', 'Rowing Machine'],
  ),
  E(
    'burpee', 'Burpee', 'Burpee', 'Kardiyo',
    ['burpee', 'burpees'],
    [['Tüm Vücut', 'Kalp-Dolaşım Sistemi'], ['Göğüs', 'Quadriceps', 'Core']],
    'Vücut Ağırlığı', 'Orta', '3 - 5 Set x 10 - 15 Tekrar',
    [
      'Ayakta durun, çömelip ellerinizi yere koyun.',
      'Ayakları geriye atıp şınav pozisyonuna geçin (isteğe bağlı şınav).',
      'Ayakları öne çekip patlayıcı şekilde zıplayın.',
    ],
    ['Hızdan çok formu koruyun.'],
    ['Belin çökmesi.'],
    ['Mountain Climber', 'Jump Rope'],
  ),
  E(
    'assault-bike', 'Assault / Air Bike', 'Assault Bike (Hava Bisikleti)', 'Kardiyo',
    ['assault bike', 'air bike', 'airbike', 'fan bike'],
    [['Tüm Vücut', 'Kalp-Dolaşım Sistemi'], ['Quadriceps', 'Omuz', 'Kollar']],
    'Assault / Air Bike', 'Orta / İleri', '8 - 10 Tur x 20 sn Sprint / 40 sn Dinlenme',
    [
      'Hem kollar hem bacaklarla iterek pedal çevirin.',
      'Efor arttıkça direnç otomatik artar.',
      'Aralıkları planlayarak çalışın.',
    ],
    ['Sürdürülebilir temponun üzerine çıkmak için çok güçlü bir HIIT aracıdır.'],
    ['Başlangıçta aşırı yüklenmek.'],
    ['HIIT Sprints', 'Rowing Machine'],
  ),
  E(
    'swimming', 'Swimming', 'Yüzme', 'Kardiyo',
    ['swimming', 'yuzme', 'yüzme', 'swim', 'havuz'],
    [['Tüm Vücut', 'Kalp-Dolaşım Sistemi'], ['Latissimus', 'Omuz', 'Core']],
    'Havuz', 'Orta', '20 - 45 Dakika',
    [
      'Isınma için 100-200 metre rahat yüzün.',
      'Seçtiğiniz stilde (serbest, sırtüstü, kurbağalama) düzenli tempoda devam edin.',
      'Son 100 metrede soğuma yapın.',
    ],
    ['Eklem yükü minimumdur; sakatlık dönemlerinde mükemmeldir.'],
    ['Nefesi tutmak.', 'Başı aşırı yukarı kaldırmak.'],
    ['Rowing Machine', 'Elliptical'],
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// Metin normalizasyonu ve eşleştirme
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eşleştirme için metni sadeleştirir (Türkçe karakterler, yazım hataları, noktalama).
 */
function normalizeText(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/dumbell|dumbel|dambil|dambel|halter/g, 'dumbbell')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Aranabilir metinleri önceden hesaplar (performans için). */
const SEARCH_INDEX = EXERCISE_DATABASE.map((ex) => ({
  ex,
  name: normalizeText(ex.name),
  nameTr: normalizeText(ex.nameTr),
  aliases: ex.aliases.map(normalizeText),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Dinamik egzersiz üretici (veritabanında bulunamayan hareketler için)
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryProfile {
  primary: string[];
  secondary: string[];
  equipment: string;
  sets: string;
  difficulty: ExerciseDifficulty;
  breathing: string;
}

const CATEGORY_PROFILES: Record<ExerciseCategory, CategoryProfile> = {
  Göğüs: {
    primary: ['Göğüs Kasları (Pectoralis Major)'],
    secondary: ['Ön Omuz', 'Triceps'],
    equipment: 'Dumbbell / Barbell veya Makine',
    sets: '3 - 4 Set x 8 - 12 Tekrar',
    difficulty: 'Orta',
    breathing: DEFAULT_BREATHING['Göğüs'],
  },
  Sırt: {
    primary: ['Kanat Kasları (Latissimus Dorsi)', 'Orta Sırt'],
    secondary: ['Biceps', 'Arka Omuz'],
    equipment: 'Kablo, Barbell, Dumbbell veya Makine',
    sets: '3 - 4 Set x 8 - 12 Tekrar',
    difficulty: 'Orta',
    breathing: DEFAULT_BREATHING['Sırt'],
  },
  Omuz: {
    primary: ['Omuz Kasları (Deltoidler)'],
    secondary: ['Trapez', 'Triceps'],
    equipment: 'Dumbbell, Barbell, Kablo veya Makine',
    sets: '3 - 4 Set x 10 - 15 Tekrar',
    difficulty: 'Orta',
    breathing: DEFAULT_BREATHING['Omuz'],
  },
  Bacak: {
    primary: ['Ön Bacak (Quadriceps)', 'Kalça (Gluteus)'],
    secondary: ['Arka Bacak (Hamstrings)', 'Alt Sırt', 'Baldır'],
    equipment: 'Barbell, Dumbbell veya Makine',
    sets: '3 - 4 Set x 8 - 12 Tekrar',
    difficulty: 'Orta',
    breathing: DEFAULT_BREATHING['Bacak'],
  },
  Kol: {
    primary: ['Kol Kasları (Biceps / Triceps)'],
    secondary: ['Önkol', 'Brachialis'],
    equipment: 'Dumbbell, Barbell veya Kablo',
    sets: '3 Set x 10 - 15 Tekrar',
    difficulty: 'Başlangıç / Orta',
    breathing: DEFAULT_BREATHING['Kol'],
  },
  Karın: {
    primary: ['Karın Kasları (Rectus & Transversus Abdominis)'],
    secondary: ['Oblikler', 'Core Stabilizatörleri'],
    equipment: 'Mat veya Kablo',
    sets: '3 Set x 12 - 20 Tekrar (veya 30 - 60 sn)',
    difficulty: 'Başlangıç / Orta',
    breathing: DEFAULT_BREATHING['Karın'],
  },
  Kardiyo: {
    primary: ['Kalp-Dolaşım Sistemi', 'Bacak Kasları'],
    secondary: ['Core', 'Kalça'],
    equipment: 'Kardiyo Makinesi veya Açık Alan',
    sets: '20 - 30 Dakika (veya Aralıklı Set)',
    difficulty: 'Başlangıç / Orta',
    breathing: DEFAULT_BREATHING['Kardiyo'],
  },
};

/** Kelime listeleri: Kategori tespiti için (sıra önemlidir). */
const CATEGORY_KEYWORDS: Array<{
  category: ExerciseCategory;
  words: string[];
  primary?: string[];
  secondary?: string[];
}> = [
    {
      category: 'Kardiyo',
      words: ['cardio', 'kardiyo', 'treadmill', 'kosu', 'run', 'running', 'jog', 'bisiklet', 'bike', 'cycling', 'spin', 'elliptical', 'eliptik', 'rowing machine', 'stair', 'merdiven', 'rope jump', 'jump rope', 'ip atlama', 'hiit', 'sprint', 'interval', 'tabata', 'burpee', 'swim', 'yuzme', 'yuruyus', 'walk', 'battle rope'],
    },
    {
      category: 'Karın',
      words: ['plank', 'crunch', 'karin', 'core', 'abs', 'ab', 'abdominal', 'twist', 'sit up', 'situp', 'mekik', 'hanging', 'wheel', 'oblik', 'woodchop', 'dead bug', 'v up'],
    },
    {
      category: 'Kol',
      words: ['tricep', 'triceps', 'pushdown', 'arka kol', 'skull', 'kickback', 'dips', 'dip'],
      primary: ['Triceps Brachii (Arka Kol)'],
      secondary: ['Önkol', 'Ön Omuz'],
    },
    {
      category: 'Bacak',
      words: ['squat', 'leg', 'bacak', 'calf', 'baldir', 'lunge', 'quad', 'hamstring', 'rdl', 'deadlift', 'glute', 'kalca', 'hip', 'thrust', 'step up', 'adductor', 'abductor', 'hack'],
    },
    {
      category: 'Kol',
      words: ['bicep', 'biceps', 'curl', 'pazu', 'on kol', 'onkol', 'forearm', 'hammer'],
      primary: ['Biceps Brachii (Pazı)'],
      secondary: ['Brachialis', 'Önkol'],
    },
    {
      category: 'Omuz',
      words: ['shoulder', 'omuz', 'overhead', 'military', 'lateral', 'deltoid', 'arnold', 'raise', 'face pull', 'shrug', 'upright', 'trapez', 'trap', 'rear delt'],
    },
    {
      category: 'Sırt',
      words: ['lat', 'pull', 'pulldown', 'row', 'sirt', 'back', 'barfiks', 'kanat', 'chin', 'rack', 'pullover', 'hyperextension'],
    },
    {
      category: 'Göğüs',
      words: ['chest', 'gogus', 'bench', 'fly', 'crossover', 'push up', 'pushup', 'sinav', 'pec', 'press'],
    },
  ];

function detectCategory(norm: string): { category: ExerciseCategory; primary?: string[]; secondary?: string[] } {
  const padded = ` ${norm} `;
  const tokens = norm.split(' ').filter(Boolean);

  const hasWord = (w: string): boolean => {
    if (w.includes(' ')) return padded.includes(` ${w} `);
    // Kısa kelimeler tam eşleşme; uzun kelimeler çoğul/ek için önek eşleşmesi
    if (w.length <= 3) return tokens.includes(w);
    return tokens.some((t) => t === w || t.startsWith(w));
  };

  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.words.some(hasWord)) {
      return { category: entry.category, primary: entry.primary, secondary: entry.secondary };
    }
  }
  return { category: 'Göğüs' };
}

function detectEquipment(norm: string, fallback: string): string {
  const padded = ` ${norm} `;
  if (/ (cable|kablo|crossover|pulldown|pushdown) /.test(padded)) return 'Kablo İstasyonu & Tutamaçlar';
  if (/ (dumbbell|kettlebell) /.test(padded)) return 'Dumbbell Çifti';
  if (/ (barbell|ez bar|z bar) /.test(padded)) return 'Olimpik Bar & Plakalar';
  if (/ (machine|makine|smith) /.test(padded)) return 'Özel Ağırlık Makinesi';
  if (/ (bodyweight|vucut agirligi|push up|pushup|pull up|plank) /.test(padded)) return 'Vücut Ağırlığı';
  return fallback;
}

/**
 * Dinamik Egzersiz Üretici:
 * Veritabanında olmayan bir hareket için kategori, ekipman ve kas gruplarını
 * adından tahmin ederek eksiksiz bir rehber üretir; böylece kart asla boş kalmaz.
 */
export function generateDynamicExercise(title: string): ExerciseInfo {
  const cleanTitle = (title || '').trim() || 'Genel Egzersiz';
  const norm = normalizeText(cleanTitle) || 'genel egzersiz';

  const detected = detectCategory(norm);
  const category = detected.category;
  const profile = CATEGORY_PROFILES[category];
  const accentColor = CATEGORY_COLORS[category];

  const formattedName = cleanTitle
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1) : w))
    .join(' ');

  const isCardio = category === 'Kardiyo';

  const instructions = isCardio
    ? [
      `${formattedName} öncesinde 3-5 dakika düşük tempoda ısının.`,
      'Konuşabileceğiniz, nefesin hızlanmış ama kontrol altında olduğu bir tempoda başlayın.',
      'Postürünüzü dik tutun, omuzları gevşetin ve düzenli nefes alın.',
      'Hedef süre dolunca 3-5 dakika düşük tempoda soğuyun ve esneyin.',
    ]
    : [
      `${formattedName} hareketine başlamadan önce eklemlerinizi ve hedef kas grubunu dinamik olarak ısıtın.`,
      'Gövdenizi ve omurganızı nötr, kürek kemiklerinizi sabit tutarak dengeli bir duruş alın.',
      'Hareketi hedef kas grubuyla başlatın; eklemleri kilitlemeden kontrollü bir hareket aralığı (ROM) uygulayın.',
      'Tepe kasılma noktasında 1 saniye bekleyerek hedef kası sıkın.',
      'Ağırlığı 2-3 saniyelik negatif (eccentric) tempoyla yavaşça başlangıç pozisyonuna indirin.',
    ];

  return {
    id: `dynamic-${norm.replace(/\s+/g, '-')}`,
    name: formattedName,
    nameTr: `${formattedName} Biyomekanik Form Rehberi`,
    aliases: [norm],
    category,
    targetMuscles: {
      primary: detected.primary ?? profile.primary,
      secondary: detected.secondary ?? profile.secondary,
    },
    equipment: detectEquipment(norm, profile.equipment),
    difficulty: profile.difficulty,
    benchAngle: isCardio ? undefined : 'Standart Pozisyon',
    recommendedSets: profile.sets,
    instructions,
    breathing: profile.breathing,
    proTips: isCardio
      ? ['Yoğunluğu kademeli artırın; toparlanma günlerini ihmal etmeyin.', 'Antrenman öncesi ve sonrası yeterli sıvı alın.']
      : [
        'Aşırı ağırlık takıp vücudu sallayarak ivme (momentum) kullanmayın; zihin-kas bağlantısını koruyun.',
        'Hareketin negatif kısmını yavaş yapmak kas gelişimi için etkilidir.',
      ],
    commonMistakes: isCardio
      ? ['Isınma ve soğumayı atlamak.', 'İlk günden aşırı yoğunlukla başlamak.']
      : ['Hareket açısını yarım bırakmak.', 'Eklemlere aşırı yük bindirecek ani ve kontrolsüz hareketler yapmak.'],
    alternatives: [`${category} için alternatif serbest ağırlık, kablo veya makine varyasyonları`],
    accentColor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Arama
// ─────────────────────────────────────────────────────────────────────────────

/** Kelime sınırlarına saygı gösteren içerme kontrolü ("bar" ≠ "barbell"). */
function containsPhrase(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}

/**
 * Egzersiz veritabanında tam, takma ad ve bulanık (token) eşleşmesiyle arama yapar.
 * Bulunamazsa dinamik üretici devreye girer, bu yüzden asla null dönmez.
 */
export function findExerciseInDatabase(query: string): ExerciseInfo {
  if (!query || !query.trim()) {
    return generateDynamicExercise('Genel Egzersiz');
  }

  const q = normalizeText(query);
  if (!q) return generateDynamicExercise(query);

  // 1. Tam eşleşme (ad, Türkçe ad veya takma ad)
  for (const item of SEARCH_INDEX) {
    if (item.name === q || item.nameTr === q || item.aliases.includes(q)) {
      return item.ex;
    }
  }

  // 2. Kelime sınırı bazlı içerme (sorgu takma adı içeriyor veya tersi)
  let phraseBest: { ex: ExerciseInfo; len: number } | null = null;
  for (const item of SEARCH_INDEX) {
    const candidates = [item.name, item.nameTr, ...item.aliases];
    for (const c of candidates) {
      if (c.length < 4 && c !== q) continue; // çok kısa ifadeler yanlış eşleşme yaratır
      if (containsPhrase(q, c) || containsPhrase(c, q)) {
        // En uzun eşleşen ifade en spesifik olandır
        const len = Math.min(c.length, q.length);
        if (!phraseBest || len > phraseBest.len) {
          phraseBest = { ex: item.ex, len };
        }
      }
    }
  }
  if (phraseBest) return phraseBest.ex;

  // 3. Token örtüşme skoru
  const tokens = q.split(' ').filter((t) => t.length > 2);
  if (tokens.length > 0) {
    let best: ExerciseInfo | null = null;
    let bestScore = 0;

    for (const item of SEARCH_INDEX) {
      const candidates = [item.name, item.nameTr, ...item.aliases];
      let matched = 0;
      for (const t of tokens) {
        if (candidates.some((c) => containsPhrase(c, t))) matched++;
      }
      const score = matched / tokens.length;
      if (score > bestScore) {
        bestScore = score;
        best = item.ex;
      }
    }

    // En az token'ların %60'ı eşleşmeli; aksi halde dinamik üreticiye düş
    if (best && bestScore >= 0.6) return best;
  }

  // 4. Dinamik üretici (kullanıcı asla boş kartla karşılaşmaz)
  return generateDynamicExercise(query);
}

/** Kategoriye göre tüm hareketleri döndürür. */
export function getExercisesByCategory(category: ExerciseCategory): ExerciseInfo[] {
  return EXERCISE_DATABASE.filter((ex) => ex.category === category);
}

/** Arama kutusu / otomatik tamamlama için çoklu sonuç döndürür. */
export function searchExercises(query: string, limit = 10): ExerciseInfo[] {
  const q = normalizeText(query);
  if (!q) return EXERCISE_DATABASE.slice(0, limit);

  const scored = SEARCH_INDEX.map((item) => {
    const candidates = [item.name, item.nameTr, ...item.aliases];
    let score = 0;
    for (const c of candidates) {
      if (c === q) score = Math.max(score, 100);
      else if (c.startsWith(q)) score = Math.max(score, 80);
      else if (containsPhrase(c, q)) score = Math.max(score, 60);
      else if (c.includes(q)) score = Math.max(score, 40);
    }
    const tokens = q.split(' ').filter((t) => t.length > 2);
    const tokenHits = tokens.filter((t) => candidates.some((c) => c.includes(t))).length;
    if (tokens.length > 0) score = Math.max(score, (tokenHits / tokens.length) * 30);
    return { ex: item.ex, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.ex);
}

/**
 * Verilen metnin (başlık / sorgu) veritabanında bilinen gerçek bir egzersiz olup olmadığını kontrol eder.
 * Genel iş/proje görevleri (örn: "API geliştir", "Müşteri teklifi") için false döner.
 */
export function isRecognizedExercise(query?: string): boolean {
  if (!query || !query.trim()) return false;
  const q = normalizeText(query);
  if (!q) return false;

  // 1. Tam eşleşme (ad, Türkçe ad veya takma ad)
  for (const item of SEARCH_INDEX) {
    if (item.name === q || item.nameTr === q || item.aliases.includes(q)) {
      return true;
    }
  }

  // 2. Cümle / takma ad içerme kontrolü
  for (const item of SEARCH_INDEX) {
    const candidates = [item.name, item.nameTr, ...item.aliases];
    for (const c of candidates) {
      if (c.length < 4 && c !== q) continue;
      if (containsPhrase(q, c) || (c.length >= 5 && containsPhrase(c, q))) {
        return true;
      }
    }
  }

  // 3. Token örtüşme skoru (en az %60 token tutarlılığı)
  const tokens = q.split(' ').filter((t) => t.length > 2);
  if (tokens.length > 0) {
    for (const item of SEARCH_INDEX) {
      const candidates = [item.name, item.nameTr, ...item.aliases];
      let matched = 0;
      for (const t of tokens) {
        if (candidates.some((c) => containsPhrase(c, t))) matched++;
      }
      if (matched / tokens.length >= 0.6) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Pano adı, alan adı veya metnin spor/fitness bağlamında olup olmadığını tespit eder.
 */
export function isFitnessContext(text?: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  const keywords = [
    'spor',
    'antrenman',
    'fitness',
    'workout',
    'gym',
    'egzersiz',
    'bodybuilding',
    'vucut gelistirme',
    'kondisyon',
    'crossfit',
    'pilates',
    'calisthenics',
  ];
  return keywords.some((k) => normalized.includes(k));
}