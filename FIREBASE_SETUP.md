# 🔥 Firebase Kurulum Rehberi

## 1. Firebase Projesi Oluşturma

### Adım 1: Firebase Console'a Git
1. https://console.firebase.google.com/ adresine git
2. Google hesabınla giriş yap
3. "Add project" veya "Proje ekle" butonuna tıkla

### Adım 2: Proje Bilgileri
1. **Proje adı**: `color-fusion` (veya istediğin isim)
2. **Google Analytics**: İsteğe bağlı (önerilir)
3. "Create project" tıkla
4. Proje hazır olana kadar bekle (30-60 saniye)

## 2. Web Uygulaması Ekleme

### Adım 1: Web App Ekle
1. Firebase Console'da projenin ana sayfasında
2. "Web" ikonuna (</>) tıkla
3. **App nickname**: `Color Fusion Web`
4. **Firebase Hosting**: İsteğe bağlı (şimdilik hayır)
5. "Register app" tıkla

### Adım 2: Firebase Config Kopyala
Şu şekilde bir config göreceksin:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "color-fusion-xxxxx.firebaseapp.com",
  projectId: "color-fusion-xxxxx",
  storageBucket: "color-fusion-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

**ÖNEMLİ**: Bu bilgileri kopyala, sonra kullanacağız!

## 3. Authentication Ayarları

### Adım 1: Authentication'ı Aktifleştir
1. Sol menüden "Build" > "Authentication" tıkla
2. "Get started" butonuna tıkla

### Adım 2: Google Sign-In Aktifleştir
1. "Sign-in method" sekmesine git
2. "Google" satırına tıkla
3. "Enable" toggle'ını aç
4. **Project support email**: E-posta adresini seç
5. "Save" tıkla

### Adım 3: Authorized Domains (Opsiyonel)
1. "Settings" sekmesine git
2. "Authorized domains" bölümüne git
3. Kendi domain'ini ekle (örn: `colorfusion.com`)
4. Localhost zaten ekli olacak

## 4. Firestore Database (Opsiyonel - Gelecek için)

### Liderlik Tablosu için Firestore
1. Sol menüden "Build" > "Firestore Database"
2. "Create database" tıkla
3. **Location**: En yakın bölgeyi seç (europe-west)
4. **Security rules**: "Start in test mode" (geliştirme için)
5. "Enable" tıkla

### Güvenlik Kuralları (Sonra Güncellenecek)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Kod Entegrasyonu

### Adım 1: Firebase SDK Ekle
`index.html` dosyasına Firebase SDK'larını ekle:

```html
<!-- Firebase App (core) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>

<!-- Firebase Authentication -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<!-- Firebase Firestore (opsiyonel) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

### Adım 2: Firebase Config Ekle
`auth.js` dosyasını güncelle:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "BURAYA_KOPYALADIĞIN_API_KEY",
  authDomain: "BURAYA_AUTH_DOMAIN",
  projectId: "BURAYA_PROJECT_ID",
  storageBucket: "BURAYA_STORAGE_BUCKET",
  messagingSenderId: "BURAYA_MESSAGING_SENDER_ID",
  appId: "BURAYA_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
```

### Adım 3: Auth Fonksiyonlarını Güncelle
`auth.js` içinde mock fonksiyonları gerçek Firebase fonksiyonlarıyla değiştir:

```javascript
// Sign in with Google (Real Firebase)
async signInWithGoogle() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    
    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: 'google.com'
    };
    
    this.saveUserToStorage(this.currentUser);
    this.updateUI();
    
    return this.currentUser;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign out (Real Firebase)
async signOut() {
  try {
    await auth.signOut();
    this.currentUser = null;
    localStorage.removeItem('colorFusionUser');
    this.updateUI();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Listen to auth state changes
init() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      this.currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: user.providerData[0].providerId
      };
      this.saveUserToStorage(this.currentUser);
    } else {
      this.currentUser = null;
      localStorage.removeItem('colorFusionUser');
    }
    this.updateUI();
  });
  
  this.isInitialized = true;
}
```

## 6. Test Etme

### Localhost'ta Test
1. Basit bir HTTP sunucusu başlat:
   ```bash
   python -m http.server 8000
   # veya
   npx serve
   ```

2. Tarayıcıda aç: `http://localhost:8000`

3. "Google ile Giriş" butonuna tıkla

4. Google hesabını seç

5. İzinleri onayla

6. Giriş başarılı! ✅

### Sorun Giderme

**Hata: "This domain is not authorized"**
- Firebase Console > Authentication > Settings > Authorized domains
- Domain'ini ekle

**Hata: "API key not valid"**
- Firebase config'i kontrol et
- API key doğru kopyalandı mı?

**Popup açılmıyor**
- Popup blocker'ı kapat
- Veya redirect kullan:
  ```javascript
  await auth.signInWithRedirect(googleProvider);
  ```

## 7. Firestore ile Liderlik Tablosu (Gelecek)

### Skor Kaydetme
```javascript
const db = firebase.firestore();

async function saveScore(userId, playerName, score, level) {
  await db.collection('leaderboard').add({
    userId: userId,
    playerName: playerName,
    score: score,
    level: level,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}
```

### Liderlik Tablosunu Çekme
```javascript
async function getLeaderboard() {
  const snapshot = await db.collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(10)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

## 8. Güvenlik

### API Key Güvenliği
- API key public olabilir (normal)
- Güvenlik Firebase Security Rules ile sağlanır
- Hassas işlemler için Cloud Functions kullan

### Security Rules Örneği
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Herkes okuyabilir
    match /leaderboard/{entry} {
      allow read: if true;
      
      // Sadece giriş yapmış kullanıcılar yazabilir
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Sadece kendi skorunu güncelleyebilir
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 9. Production Deployment

### Adım 1: Firebase Hosting (Opsiyonel)
```bash
# Firebase CLI kur
npm install -g firebase-tools

# Giriş yap
firebase login

# Projeyi başlat
firebase init hosting

# Deploy et
firebase deploy
```

### Adım 2: Custom Domain
1. Firebase Console > Hosting
2. "Add custom domain"
3. DNS kayıtlarını ekle
4. SSL otomatik aktif olur

## 10. Maliyet

### Ücretsiz Plan (Spark)
- **Authentication**: 10,000 kullanıcı/ay
- **Firestore**: 1 GB depolama, 50,000 okuma/gün
- **Hosting**: 10 GB depolama, 360 MB/gün transfer

**Oyunun için yeterli!** 🎮

### Ücretli Plan (Blaze)
- Kullandığın kadar öde
- Küçük oyunlar için genelde $0-5/ay

## 📝 Özet Checklist

- [ ] Firebase projesi oluştur
- [ ] Web app ekle
- [ ] Firebase config kopyala
- [ ] Authentication aktifleştir
- [ ] Google Sign-In aktifleştir
- [ ] Firebase SDK'ları HTML'e ekle
- [ ] auth.js'i güncelle
- [ ] Localhost'ta test et
- [ ] (Opsiyonel) Firestore ekle
- [ ] (Opsiyonel) Firebase Hosting

## 🆘 Yardım

- **Dokümantasyon**: https://firebase.google.com/docs
- **Auth Rehberi**: https://firebase.google.com/docs/auth/web/google-signin
- **Firestore Rehberi**: https://firebase.google.com/docs/firestore

---

**Başarılar! 🔥**
