# 🚀 Üretim Ortamı - Google OAuth Kurulum Rehberi

## Adım 1: Google Cloud Console Kurulumu

### 1.1 Google Cloud Console'a Giriş
1. https://console.cloud.google.com/ adresine git
2. Google hesabınla giriş yap
3. Üst menüden proje seç veya yeni proje oluştur

### 1.2 Yeni Proje Oluştur (İlk kez ise)
1. Üst menüden **"Select a project"** tıkla
2. **"NEW PROJECT"** tıkla
3. Project name: **"Color Fusion Game"**
4. Location: **"No organization"** (veya kendi organizasyonun)
5. **"CREATE"** tıkla
6. Proje oluşturulana kadar bekle (30 saniye)

### 1.3 OAuth Consent Screen Yapılandır
1. Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seç
2. User Type: **"External"** seç (herkes kullanabilir)
3. **"CREATE"** tıkla

**App information:**
- App name: `Color Fusion - Match 3 Game`
- User support email: `[senin-email@gmail.com]`
- App logo: (opsiyonel - oyun logosu yükle)

**App domain:**
- Application home page: `https://celalcen.github.io/match3-game`
- Application privacy policy: `https://celalcen.github.io/match3-game` (şimdilik aynı)
- Application terms of service: `https://celalcen.github.io/match3-game` (şimdilik aynı)

**Developer contact information:**
- Email addresses: `[senin-email@gmail.com]`

4. **"SAVE AND CONTINUE"** tıkla

**Scopes:**
- Hiçbir şey ekleme, sadece **"SAVE AND CONTINUE"** tıkla

**Test users:** (Opsiyonel - test aşamasında)
- Test kullanıcı ekleyebilirsin veya boş bırak
- **"SAVE AND CONTINUE"** tıkla

**Summary:**
- Özeti kontrol et
- **"BACK TO DASHBOARD"** tıkla

### 1.4 OAuth Credentials Oluştur
1. Sol menüden **"APIs & Services"** > **"Credentials"** seç
2. Üst menüden **"+ CREATE CREDENTIALS"** tıkla
3. **"OAuth client ID"** seç

**Application type:**
- **"Web application"** seç

**Name:**
- `Color Fusion Web Client`

**Authorized JavaScript origins:**
```
https://celalcen.github.io
https://rozmhxnuwsegoreejeoc.supabase.co
http://localhost:5500
http://127.0.0.1:5500
```

**Authorized redirect URIs:**
```
https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
https://celalcen.github.io/match3-game
http://localhost:5500
```

4. **"CREATE"** tıkla

### 1.5 Credentials Kaydet
Ekranda **Client ID** ve **Client Secret** gösterilecek:

```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-abcdefghijklmnopqrstuvwx
```

⚠️ **ÖNEMLİ:** Bu bilgileri kopyala ve güvenli bir yere kaydet!

---

## Adım 2: Supabase Dashboard Kurulumu

### 2.1 Supabase'e Giriş
1. https://supabase.com/dashboard adresine git
2. Projenizi seçin: **rozmhxnuwsegoreejeoc**

### 2.2 Google Provider'ı Etkinleştir
1. Sol menüden **"Authentication"** tıkla
2. **"Providers"** sekmesine git
3. Provider listesinden **"Google"** bul
4. **"Enable"** toggle'ını AÇ (yeşil)

