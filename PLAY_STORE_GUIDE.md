# 📱 Google Play Store Yayınlama Rehberi

## 🎯 Genel Bakış

Bu oyunu Google Play Store'da yayınlamak için **TWA (Trusted Web Activity)** veya **PWABuilder** kullanacağız.

## 📋 Gereksinimler

### 1. İkonlar (icons/ klasörü)
Aşağıdaki boyutlarda PNG ikonlar oluşturun:

- ✅ 72×72 px
- ✅ 96×96 px
- ✅ 128×128 px
- ✅ 144×144 px
- ✅ 152×152 px
- ✅ 192×192 px
- ✅ 384×384 px
- ✅ 512×512 px

**İkon Tasarım Önerileri:**
- Uzay temalı
- Renkli toplar içeren
- "Color Fusion" yazısı veya CF harfleri
- Mor/pembe/mavi gradient arka plan
- Yuvarlak köşeler (adaptive icon için)

### 2. Ekran Görüntüleri (screenshots/ klasörü)
En az 2, en fazla 8 adet:

- **Boyut**: 1080×1920 px (portrait)
- **Format**: PNG veya JPG
- **İçerik**: 
  - Oyun tahtası
  - Özel taşlar
  - Seviye tamamlama
  - Combo efektleri

### 3. Feature Graphic
- **Boyut**: 1024×500 px
- **Format**: PNG veya JPG
- **İçerik**: Oyun logosu + anahtar görseller

### 4. Promo Video (Opsiyonel)
- **Platform**: YouTube
- **Süre**: 30-120 saniye
- **İçerik**: Gameplay + özellikler

## 🛠️ Yöntem 1: PWABuilder (Kolay)

### Adımlar:

1. **PWABuilder'a Git**
   ```
   https://www.pwabuilder.com/
   ```

2. **URL Gir**
   - Oyunun web URL'sini gir
   - "Start" butonuna tıkla

3. **Manifest Kontrol**
   - Manifest.json otomatik algılanacak
   - Eksikleri tamamla

4. **Android Package Oluştur**
   - "Package for Stores" sekmesine git
   - "Android" seç
   - "Generate" tıkla

5. **APK/AAB İndir**
   - Oluşturulan paketi indir
   - Signing key'i kaydet (önemli!)

6. **Play Console'a Yükle**
   - Google Play Console'a git
   - Yeni uygulama oluştur
   - AAB dosyasını yükle

## 🛠️ Yöntem 2: Bubblewrap (Gelişmiş)

### Kurulum:
```bash
npm install -g @bubblewrap/cli
```

### Başlatma:
```bash
bubblewrap init --manifest https://your-domain.com/manifest.json
```

### Build:
```bash
bubblewrap build
```

### Çıktı:
- `app-release-signed.apk` veya `.aab`

## 🛠️ Yöntem 3: Android Studio (Manuel)

### Adımlar:

1. **Android Studio Aç**
2. **New Project** > **Empty Activity**
3. **TWA Kütüphanesi Ekle**
   ```gradle
   implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
   ```

4. **AndroidManifest.xml Düzenle**
   ```xml
   <activity
       android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
       android:label="@string/app_name">
       <meta-data
           android:name="android.support.customtabs.trusted.DEFAULT_URL"
           android:value="https://your-domain.com" />
       <intent-filter>
           <action android:name="android.intent.action.MAIN" />
           <category android:name="android.intent.category.LAUNCHER" />
       </intent-filter>
   </activity>
   ```

5. **Digital Asset Links**
   - `.well-known/assetlinks.json` oluştur
   - SHA-256 fingerprint ekle

6. **Build APK/AAB**
   ```
   Build > Generate Signed Bundle/APK
   ```

## 📝 Play Console Bilgileri

