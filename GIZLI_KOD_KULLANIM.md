# 🎁 Gizli Hediye Kodu Sistemi - Kullanım Kılavuzu

## 🎮 Oyuncu İçin Nasıl Çalışır?

### 1. Gizli Karakteri Bekle
- 50 level içinde **16 karakter** rastgele dağıtılmıştır
- Her karakterli levelde, **oyun sırasında** (5-15 saniye sonra) karakter belirir
- Karakter **rastgele bir hücrede** görünür
- **🎁 ikonu** ile gösterilir ve **yüzer animasyon** yapar
- Altın sarısı parıltı efekti ile dikkat çeker
- "✨ Gizli karakter belirdi! Hızlıca yakala!" bildirimi gelir

### 2. Karakteri Topla
- Gizli karaktere **hızlıca tıkla** (kaybolabilir!)
- Karakter patlama animasyonu ile kaybolur
- **+100 puan** bonus kazanırsın
- Sağ üstte bildirim çıkar: "🎁 Gizli karakter bulundu!"

### 3. İlerlemeyi Takip Et
- Üst menüde **🎁 butonu**na tıkla
- Toplanan karakterleri gör (16 karakter)
- İlerleme çubuğunu kontrol et
- Eksik karakterler "?" ile gösterilir
- Hangi levellerde karakter olduğunu göremezsin (sürpriz!)

### 4. Kodu Tamamla
- 16 karakteri topladığında **tebrik ekranı** açılır
- E-posta adresini gir
- **Tam Google Play hediye kartı kodunu** gör
- Format: `XXXX-XXXX-XXXX-XXXX` (16 karakter)
- Kod e-posta adresinle birlikte kaydedilir

## 📱 Kullanıcı Arayüzü

### Gizli Kod Butonu (🎁)
- **Konum:** Üst menü, görevler ve liderlik tablosu arasında
- **Renk:** Altın sarısı (özel vurgu)
- **Tıklayınca:** Gizli kod paneli açılır

### Gizli Kod Paneli
```
┌─────────────────────────────────┐
│  🎁 Gizli Hediye Kodu           │
├─────────────────────────────────┤
│                                 │
│  50 level boyunca 16            │
│  karakterlik Google Play        │
│  hediye kartı kodunu topla!     │
│                                 │
│  ▓▓▓▓▓▓▓▓░░░░░░░░ 50%          │
│  8 / 16 karakter toplandı       │
│                                 │
│  A 7 K 9 - ? ? ? ? - ? ? ? ?   │
│  - ? ? ? ?                      │
│                                 │
│  💡 16 karakter 50 level        │
│  arasında rastgele dağıtılmış.  │
│  Karakterler oyun sırasında     │
│  belirir - hızlıca yakala!      │
│                                 │
└─────────────────────────────────┘
```

### Karakter Toplama Bildirimi
```
┌──────────────────────┐
│  🎁  Gizli Karakter  │
│      Bulundu!        │
│         A            │
│     25 / 50          │
└──────────────────────┘
```

### Tamamlama Ekranı
```
┌─────────────────────────────────┐
│         🏆                      │
│   Tebrikler!                    │
│                                 │
│  Gizli Kodu Tamamladınız!      │
│                                 │
│  Google Play hediye kartı       │
│  kodunu kazandınız!             │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ABCD-EFGH-IJKL-MNOP-...   │ │
│  └───────────────────────────┘ │
│                                 │
│  E-posta Adresi:                │
│  [________________]             │
│                                 │
│      [  Gönder  ]               │
└─────────────────────────────────┘
```

## 🎨 Görsel Özellikler

### Gizli Karakter (Tahtada)
- **Boyut:** 32px
- **Animasyon:** Yukarı-aşağı yüzme + hafif dönme
- **Efekt:** Altın sarısı parıltı (drop-shadow)
- **Hover:** Büyüme animasyonu (1.3x)
- **Tıklama:** Patlama animasyonu

### Renk Paleti
- **Ana Renk:** `#FFD700` (Altın)
- **İkincil:** `#FFA500` (Turuncu)
- **Vurgu:** `#FFED4E` (Açık Sarı)
- **Arka Plan:** Koyu mor gradyan

### Animasyonlar
1. **secretFloat:** Karakterin yüzme hareketi (2s)
2. **secretSlideIn:** Panel açılış animasyonu (0.5s)
3. **charReveal:** Karakter toplama animasyonu (0.5s)
4. **celebrationBounce:** Tamamlama zıplama (1s)
5. **progressGlow:** İlerleme çubuğu parıltısı (2s)

## 💾 Veri Yönetimi

### LocalStorage
```javascript
// Anahtar
'colorFusionSecretCode'

// Veri Yapısı
{
  code: "A7K9-M2P5-Q8R3-W6X4",    // 16 karakterlik kod
  shuffledPositions: {              // Level -> Karakter eşleşmesi (16 level)
    3: { char: "A", index: 0 },
    7: { char: "7", index: 1 },
    12: { char: "K", index: 2 },
    // ... toplam 16 level
  },
  collectedCharacters: {            // Toplanan karakterler
    0: "A",
    2: "K",
    // ...
  },
  collectedCount: 8,                // Toplam sayı (max 16)
  isCompleted: false,               // Tamamlandı mı?
  completedAt: null,                // Tamamlanma zamanı
  winnerEmail: null                 // Kazanan e-posta
}
```

