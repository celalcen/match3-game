# 🎮 Color Fusion - Match 3 Puzzle Game

Eğlenceli ve bağımlılık yapan match-3 puzzle oyunu! Renkli topları eşleştir, özel taşlar oluştur ve seviyeleri tamamla!

## 🌟 Özellikler

### Oyun Mekaniği
- **7×7 Oyun Tahtası**: Geniş ve stratejik oyun alanı
- **Akıllı Pathfinding**: BFS algoritması ile en kısa yol bulma
- **Match-3 Sistemi**: Yatay, dikey ve çapraz eşleşmeler
- **Dinamik Zorluk**: Seviye ilerledikçe artan zorluk

### Özel Taşlar
- 🔴 **Satır Bombası**: 4'lü yatay eşleşme - tüm satırı temizler
- 🔵 **Sütun Bombası**: 4'lü dikey eşleşme - tüm sütunu temizler
- 💣 **Alan Bombası**: 4'lü çapraz veya 2x2 kare - 3×3 alan temizler
- 🌈 **Renk Bombası**: 5'li eşleşme - aynı renkteki tüm topları temizler
- ⭐ **Mega Bomba**: 6+ eşleşme - geniş alan temizler

### Engeller ve Özel Hücreler
- 🧱 **Taş**: Kırılamaz engel
- 🧊 **Buz**: 2 kez vurulmalı
- ⭐ **Bonus**: +100 puan

### Ses ve Müzik
- 🎵 Profesyonel arka plan müziği
- 🔊 Zengin ses efektleri (Web Audio API)
- 🎚️ Ayarlanabilir ses seviyesi
- 🎼 Seviye bazlı müzik temaları

### Görsel Efektler
- ✨ Uzay temalı modern tasarım
- 🌟 Parçacık efektleri
- 💫 Özel taş animasyonları
- 🎆 Seviye tamamlama kutlaması
- 🔥 Combo ekran sarsıntısı

### Mobil Optimizasyon
- 📱 Responsive tasarım
- 👆 Touch kontroller
- ⚡ GPU hızlandırma
- 📴 Offline oynanabilirlik (PWA)

## 🎯 Nasıl Oynanır

1. **Taş Seçimi**: Bir topa tıklayın
2. **Hareket**: Boş bir hücreye tıklayın (yol varsa taş hareket eder)
3. **Eşleştirme**: 3 veya daha fazla aynı renk topu eşleştirin
4. **Özel Taşlar**: 4+ eşleşme ile özel taşlar oluşturun
5. **Seviye Tamamlama**: Tahtada ≤1 top kalana kadar devam edin

## 🛠️ Teknik Detaylar

### Teknolojiler
- **Vanilla JavaScript**: Framework'siz, saf JS
- **Web Audio API**: Prosedürel ses üretimi
- **CSS3 Animations**: GPU hızlandırmalı animasyonlar
- **PWA**: Progressive Web App desteği
- **Service Worker**: Offline çalışma

### Modüler Yapı
```
├── game.js       # Ana oyun mantığı
├── board.js      # Tahta yönetimi ve pathfinding
├── match.js      # Eşleşme algılama
├── specials.js   # Özel taş sistemi
├── ui.js         # UI yönetimi ve animasyonlar
├── sounds.js     # Ses sistemi
└── style.css     # Stil ve animasyonlar
```

### Performans
- Direct DOM manipulation (querySelector minimizasyonu)
- GPU acceleration (transform, opacity)
- Efficient pathfinding (BFS)
- Optimized animations

## 📱 Google Play Store Hazırlığı

### Gerekli Dosyalar
- ✅ `manifest.json` - PWA manifest
- ✅ `service-worker.js` - Offline destek
- ⏳ `icons/` - Uygulama ikonları (72x72 - 512x512)
- ⏳ `screenshots/` - Ekran görüntüleri

### İkon Boyutları
- 72×72, 96×96, 128×128, 144×144
- 152×152, 192×192, 384×384, 512×512

### Ekran Görüntüleri
- 1080×1920 (portrait)
- En az 2 adet

## 🚀 Kurulum

### Web Sunucusu
```bash
# Basit HTTP sunucusu
python -m http.server 8000
# veya
npx serve
```

### PWA Test
1. Chrome DevTools > Application > Service Workers
2. Manifest kontrolü
3. Lighthouse audit

## 📦 Play Store Yayınlama

### Adımlar
1. **TWA (Trusted Web Activity) Oluştur**
   - Android Studio kullan
   - Bubblewrap veya PWABuilder kullan

2. **İkonları Hazırla**
   - 512×512 uygulama ikonu
   - Feature graphic (1024×500)

3. **Ekran Görüntüleri**
   - En az 2 adet
   - Farklı cihazlar için

4. **Play Console**
   - Uygulama bilgileri
   - Kategori: Oyunlar > Bulmaca
   - Yaş sınırı: 3+

## 👨‍💻 Geliştirici

**Celal ÇEN**

## 📄 Lisans

Bu proje özel bir projedir.

## 🎮 Oyun Bilgileri

- **Versiyon**: 1.0.0
- **Kategori**: Puzzle / Match-3
- **Platform**: Web (PWA)
- **Dil**: Türkçe
- **Yaş Sınırı**: 3+

## 🔄 Güncellemeler

### v1.0.0 (İlk Sürüm)
- ✅ Temel match-3 mekaniği
- ✅ Özel taşlar sistemi
- ✅ Engeller ve bonus hücreler
- ✅ Ses ve müzik sistemi
- ✅ Uzay temalı tasarım
- ✅ PWA desteği
- ✅ Mobil optimizasyon

## 🎯 Gelecek Özellikler

- [ ] Güçlendirme butonları (Çekiç, İpucu, Roket)
- [ ] Liderlik tablosu
- [ ] Günlük görevler
- [ ] Başarımlar sistemi
- [ ] Farklı oyun modları
- [ ] Sosyal paylaşım

---

**Oyunu oyna ve eğlen!** 🎮✨
