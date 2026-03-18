# Gizli Hediye Kodu Sistemi - Supabase Kurulumu

## Özellik Açıklaması

Oyuncular 50 level boyunca her levelde rastgele bir gizli karakter bulur. Tüm karakterleri toplayarak Google Play hediye kartı kodunu tamamlarlar.

## Supabase Tablo Kurulumu

### 1. Supabase Dashboard'a Git
- https://supabase.com/dashboard
- Projenizi seçin
- Sol menüden "SQL Editor" seçin

### 2. Aşağıdaki SQL Kodunu Çalıştır

```sql
-- Gizli kod kazananları tablosu
CREATE TABLE IF NOT EXISTS secret_code_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(email)
);

-- Index for faster queries
CREATE INDEX idx_secret_code_winners_email ON secret_code_winners(email);
CREATE INDEX idx_secret_code_winners_completed_at ON secret_code_winners(completed_at);

-- Enable Row Level Security
ALTER TABLE secret_code_winners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (to allow anonymous users)
CREATE POLICY "Anyone can insert winner"
  ON secret_code_winners
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read winners
CREATE POLICY "Anyone can read winners"
  ON secret_code_winners
  FOR SELECT
  USING (true);

-- Policy: Only owner can update their own record
CREATE POLICY "Users can update own record"
  ON secret_code_winners
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Tabloyu Doğrula

SQL Editor'de şu sorguyu çalıştır:

```sql
SELECT * FROM secret_code_winners;
```

Tablo başarıyla oluşturulduysa boş bir sonuç dönecektir.

## Sistem Nasıl Çalışır?

### 1. Kod Oluşturma
- Sistem başlatıldığında 50 karakterlik bir kod oluşturulur
- Örnek: `ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456-7890-WXYZ`
- Her karakter rastgele bir levele atanır (1-50)

### 2. Karakter Toplama
- Her levelde tahtada gizli bir karakter belirir (🎁 ikonu)
- Oyuncu karaktere tıklayarak toplar
- Toplanan karakterler localStorage'da saklanır
- İlerleme çubuğu gösterilir

### 3. Kod Tamamlama
- 50 karakter toplandığında tebrik ekranı gösterilir
- Oyuncudan e-posta adresi istenir
- E-posta ve kod Supabase'e kaydedilir
- Oyuncu tam kodu görebilir

### 4. Veri Saklama

**LocalStorage (Tarayıcı):**
```javascript
{
  code: "A7K9-M2P5-Q8R3-W6X4",
  shuffledPositions: {
    3: { char: "A", index: 0 },
    7: { char: "7", index: 1 },
    12: { char: "K", index: 2 },
    // ... toplam 16 level
  },
  collectedCharacters: {
    0: "A",
    1: "7",
    // ... max 16
  },
  collectedCount: 8,
  isCompleted: false,
  completedAt: null,
  winnerEmail: null
}
```

**Supabase (Cloud):**
```javascript
{
  id: "uuid",
  email: "oyuncu@email.com",
  code: "A7K9-M2P5-Q8R3-W6X4",
  completed_at: "2024-01-15T10:30:00Z",
  user_id: "uuid or null",
  created_at: "2024-01-15T10:30:00Z"
}
```

## Özellikler

### ✅ Oyuncu Deneyimi
- 16 karakter / 50 level = Sürpriz faktörü
- Karakterler oyun sırasında belirir (5-15 saniye)
- Hızlı tepki gerektirir
- İlerleme takibi (X / 16)
- Görsel bildirimler
- Tamamlama ödülü

### ✅ Güvenlik
- LocalStorage ile offline çalışma
- Supabase ile cloud yedekleme
- E-posta doğrulama
- Tek kazanan kaydı (UNIQUE constraint)

### ✅ Yönetim
- Kazananları görüntüleme
- Tamamlanma tarihi takibi
- Kullanıcı bağlantısı (opsiyonel)

### ✅ Gerçekçilik
- 16 karakterlik Google Play format
- XXXX-XXXX-XXXX-XXXX yapısı
- Sayı ve harf kombinasyonu

## Kazananları Görüntüleme

Supabase SQL Editor'de:

```sql
-- Tüm kazananlar
SELECT 
  email,
  code,
  completed_at,
  created_at
FROM secret_code_winners
ORDER BY completed_at DESC;

-- İlk 10 kazanan
SELECT 
  email,
  completed_at
FROM secret_code_winners
ORDER BY completed_at ASC
LIMIT 10;

-- Bugünkü kazananlar
SELECT 
  email,
  completed_at
FROM secret_code_winners
WHERE DATE(completed_at) = CURRENT_DATE
ORDER BY completed_at DESC;
```

## Kodu Değiştirme

`secretCode.js` dosyasında:

```javascript
const SecretCodeManager = {
  // Yeni Google Play kodunu buraya gir (16 karakter)
  // Format: XXXX-XXXX-XXXX-XXXX
  SECRET_CODE: 'A7K9-M2P5-Q8R3-W6X4',
  // ...
}
```

**Önemli:** 
- Kod mutlaka 16 karakter olmalı (tire hariç)
- Format: 4-4-4-4 (tirelerle ayrılmış)
- Sayı ve harf kombinasyonu kullanın
- Gerçek Google Play kodu formatına uygun olmalı

## Test Etme

1. Oyunu başlat
2. Karakterli bir levele kadar oyna (rastgele)
3. 5-15 saniye bekle, karakter belirsin
4. Karaktere tıkla ve bildirim göründüğünü kontrol et
5. 🎁 butonuna tıklayarak ilerlemeyi gör (X / 16)
6. 16 karakteri topla (test için localStorage'ı manuel düzenleyebilirsin)
7. E-posta gir ve kodu tamamla
8. Supabase'de kaydı kontrol et

### Hızlı Test (Console)
```javascript
// Tüm karakterleri topla (test için)
const data = SecretCodeManager.loadProgress();
const code = data.code.replace(/-/g, '');
for (let i = 0; i < code.length; i++) {
  data.collectedCharacters[i] = code[i];
}
data.collectedCount = 16;
SecretCodeManager.saveProgress(data);
location.reload();
```

## Sorun Giderme

### Karakter Görünmüyor
- Tarayıcı konsolunu kontrol et
- localStorage'ı temizle: `localStorage.removeItem('colorFusionSecretCode')`
- Sayfayı yenile

### Kod Tamamlanamıyor
- E-posta formatını kontrol et
- Supabase bağlantısını kontrol et
- Network sekmesinde hataları kontrol et

### Kazanan Kaydedilmiyor
- Supabase API anahtarlarını kontrol et
- RLS politikalarını kontrol et
- Tablo izinlerini kontrol et

## Notlar

- Her oyuncu için kod rastgele sıralanır
- Aynı e-posta ile sadece 1 kez kazanılabilir
- Kod localStorage'da saklanır (tarayıcı temizlenirse kaybolur)
- Kazananlar Supabase'de kalıcı olarak saklanır
