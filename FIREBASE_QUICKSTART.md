# 🚀 Firebase Hızlı Başlangıç

## 5 Dakikada Firebase Kurulumu

### 1️⃣ Firebase Projesi Oluştur (2 dk)
```
1. https://console.firebase.google.com/ → Giriş yap
2. "Add project" → Proje adı: "color-fusion"
3. Google Analytics: İsteğe bağlı
4. "Create project" → Bekle
```

### 2️⃣ Web App Ekle (1 dk)
```
1. Firebase Console → Web ikonu (</>)
2. App nickname: "Color Fusion Web"
3. "Register app"
4. Config'i KOPYALA ⬇️
```

### 3️⃣ Authentication Aktifleştir (1 dk)
```
1. Sol menü → "Authentication"
2. "Get started"
3. "Google" → Enable → Save
```

### 4️⃣ Kodu Güncelle (1 dk)

**index.html** - `</head>` etiketinden ÖNCE ekle:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
```

**index.html** - Script sırasını değiştir:
```html
<!-- ÖNCE auth-firebase.js, SONRA game.js -->
<script src="auth-firebase.js"></script>
<script src="game.js"></script>
```

**auth-firebase.js** - Config'i yapıştır (satır 5-11):
```javascript
const firebaseConfig = {
  apiKey: "BURAYA_YAPISTIR",
  authDomain: "BURAYA_YAPISTIR",
  projectId: "BURAYA_YAPISTIR",
  storageBucket: "BURAYA_YAPISTIR",
  messagingSenderId: "BURAYA_YAPISTIR",
  appId: "BURAYA_YAPISTIR"
};
```

### 5️⃣ Test Et! ✅
```bash
# Sunucu başlat
python -m http.server 8000

# Tarayıcıda aç
http://localhost:8000

# "Google ile Giriş" butonuna tıkla
```

## 🎯 Tamamlandı!

Artık gerçek Google hesabıyla giriş yapabilirsin! 🎉

---

## 📱 Mobil için Ek Ayar

Mobilde popup çalışmazsa, `game.js` içinde:

```javascript
// Değiştir:
await AuthManager.signInWithGoogle();

// Şununla:
await AuthManager.signInWithRedirect();
```

---

## 🔧 Sorun mu var?

### "This domain is not authorized"
```
Firebase Console → Authentication → Settings 
→ Authorized domains → Domain ekle
```

### Popup açılmıyor
```
1. Popup blocker'ı kapat
2. Veya redirect kullan (yukarıda)
```

### API key hatası
```
Config'i tekrar kontrol et
Tüm alanlar dolu mu?
```

---

## 📊 Firestore Eklemek İster misin? (Opsiyonel)

Liderlik tablosunu bulutta saklamak için:

1. Firebase Console → "Firestore Database"
2. "Create database" → Test mode
3. `index.html`'e ekle:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

Detaylar için: `FIREBASE_SETUP.md`

---

**Başarılar! 🔥**
