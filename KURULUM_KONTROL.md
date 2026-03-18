# ✅ Google OAuth Kurulum Kontrol Listesi

## 📋 Hızlı Kontrol

Kurulumu tamamlamak için bu adımları sırayla takip edin:

---

## 1️⃣ Google Cloud Console

### Proje Oluşturma
- [ ] https://console.cloud.google.com/ adresine gidildi
- [ ] Yeni proje oluşturuldu: "Color Fusion Game"
- [ ] Proje seçildi (üst menüden)

### OAuth Consent Screen
- [ ] APIs & Services > OAuth consent screen açıldı
- [ ] User Type: "External" seçildi
- [ ] App name: "Color Fusion - Match 3 Game" girildi
- [ ] User support email girildi
- [ ] Application home page: `https://celalcen.github.io/match3-game` girildi
- [ ] Developer contact email girildi
- [ ] Kaydedildi

### OAuth Credentials
- [ ] APIs & Services > Credentials açıldı
- [ ] "+ CREATE CREDENTIALS" > "OAuth client ID" seçildi
- [ ] Application type: "Web application" seçildi
- [ ] Name: "Color Fusion Web Client" girildi

**Authorized JavaScript origins:**
- [ ] `https://celalcen.github.io` eklendi
- [ ] `https://rozmhxnuwsegoreejeoc.supabase.co` eklendi
- [ ] `http://localhost:5500` eklendi (test için)

**Authorized redirect URIs:**
- [ ] `https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback` eklendi
- [ ] `https://celalcen.github.io/match3-game` eklendi
- [ ] `http://localhost:5500` eklendi (test için)

- [ ] "CREATE" tıklandı
- [ ] **Client ID kopyalandı ve kaydedildi** 📋
- [ ] **Client Secret kopyalandı ve kaydedildi** 📋

---

## 2️⃣ Supabase Dashboard

### Google Provider Etkinleştirme
- [ ] https://supabase.com/dashboard adresine gidildi
- [ ] Proje seçildi: `rozmhxnuwsegoreejeoc`
- [ ] Authentication > Providers açıldı
- [ ] "Google" provider bulundu
- [ ] "Enable" toggle'ı AÇILDI (yeşil)

### Credentials Girişi
- [ ] Client ID (for OAuth) alanına Google'dan alınan Client ID yapıştırıldı
- [ ] Client Secret (for OAuth) alanına Google'dan alınan Client Secret yapıştırıldı
- [ ] "Save" tıklandı

### URL Configuration
- [ ] Authentication > URL Configuration açıldı
- [ ] Site URL: `https://celalcen.github.io/match3-game` girildi
- [ ] Redirect URLs eklendi:
  - [ ] `https://celalcen.github.io/**`
  - [ ] `http://localhost:5500/**`
- [ ] "Save" tıklandı

---

## 3️⃣ Kod Kontrolü

### index.html
- [ ] `auth-supabase.js` aktif (yorum değil)
- [ ] `auth-mock.js` kapalı (yorum satırı)

```html
<!-- ✅ DOĞRU -->
<script src="auth-supabase.js"></script>
<!-- <script src="auth-mock.js"></script> -->
```

---

## 4️⃣ Test

### Lokal Test
- [ ] Oyun lokal sunucuda açıldı: `http://localhost:5500`
- [ ] "Google ile Giriş Yap" butonuna tıklandı
- [ ] Google hesap seçim ekranı açıldı
- [ ] Hesap seçildi ve izinler onaylandı
- [ ] Oyuna geri dönüldü
- [ ] Kullanıcı adı üst sağda görünüyor
- [ ] Profil menüsü açılıyor
- [ ] Çıkış yapma çalışıyor

### GitHub Pages Test
- [ ] Değişiklikler GitHub'a push edildi
- [ ] GitHub Pages açıldı: `https://celalcen.github.io/match3-game`
- [ ] "Google ile Giriş Yap" butonuna tıklandı
- [ ] Google hesap seçim ekranı açıldı
- [ ] Hesap seçildi ve izinler onaylandı
- [ ] Oyuna geri dönüldü
- [ ] Giriş başarılı

---

## 5️⃣ Yayına Alma (Opsiyonel)

### Test Mode (Varsayılan)
- [ ] OAuth consent screen "Testing" modunda
- [ ] Test kullanıcıları eklendi (gerekirse)
- [ ] Sadece test kullanıcıları giriş yapabiliyor

### Production Mode (Herkese Açık)
- [ ] Google Cloud Console > OAuth consent screen açıldı
- [ ] "PUBLISH APP" tıklandı
- [ ] Onay verildi
- [ ] App "In production" moduna geçti
- [ ] Herkes giriş yapabiliyor

---

## 🐛 Sorun Giderme

### Hata Alıyorsanız:

**"Unsupported provider: provider is not enabled"**
- ➡️ Supabase'de Google provider'ı etkinleştir
- ➡️ Client ID ve Secret doğru girilmiş mi kontrol et

**"Redirect URI mismatch"**
- ➡️ Google Cloud Console'da redirect URI'leri kontrol et
- ➡️ Supabase callback URL'i eklenmiş mi: `https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback`

**"Access blocked: This app's request is invalid"**
- ➡️ OAuth consent screen'de "External" seçili mi kontrol et
- ➡️ Authorized redirect URIs doğru mu kontrol et

**"Invalid client ID"**
- ➡️ Supabase'de girdiğin Client ID'yi kontrol et
- ➡️ Boşluk veya fazladan karakter var mı kontrol et

**Popup Engellendi**
- ➡️ Tarayıcıda popup blocker'ı kapat
- ➡️ Site ayarlarından popup'lara izin ver

---

## 📊 Kurulum Durumu

Tamamlanan adımları işaretle:

- [ ] Google Cloud Console kurulumu (%0)
- [ ] Supabase Dashboard kurulumu (%0)
- [ ] Kod kontrolü (%0)
- [ ] Lokal test (%0)
- [ ] GitHub Pages test (%0)
- [ ] Yayına alma (%0)

**İlerleme:** 0/6 adım tamamlandı

---

## 🎯 Sonraki Adımlar

Kurulum tamamlandıktan sonra:

1. **Privacy Policy oluştur** (Google gereksinimi)
2. **Terms of Service oluştur** (Google gereksinimi)
3. **App logo ekle** (profesyonel görünüm)
4. **Supabase secret_code_winners tablosunu oluştur** (`SECRET_CODE_SETUP.md`)
5. **Oyunu test et** (tüm özellikler)
6. **GitHub'a push et** (son versiyon)

---

## 📞 Yardım

Detaylı kurulum için:
- **`URETIM_KURULUM.md`** - Adım adım kurulum rehberi
- **`GOOGLE_AUTH_SETUP.md`** - Teknik detaylar
- **`AUTH_HATA_COZUMU.md`** - Hata çözümleri

---

**Not:** Bu kontrol listesini yazdırıp yanınızda tutabilirsiniz! 📝