### Uygulama Detayları:
```
Ad: Color Fusion - Match 3 Puzzle
Kısa Açıklama: Eğlenceli match-3 puzzle oyunu! Topları eşleştir, özel taşlar oluştur!

Uzun Açıklama:
🎮 Color Fusion - Bağımlılık Yapan Match-3 Oyunu!

Renkli topları eşleştir, özel taşlar oluştur ve seviyeleri tamamla! 
Uzay temalı modern tasarım ve zengin ses efektleriyle dolu bu 
eğlenceli puzzle oyununda stratejini geliştir!

✨ ÖZELLİKLER:
• 7×7 geniş oyun tahtası
• 5 farklı özel taş tipi
• Engeller ve bonus hücreler
• Profesyonel müzik ve ses efektleri
• Sonsuz seviye
• Offline oynanabilir
• Reklamsız deneyim

🎯 NASIL OYNANIR:
1. Bir topa tıkla
2. Boş hücreye hareket ettir
3. 3+ aynı renk topu eşleştir
4. Özel taşlar oluştur
5. Seviyeleri tamamla!

💎 ÖZEL TAŞLAR:
• Satır Bombası - Tüm satırı temizle
• Sütun Bombası - Tüm sütunu temizle
• Alan Bombası - 3×3 alan temizle
• Renk Bombası - Tüm rengi temizle
• Mega Bomba - Geniş alan temizle

Hemen indir ve eğlenceye başla! 🚀
```

### Kategori:
- **Ana**: Oyunlar
- **Alt**: Bulmaca

### Etiketler:
```
match 3, puzzle, bulmaca, eşleştirme, renk, oyun, 
color fusion, match three, casual game
```

### İçerik Derecelendirmesi:
- **Yaş**: 3+ (Herkes)
- **Şiddet**: Yok
- **Cinsellik**: Yok
- **Uyuşturucu**: Yok
- **Küfür**: Yok

### Fiyatlandırma:
- **Ücretsiz** (Reklam yok, IAP yok)

## 🔐 Güvenlik

### Signing Key:
```bash
# Keystore oluştur
keytool -genkey -v -keystore color-fusion.keystore \
  -alias color-fusion -keyalg RSA -keysize 2048 -validity 10000
```

**ÖNEMLİ**: Keystore dosyasını ve şifresini güvenli bir yerde sakla!

## ✅ Kontrol Listesi

### Teknik:
- [ ] PWA manifest.json hazır
- [ ] Service worker çalışıyor
- [ ] HTTPS üzerinde yayında
- [ ] Tüm ikonlar hazır
- [ ] Ekran görüntüleri hazır
- [ ] Feature graphic hazır

### Play Console:
- [ ] Google Play Console hesabı ($25 tek seferlik)
- [ ] Uygulama oluşturuldu
- [ ] APK/AAB yüklendi
- [ ] Açıklama ve görseller eklendi
- [ ] İçerik derecelendirmesi tamamlandı
- [ ] Gizlilik politikası URL'si (gerekirse)

### Test:
- [ ] Farklı cihazlarda test edildi
- [ ] Offline çalışma test edildi
- [ ] Ses ve müzik çalışıyor
- [ ] Performans sorunsuz

## 🚀 Yayınlama

1. **Internal Test** (Opsiyonel)
   - Kapalı test grubu oluştur
   - Test kullanıcıları ekle
   - Geri bildirim topla

2. **Closed Beta** (Opsiyonel)
   - Daha geniş test grubu
   - Son düzeltmeler

3. **Production**
   - "Üretim" sekmesine git
   - "Yeni sürüm oluştur"
   - APK/AAB yükle
   - "İncelemeye gönder"

4. **İnceleme Süresi**
   - Genellikle 1-3 gün
   - Bazen birkaç saat

## 📊 Yayın Sonrası

### Analitik:
- Google Play Console istatistikleri
- Firebase Analytics (opsiyonel)
- Kullanıcı yorumları takibi

### Güncelleme:
```bash
# Versiyon artır
# manifest.json > version: "1.0.1"
# Yeni APK/AAB oluştur
# Play Console'a yükle
```

## 🆘 Sorun Giderme

### Manifest Hatası:
- manifest.json'ı doğrula
- Tüm gerekli alanlar dolu mu?

### İkon Hatası:
- Tüm boyutlar mevcut mu?
- PNG formatında mı?
- Şeffaf arka plan var mı?

### TWA Açılmıyor:
- Digital Asset Links doğru mu?
- HTTPS çalışıyor mu?
- URL doğru mu?

## 📞 Destek

- **Google Play Console**: https://play.google.com/console
- **PWABuilder**: https://www.pwabuilder.com/
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap

---

**Başarılar! 🎉**
