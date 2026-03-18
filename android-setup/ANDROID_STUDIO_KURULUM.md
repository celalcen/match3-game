# Android Studio ile Google Play Store'a Yükleme Rehberi

## 1. Proje Dosyalarını Hazırlama

### Web Dosyalarını Assets Klasörüne Kopyalama
```bash
# d:\top1 klasöründeki tüm web dosyalarını assets klasörüne kopyalayın
# Hedef: android-setup\app\src\main\assets\
```

Kopyalanacak dosyalar:
- index.html
- style.css
- quest-styles.css
- secret-code-styles.css
- game.js
- board.js
- match.js
- specials.js
- ui.js
- sounds.js
- leaderboard.js
- auth-supabase.js
- dailyQuests.js
- secretCode.js
- manifest.json
- service-worker.js
- Mike Leite Summer Vibes.mp3

## 2. Android Studio'da Projeyi Açma

1. **Android Studio'yu açın**
2. **File → Open** seçin
3. `android-setup` klasörünü seçin
4. **OK** tıklayın
5. Gradle sync otomatik başlayacak (ilk seferde biraz zaman alabilir)

## 3. Uygulama İkonu Ekleme

### İkon Oluşturma (Önerilen boyutlar):
- **mdpi**: 48x48 px
- **hdpi**: 72x72 px
- **xhdpi**: 96x96 px
- **xxhdpi**: 144x144 px
- **xxxhdpi**: 192x192 px

### İkonları Ekleme:
1. Android Studio'da **File → New → Image Asset**
2. **Icon Type**: Launcher Icons (Adaptive and Legacy)
3. **Path**: İkon dosyanızı seçin
4. **Next → Finish**

## 4. Uygulama Bilgilerini Güncelleme

### app/build.gradle dosyasında:
```gradle
defaultConfig {
    applicationId "com.ballblast.game"  // Benzersiz paket adı
    minSdk 24
    targetSdk 34
    versionCode 1        // Her güncelleme için artırın
    versionName "1.0"    // Kullanıcıya gösterilen versiyon
}
```

### AndroidManifest.xml dosyasında:
```xml
<application
    android:label="Ball Blast"  // Uygulama adı
    ...>
```

## 5. Test Etme

### Emulator ile Test:
1. **Tools → Device Manager**
2. **Create Device** tıklayın
3. Bir cihaz seçin (örn: Pixel 6)
4. **Next → Download** (sistem imajı)
5. **Finish**
6. **Run** (Shift+F10) tuşuna basın

### Gerçek Cihazda Test:
1. Telefonunuzda **Geliştirici Seçenekleri**'ni açın
2. **USB Hata Ayıklama**'yı etkinleştirin
3. USB ile bilgisayara bağlayın
4. Android Studio'da cihazınızı seçin
5. **Run** tuşuna basın

## 6. APK Oluşturma (Test için)

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. APK oluşturulunca **locate** linkine tıklayın
3. APK dosyası: `app/build/outputs/apk/debug/app-debug.apk`

## 7. Signed APK/AAB Oluşturma (Play Store için)

### Keystore Oluşturma (İlk Kez):
1. **Build → Generate Signed Bundle / APK**
2. **Android App Bundle** seçin → **Next**
3. **Create new...** tıklayın
4. Bilgileri doldurun:
   - **Key store path**: Kayıt yeri seçin
   - **Password**: Güçlü şifre
   - **Alias**: Anahtar adı (örn: ballblast-key)
   - **Validity**: 25 yıl (önerilen)
   - **Certificate**: Ad, organizasyon bilgileri
5. **OK → Next**

### AAB Oluşturma:
1. **Build → Generate Signed Bundle / APK**
2. **Android App Bundle** seçin
3. Keystore bilgilerinizi girin
4. **Release** seçin
5. **Create**
6. AAB dosyası: `app/release/app-release.aab`

## 8. Google Play Console'a Yükleme

### Play Console Hesabı:
1. https://play.google.com/console adresine gidin
2. Geliştirici hesabı oluşturun ($25 tek seferlik ücret)

### Uygulama Oluşturma:
1. **Create app** tıklayın
2. Uygulama bilgilerini doldurun:
   - App name: Ball Blast
   - Default language: Turkish
   - App or game: Game
   - Free or paid: Free
3. **Create app**

### AAB Yükleme:
1. Sol menüden **Production → Create new release**
2. **Upload** tıklayın
3. `app-release.aab` dosyasını yükleyin
4. **Release name**: 1.0
5. **Release notes**: Yenilikler yazın
6. **Save → Review release → Start rollout to Production**

### Store Listing (Mağaza Sayfası):
1. **Store presence → Main store listing**
2. Doldurulması gerekenler:
   - **App name**: Ball Blast
   - **Short description**: Kısa açıklama (80 karakter)
   - **Full description**: Detaylı açıklama (4000 karakter)
   - **Screenshots**: En az 2 ekran görüntüsü (her cihaz tipi için)
   - **Feature graphic**: 1024x500 px banner
   - **App icon**: 512x512 px (otomatik alınır)
   - **Category**: Games → Puzzle
   - **Contact details**: E-posta, web sitesi

### Content Rating:
1. **Policy → App content → Content rating**
2. Anketi doldurun
3. **Save → Calculate rating**

### Privacy Policy:
1. **Policy → App content → Privacy policy**
2. Privacy policy URL'si ekleyin (gerekli)

### Target Audience:
1. **Policy → App content → Target audience**
2. Yaş aralığını seçin (örn: 3+)

## 9. Yayınlama

1. Tüm bölümleri tamamladıktan sonra
2. **Publishing overview** sayfasına gidin
3. Tüm yeşil tik işaretlerini kontrol edin
4. **Send for review** tıklayın
5. Google incelemesi 1-7 gün sürebilir

## 10. Güncelleme Yayınlama

1. `app/build.gradle` dosyasında:
   ```gradle
   versionCode 2        // Artırın
   versionName "1.1"    // Güncelleyin
   ```
2. Yeni AAB oluşturun
3. **Production → Create new release**
4. Yeni AAB'yi yükleyin
5. Release notes yazın
6. **Review release → Start rollout**

## Önemli Notlar

- **Keystore dosyasını** güvenli bir yerde saklayın (kaybederseniz uygulama güncelleyemezsiniz!)
- **Keystore şifresini** unutmayın
- Her güncelleme için **versionCode** artırılmalı
- **minSdk 24** = Android 7.0+ (2016 ve sonrası cihazlar)
- İlk yayın incelemesi daha uzun sürebilir
- Uygulama reddedilirse, sorunları düzeltip tekrar gönderin

## Sorun Giderme

### Gradle Sync Hatası:
- **File → Invalidate Caches → Invalidate and Restart**

### WebView Boş Görünüyor:
- Assets klasöründe dosyaların olduğunu kontrol edin
- AndroidManifest.xml'de INTERNET izni olduğunu kontrol edin

### APK İmzalama Hatası:
- Keystore şifresini doğru girdiğinizden emin olun
- Keystore dosyasının erişilebilir olduğunu kontrol edin

## Faydalı Linkler

- Android Studio: https://developer.android.com/studio
- Play Console: https://play.google.com/console
- Android Geliştirici Dokümantasyonu: https://developer.android.com/docs
- WebView Rehberi: https://developer.android.com/develop/ui/views/layout/webapps
