# Supabase Leaderboard Kurulumu

## 1. Tablo Oluşturma

Supabase Dashboard'a git (https://supabase.com/dashboard) ve SQL Editor'da şu komutu çalıştır:

```sql
-- Leaderboard tablosu oluştur
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_photo TEXT,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler ekle (performans için)
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_created ON leaderboard(created_at DESC);

-- Row Level Security (RLS) aktif et
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Leaderboard herkese açık"
  ON leaderboard FOR SELECT
  USING (true);

-- Sadece kendi skorunu ekleyebilir
CREATE POLICY "Kullanıcılar kendi skorlarını ekleyebilir"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

## 2. Test Verisi (Opsiyonel)

```sql
-- Test verisi ekle
INSERT INTO leaderboard (user_id, user_name, user_email, score, level)
VALUES 
  ('test-user-1', 'Ahmet Yılmaz', 'ahmet@example.com', 5000, 5),
  ('test-user-2', 'Ayşe Demir', 'ayse@example.com', 4500, 4),
  ('test-user-3', 'Mehmet Kaya', 'mehmet@example.com', 4000, 4);
```

## 3. Doğrulama

Tablo başarıyla oluşturulduysa, şu sorguyla kontrol et:

```sql
SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10;
```

## Notlar

- `user_id`: Supabase auth.uid() ile eşleşir
- `score`: Oyun skoru
- `level`: Ulaşılan seviye
- RLS politikaları sayesinde güvenli
- Herkes tüm skorları görebilir, ama sadece kendi skorunu ekleyebilir
