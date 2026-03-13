# 🚀 Supabase Google Authentication Kurulumu

## ✅ Tamamlananlar:
- [x] Supabase projesi oluşturuldu
- [x] API keys alındı
- [x] Kod entegre edildi

## 📋 Yapılması Gerekenler:

### 1. Google OAuth Credentials Oluştur

#### Adım 1: Google Cloud Console
1. https://console.cloud.google.com/ → Giriş yap
2. Yeni proje oluştur: "Color Fusion"
3. Proje seçiliyken devam et

#### Adım 2: OAuth Consent Screen
1. Sol menü → "APIs & Services" → "OAuth consent screen"
2. **User Type**: External → Create
3. **App name**: Color Fusion
4. **User support email**: E-posta adresin
5. **Developer contact**: E-posta adresin
6. "Save and Continue" → "Save and Continue" → "Save and Continue"

#### Adım 3: Create Credentials
1. Sol menü → "Credentials"
2. "+ CREATE CREDENTIALS" → "OAuth client ID"
3. **Application type**: Web application
4. **Name**: Color Fusion Web
5. **Authorized JavaScript origins**:
   ```
   http://localhost:8000
   https://rozmhxnuwsegoreejeoc.supabase.co
   ```
6. **Authorized redirect URIs**:
   ```
   https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
   ```
7. "CREATE"
8. **Client ID** ve **Client Secret** kopyala! ⬇️

### 2. Supabase'de Google Provider Aktifleştir

#### Adım 1: Authentication Settings
1. Supabase Dashboard → **Authentication** (sol menü)
2. **Providers** sekmesi
3. **Google** satırını bul

#### Adım 2: Google Provider Ayarları
1. **Enable** toggle'ını aç ✅
2. **Client ID**: Google'dan kopyaladığın Client ID
3. **Client Secret**: Google'dan kopyaladığın Client Secret
4. **Authorized Client IDs**: Boş bırak (opsiyonel)
5. "Save" tıkla

### 3. Site URL Ayarları

#### Supabase Dashboard
1. **Authentication** → **URL Configuration**
2. **Site URL**: 
   ```
   http://localhost:8000
   ```
   (Production'da gerçek domain'in olacak)
3. **Redirect URLs**: 
   ```
   http://localhost:8000
   http://localhost:8000/**
   ```
4. "Save"

### 4. Test Et! 🎮

#### Localhost'ta Çalıştır
```bash
# Basit HTTP sunucusu
python -m http.server 8000

# Veya
npx serve -p 8000
```

#### Tarayıcıda Aç
```
http://localhost:8000
```

#### Test Adımları
1. "🔐 Google ile Giriş" butonuna tıkla
2. Google hesabını seç
3. İzinleri onayla
4. Otomatik geri dönecek
5. Profil fotoğrafın görünecek ✅

## 🔧 Sorun Giderme

### "redirect_uri_mismatch" Hatası
**Çözüm**: Google Cloud Console'da redirect URI'yi kontrol et:
```
https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
```

### "Invalid client" Hatası
**Çözüm**: Client ID ve Secret'i tekrar kontrol et

### Popup açılmıyor
**Çözüm**: 
1. Popup blocker'ı kapat
2. Veya tarayıcı ayarlarından izin ver

### "Origin not allowed"
**Çözüm**: Google Cloud Console'da Authorized JavaScript origins'e ekle:
```
http://localhost:8000
```

## 📱 Production için

### Domain Ekle
Google Cloud Console → Credentials → OAuth client:
```
Authorized JavaScript origins:
https://yourdomain.com

Authorized redirect URIs:
https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
```

### Supabase Site URL Güncelle
```
Site URL: https://yourdomain.com
Redirect URLs: https://yourdomain.com/**
```

## 🎯 Özet Checklist

- [ ] Google Cloud Console'da proje oluştur
- [ ] OAuth consent screen yapılandır
- [ ] OAuth client ID oluştur
- [ ] Client ID ve Secret kopyala
- [ ] Supabase'de Google provider aktifleştir
- [ ] Client ID ve Secret yapıştır
- [ ] Site URL ayarla
- [ ] Redirect URLs ayarla
- [ ] Localhost'ta test et
- [ ] Giriş başarılı! 🎉

## 💡 Hızlı Notlar

**Google Client ID örneği:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Google Client Secret örneği:**
```
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**Supabase Redirect URI (sabit):**
```
https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
```

---

**Başarılar! 🚀**

Sorun olursa bana sor!
