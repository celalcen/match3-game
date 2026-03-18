# Google Authentication Kurulum Kılavuzu

## Sorun: "Unsupported provider: provider is not enabled"

Bu hata, Supabase'de Google OAuth'un etkinleştirilmemiş olduğunu gösterir.

## Çözüm 1: Supabase'de Google OAuth'u Etkinleştir (Önerilen)

### Adım 1: Google Cloud Console'da OAuth Credentials Oluştur

1. **Google Cloud Console'a git:** https://console.cloud.google.com/
2. Yeni bir proje oluştur veya mevcut projeyi seç
3. Sol menüden **"APIs & Services" > "Credentials"** seç
4. **"+ CREATE CREDENTIALS"** > **"OAuth client ID"** tıkla
5. Application type: **"Web application"** seç
6. Name: `Color Fusion Game` (veya istediğin isim)

7. **Authorized JavaScript origins** ekle:
   ```
   http://localhost:5500
   http://127.0.0.1:5500
   https://celalcen.github.io
   https://rozmhxnuwsegoreejeoc.supabase.co
   ```

8. **Authorized redirect URIs** ekle:
   ```
   https://rozmhxnuwsegoreejeoc.supabase.co/auth/v1/callback
   http://localhost:5500
   https://celalcen.github.io
   ```

9. **CREATE** tıkla
10. **Client ID** ve **Client Secret** kopyala (sonra lazım olacak)

### Adım 2: Supabase'de Google Provider'ı Etkinleştir

1. **Supabase Dashboard'a git:** https://supabase.com/dashboard
2. Projenizi seçin: `rozmhxnuwsegoreejeoc`
3. Sol menüden **"Authentication"** > **"Providers"** seç
4. **"Google"** provider'ını bul
5. **"Enable"** toggle'ını aç
6. Google Cloud Console'dan aldığın bilgileri gir:
   - **Client ID:** `[Google'dan aldığın Client ID]`
   - **Client Secret:** `[Google'dan aldığın Client Secret]`
7. **"Save"** tıkla

### Adım 3: Site URL'lerini Yapılandır

1. Supabase Dashboard'da **"Authentication"** > **"URL Configuration"** git
2. **Site URL:** `https://celalcen.github.io/match3-game` (veya kendi domain'in)
3. **Redirect URLs** ekle:
   ```
   http://localhost:5500/*
   http://127.0.0.1:5500/*
   https://celalcen.github.io/*
   ```
4. **Save** tıkla

### Adım 4: Test Et

1. Oyunu aç
2. "Google ile Giriş Yap" butonuna tıkla
3. Google hesabını seç
4. İzinleri onayla
5. Oyuna geri dönmeli ve giriş yapmış olmalısın

---

## Çözüm 2: Geçici Çözüm - Mock Authentication (Test İçin)

Google OAuth kurulumu yapılana kadar geçici bir mock authentication sistemi kullanabiliriz:

### Mock Auth Sistemi

Bu sistem gerçek Google OAuth yerine basit bir kullanıcı seçimi sunar:

```javascript
// Mock users
const MOCK_USERS = [
  {
    uid: 'mock-user-1',
    email: 'oyuncu1@test.com',
    displayName: 'Test Oyuncu 1',
    photoURL: null,
    provider: 'mock'
  },
  {
    uid: 'mock-user-2',
    email: 'oyuncu2@test.com',
    displayName: 'Test Oyuncu 2',
    photoURL: null,
    provider: 'mock'
  }
];
```

Bu çözümü aktif etmek için `auth-supabase.js` dosyasında değişiklik yapabiliriz.

---

## Çözüm 3: E-posta ile Giriş (Alternatif)

Google OAuth yerine e-posta/şifre ile giriş sistemi de ekleyebiliriz:

### Supabase'de E-posta Auth'u Etkinleştir

1. Supabase Dashboard > Authentication > Providers
2. **"Email"** provider'ını etkinleştir
3. **"Confirm email"** seçeneğini kapat (test için)
4. Save

### Kod Değişikliği

`auth-supabase.js` dosyasına e-posta giriş fonksiyonu ekle:

```javascript
// Sign in with email/password
async signInWithEmail(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;
    
    this.currentUser = this.formatUser(data.user);
    this.saveUserToStorage(this.currentUser);
    this.updateUI();
    
    return data;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
},

// Sign up with email/password
async signUpWithEmail(email, password, displayName) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: displayName
        }
      }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Email sign up error:', error);
    throw error;
  }
}
```

---

## Hangi Çözümü Seçmeliyim?

### Üretim (Production) İçin:
✅ **Çözüm 1: Google OAuth** (En profesyonel)
- Kullanıcı dostu
- Güvenli
- Tek tıkla giriş

### Test İçin:
✅ **Çözüm 2: Mock Auth** (En hızlı)
- Kurulum gerektirmez
- Hemen test edilebilir
- Geliştirme için ideal

### Alternatif:
✅ **Çözüm 3: E-posta Auth** (Orta yol)
- Google hesabı gerektirmez
- Basit kurulum
- Kullanıcı kayıt formu gerekir

---

## Hata Mesajları ve Çözümleri

### "Unsupported provider: provider is not enabled"
**Çözüm:** Supabase'de Google provider'ı etkinleştir (Çözüm 1)

### "Invalid redirect URL"
**Çözüm:** Supabase'de redirect URL'leri ekle (Çözüm 1, Adım 3)

### "Popup blocked"
**Çözüm:** Tarayıcıda popup blocker'ı kapat

### "Invalid client ID"
**Çözüm:** Google Cloud Console'da Client ID'yi kontrol et

### "Redirect URI mismatch"
**Çözüm:** Google Cloud Console'da redirect URI'leri kontrol et

---

## Test Checklist

- [ ] Google Cloud Console'da OAuth credentials oluşturuldu
- [ ] Supabase'de Google provider etkinleştirildi
- [ ] Client ID ve Secret doğru girildi
- [ ] Redirect URL'ler eklendi
- [ ] Site URL yapılandırıldı
- [ ] Tarayıcıda popup blocker kapalı
- [ ] Oyunda "Google ile Giriş Yap" butonu çalışıyor
- [ ] Giriş sonrası kullanıcı profili görünüyor
- [ ] Çıkış yapma çalışıyor

---

## Destek

Sorun devam ederse:
1. Tarayıcı konsolunu aç (F12)
2. Hata mesajını kopyala
3. Supabase Dashboard > Logs > Auth Logs kontrol et
4. Google Cloud Console > APIs & Services > Credentials kontrol et

---

**Not:** Bu kılavuz `rozmhxnuwsegoreejeoc.supabase.co` Supabase instance'ı için hazırlanmıştır. Farklı bir instance kullanıyorsanız URL'leri güncelleyin.
