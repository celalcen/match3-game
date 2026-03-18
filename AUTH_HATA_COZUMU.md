# 🔐 Google Giriş Hatası - Hızlı Çözüm

## ❌ Hata Mesajı
```
Unsupported provider: provider is not enabled
```

Bu hata, Supabase'de Google OAuth'un etkinleştirilmemiş olduğunu gösterir.

---

## ✅ Hızlı Çözüm (2 Dakika)

### Seçenek 1: Mock Authentication Kullan (Önerilen - Test İçin)

1. **`index.html` dosyasını aç**

2. **Şu satırı bul (yaklaşık 153. satır):**
   ```html
   <script src="auth-supabase.js"></script>
   ```

3. **Yorum yap ve mock auth'u aktif et:**
   ```html
   <!-- <script src="auth-supabase.js"></script> -->
   <script src="auth-mock.js"></script>
   ```

4. **Kaydet ve sayfayı yenile**

5. **"Google ile Giriş Yap" butonuna tıkla**
   - Test hesaplarından birini seç
   - Veya özel isim gir

✅ **Artık giriş yapabilirsiniz!**

---

### Seçenek 2: Google OAuth'u Kurulum (Üretim İçin)

Detaylı kurulum için: **`GOOGLE_AUTH_SETUP.md`** dosyasına bakın.

Kısa özet:
1. Google Cloud Console'da OAuth credentials oluştur
2. Supabase'de Google provider'ı etkinleştir
3. Client ID ve Secret'ı gir
4. Redirect URL'leri ekle

---

## 🎮 Mock Auth Özellikleri

### Test Hesapları:
- 👨 Ahmet Yılmaz (oyuncu1@test.com)
- 👩 Ayşe Demir (oyuncu2@test.com)
- 👤 Mehmet Kaya (oyuncu3@test.com)

### Veya:
- Özel isim gir ve hemen giriş yap

### Özellikler:
- ✅ Tüm oyun özellikleri çalışır
- ✅ Liderlik tablosu çalışır
- ✅ Skorlar kaydedilir (localStorage)
- ✅ Profil menüsü çalışır
- ⚠️ Gerçek Google hesabı değil (test için)

---

## 🔄 Geri Dönüş (Mock'tan Supabase'e)

Mock auth'u test ettikten sonra gerçek Google OAuth'a geçmek için:

1. **`index.html` dosyasını aç**

2. **Şu satırları bul:**
   ```html
   <!-- <script src="auth-supabase.js"></script> -->
   <script src="auth-mock.js"></script>
   ```

3. **Geri değiştir:**
   ```html
   <script src="auth-supabase.js"></script>
   <!-- <script src="auth-mock.js"></script> -->
   ```

4. **Google OAuth kurulumunu tamamla** (`GOOGLE_AUTH_SETUP.md`)

---

## 📝 Notlar

- Mock auth sadece test içindir
- Gerçek üretim ortamında Google OAuth kullanın
- Mock auth verileri sadece tarayıcıda saklanır
- Tarayıcı temizlenirse veriler kaybolur

---

## 🆘 Hala Sorun mu Var?

1. Tarayıcı konsolunu aç (F12)
2. Hata mesajını kontrol et
3. `GOOGLE_AUTH_SETUP.md` dosyasına bak
4. Veya mock auth kullan (yukarıdaki adımlar)

---

**Hızlı Test:** Mock auth ile 2 dakikada oyunu test edebilirsiniz! 🚀