### Supabase Tablosu
```sql
secret_code_winners (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW
)
```

## 🔧 Geliştirici Notları

### Kodu Değiştirme
`secretCode.js` dosyasında:

```javascript
const SecretCodeManager = {
  // Buraya yeni 16 karakterlik Google Play kodu gir
  // Format: XXXX-XXXX-XXXX-XXXX
  SECRET_CODE: 'A7K9-M2P5-Q8R3-W6X4',
  // ...
}
```

**Not:** Kod mutlaka 16 karakter olmalı (tire hariç). Örnek formatlar:
- `ABCD-1234-EFGH-5678`
- `X9Y2-K7M3-P5Q8-R4W6`
- `1A2B-3C4D-5E6F-7G8H`

### Test Modu
Tarayıcı konsolunda:

```javascript
// İlerlemeyi sıfırla
localStorage.removeItem('colorFusionSecretCode');

// Mevcut ilerlemeyi gör
SecretCodeManager.loadProgress();

// Belirli bir levelin karakterini gör
SecretCodeManager.getCharacterForLevel(5);

// Karakteri manuel topla
SecretCodeManager.collectCharacter(5);

// Tamamlanma durumunu kontrol et
SecretCodeManager.isCompleted();
```

### Önemli Fonksiyonlar

**secretCode.js:**
- `SecretCodeManager.init()` - Sistemi başlat
- `SecretCodeManager.getCharacterForLevel(level)` - Level için karakter al
- `SecretCodeManager.collectCharacter(level)` - Karakteri topla
- `SecretCodeManager.getCollectedCodeString()` - Toplanan kodu string olarak al
- `SecretCodeManager.completeCode(email)` - Kodu tamamla ve kaydet
- `SecretCodeUI.show()` - Panel göster
- `SecretCodeUI.showCharacterCollected()` - Bildirim göster

**game.js:**
- `Game.spawnSecretCharacter()` - Karakteri tahtaya yerleştir
- `Game.collectSecretCharacter(element)` - Karakteri topla

## 🎯 Oyun Akışı

```
Oyun Başlar
    ↓
Level 1 Başlar
    ↓
Oyuncu Oynar (5-15 saniye)
    ↓
Karakter Var mı? → Hayır → Level Devam
    ↓ Evet
Gizli Karakter Spawn Olur (rastgele hücre)
    ↓
Bildirim: "✨ Gizli karakter belirdi!"
    ↓
Oyuncu Karakteri Bulur ve Tıklar
    ↓
+100 Puan + Bildirim
    ↓
Karakter LocalStorage'a Kaydedilir
    ↓
Level Tamamlanır
    ↓
Level 2 Başlar
    ↓
... (50 level, 16 karakter)
    ↓
16. Karakter Toplandı
    ↓
Tebrik Ekranı Açılır
    ↓
E-posta Girişi
    ↓
Kod Supabase'e Kaydedilir
    ↓
Tam Kod Gösterilir (XXXX-XXXX-XXXX-XXXX)
    ↓
Oyuncu Kazandı! 🎉
```

## 📊 İstatistikler

### Oyuncu Motivasyonu
- **Bonus Puan:** Her karakter +100 puan
- **Toplam Bonus:** 16 karakter × 100 = 1,600 puan
- **Görsel Geri Bildirim:** Anında bildirim + animasyon
- **İlerleme Takibi:** Gerçek zamanlı progress bar
- **Sürpriz Faktörü:** Karakterler rastgele zamanda belirir

### Oyun Süresi
- **Ortalama Level Süresi:** 2-3 dakika
- **50 Level:** ~100-150 dakika (1.5-2.5 saat)
- **Karakter Dağılımı:** 16 karakter / 50 level = %32 şans
- **Karakter Belirme:** 5-15 saniye sonra (rastgele)

### Zorluk Dengesi
- Her 3 levelden birinde karakter var (ortalama)
- Karakterler oyun sırasında belirir (dikkat gerektirir)
- Hızlı tepki ödüllendirilir
- Kaçırılan karakter bir daha gelmez

## 🐛 Sorun Giderme

### Karakter Görünmüyor
1. Tarayıcı konsolunu aç (F12)
2. Hata mesajlarını kontrol et
3. `SecretCodeManager.init()` çalıştır
4. Sayfayı yenile

### Kod Sıfırlandı
- LocalStorage temizlendiyse kod kaybolur
- Çözüm: Yedekleme sistemi ekle (gelecek güncelleme)

### E-posta Gönderilemedi
1. Supabase bağlantısını kontrol et
2. Network sekmesinde hataları gör
3. E-posta formatını kontrol et

## 🚀 Gelecek Özellikler

- [ ] Kod yedekleme sistemi (cloud sync)
- [ ] Sosyal paylaşım (Twitter, Facebook)
- [ ] Alternatif ödüller (farklı hediye kartları)
- [ ] Kazanan listesi (leaderboard benzeri)
- [ ] Günlük bonus karakterler
- [ ] Özel karakter animasyonları

## 📞 Destek

Sorularınız için:
- GitHub Issues
- E-posta: [email]
- Discord: [link]

---

**Not:** Bu sistem tamamen client-side çalışır ve internet bağlantısı olmadan da kullanılabilir. Supabase sadece kazananları kaydetmek için kullanılır.