### 2.3 Google Credentials Gir
**Client ID (for OAuth):**
```
[Google Cloud Console'dan aldığın Client ID]
Örnek: 123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Client Secret (for OAuth):**
```
[Google Cloud Console'dan aldığın Client Secret]
Örnek: GOCSPX-abcdefghijklmnopqrstuvwx
```

5. **"Save"** tıkla

### 2.4 URL Configuration
1. Sol menüden **"Authentication"** > **"URL Configuration"** git

**Site URL:**
```
https://celalcen.github.io/match3-game
```

**Redirect URLs:** (her satıra bir URL)
```
https://celalcen.github.io/**
http://localhost:5500/**
http://127.0.0.1:5500/**
```

2. **"Save"** tıkla

---

## Adım 3: Kod Güncellemesi (Zaten Hazır)

`index.html` dosyasında auth sistemi zaten doğru:

```html
<!-- Supabase Auth aktif -->
<script src="auth-supabase.js"></script>

<!-- Mock Auth kapalı -->
<!-- <script src="auth-mock.js"></script> -->
```

✅ Kod değişikliği gerekmez!

---

## Adım 4: Test Et

### 4.1 Lokal Test
1. Oyunu lokal sunucuda aç: `http://localhost:5500`
2. **"Google ile Giriş Yap"** butonuna tıkla
3. Google hesap seçim ekranı açılmalı
4. Hesabını seç
5. İzinleri onayla
6. Oyuna geri dönmeli ve giriş yapmış olmalısın

### 4.2 GitHub Pages Test
1. Değişiklikleri GitHub'a push et:
   ```bash
   git add .
   git commit -m "Google OAuth kurulumu tamamlandı"
   git push origin main
   ```

2. GitHub Pages'i aç: `https://celalcen.github.io/match3-game`
3. **"Google ile Giriş Yap"** butonuna tıkla
4. Google hesap seçim ekranı açılmalı
5. Hesabını seç ve onayla
6. Giriş yapmalısın

---

## Adım 5: Yayına Alma (Publishing Mode)

### 5.1 Google OAuth Consent Screen'i Yayınla
1. Google Cloud Console > OAuth consent screen
2. **"PUBLISH APP"** butonuna tıkla
3. Onay ver

⚠️ **Not:** App "In production" moduna geçene kadar sadece test kullanıcıları giriş yapabilir.

**Seçenekler:**
- **Test Mode:** Sadece eklediğin test kullanıcıları giriş yapabilir (100 kullanıcı limiti)
- **Production Mode:** Herkes giriş yapabilir (Google incelemesi gerekebilir)

### 5.2 Production Mode İçin (Opsiyonel)
Eğer herkese açık yapmak istersen:

1. Google Cloud Console > OAuth consent screen
2. **"PUBLISH APP"** tıkla
3. Google'ın inceleme sürecini bekle (1-2 hafta)

**Gereksinimler:**
- Privacy Policy URL
- Terms of Service URL
- App açıklaması
- App logosu

---

## Sorun Giderme

### Hata: "Access blocked: This app's request is invalid"
**Çözüm:** 
- OAuth consent screen'de "External" seçili mi kontrol et
- Authorized redirect URIs doğru mu kontrol et

### Hata: "Redirect URI mismatch"
**Çözüm:**
- Google Cloud Console'da redirect URI'leri kontrol et
- Supabase callback URL'i eklenmiş mi kontrol et:
  `https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback`

### Hata: "Invalid client ID"
**Çözüm:**
- Supabase'de girdiğin Client ID'yi kontrol et
- Google Cloud Console'dan doğru Client ID'yi kopyaladığından emin ol

### Hata: "This app is blocked"
**Çözüm:**
- OAuth consent screen'de "PUBLISH APP" yap
- Veya test kullanıcısı olarak kendi email'ini ekle

### Popup Engellendi
**Çözüm:**
- Tarayıcıda popup blocker'ı kapat
- Veya tarayıcı ayarlarından siteye izin ver

---

## Checklist

Kurulum tamamlandı mı kontrol et:

- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth consent screen yapılandırıldı
- [ ] OAuth credentials oluşturuldu
- [ ] Client ID ve Secret kopyalandı
- [ ] Supabase'de Google provider etkinleştirildi
- [ ] Client ID ve Secret Supabase'e girildi
- [ ] Redirect URLs eklendi
- [ ] Site URL yapılandırıldı
- [ ] Lokal test başarılı
- [ ] GitHub Pages test başarılı
- [ ] OAuth consent screen yayınlandı (opsiyonel)

---

## Güvenlik Notları

### ✅ Yapılması Gerekenler:
- Client Secret'ı güvenli tut (GitHub'a push etme)
- HTTPS kullan (GitHub Pages otomatik sağlar)
- Redirect URL'leri sınırla (sadece kendi domain'lerin)

### ❌ Yapılmaması Gerekenler:
- Client Secret'ı public repo'ya koyma
- Test credentials'ı production'da kullanma
- Wildcard redirect URL kullanma (güvenlik riski)

---

## Sonraki Adımlar

1. **Privacy Policy Oluştur:** Google'ın gerektirdiği gizlilik politikası
2. **Terms of Service Oluştur:** Kullanım şartları
3. **App Logo Ekle:** Profesyonel görünüm için
4. **Google Verification:** Production mode için (opsiyonel)

---

## Destek

Sorun yaşarsan:
1. Tarayıcı konsolunu kontrol et (F12)
2. Supabase Dashboard > Logs > Auth Logs kontrol et
3. Google Cloud Console > APIs & Services > Credentials kontrol et
4. `GOOGLE_AUTH_SETUP.md` dosyasına bak

---

**Tebrikler! 🎉** Google OAuth kurulumu tamamlandı. Artık kullanıcılar Google hesaplarıyla giriş yapabilir!
