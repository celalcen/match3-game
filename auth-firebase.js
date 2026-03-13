// ===== FIREBASE AUTHENTICATION (REAL) =====
// Bu dosya Firebase yapılandırması yapıldıktan sonra auth.js yerine kullanılacak

// Firebase configuration - Firebase Console'dan alınacak
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Optionally add scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

const AuthManager = {
  currentUser: null,
  isInitialized: false,

  // Initialize Firebase Auth
  init() {
    // Listen to auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.providerData[0]?.providerId || 'unknown'
        };
        this.saveUserToStorage(this.currentUser);
      } else {
        this.currentUser = null;
        localStorage.removeItem('colorFusionUser');
      }
      this.updateUI();
    });
    
    this.isInitialized = true;
  },

  // Save user to localStorage
  saveUserToStorage(user) {
    try {
      localStorage.setItem('colorFusionUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

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
      
      // Handle specific errors
      if (error.code === 'auth/popup-blocked') {
        alert('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else {
        alert('Giriş yapılamadı: ' + error.message);
      }
      
      throw error;
    }
  },

  // Sign in with redirect (alternative for mobile)
  async signInWithRedirect() {
    try {
      await auth.signInWithRedirect(googleProvider);
    } catch (error) {
      console.error('Sign in redirect error:', error);
      throw error;
    }
  },

  // Get redirect result
  async getRedirectResult() {
    try {
      const result = await auth.getRedirectResult();
      if (result.user) {
        this.currentUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          provider: 'google.com'
        };
        this.saveUserToStorage(this.currentUser);
        this.updateUI();
      }
    } catch (error) {
      console.error('Redirect result error:', error);
    }
  },

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      this.currentUser = null;
      localStorage.removeItem('colorFusionUser');
      this.updateUI();
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Çıkış yapılamadı: ' + error.message);
    }
  },

  // Check if user is signed in
  isSignedIn() {
    return this.currentUser !== null;
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },

  // Get user display name
  getUserDisplayName() {
    if (!this.currentUser) return 'Misafir';
    return this.currentUser.displayName || this.currentUser.email || 'Oyuncu';
  },

  // Get user photo URL
  getUserPhotoURL() {
    if (!this.currentUser) return null;
    return this.currentUser.photoURL;
  },

  // Update UI based on auth state
  updateUI() {
    const signInBtn = document.getElementById('signInBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userPhoto = document.getElementById('userPhoto');

    if (this.isSignedIn()) {
      // Show user profile
      if (signInBtn) signInBtn.style.display = 'none';
      if (userProfile) userProfile.style.display = 'flex';
      if (userName) userName.textContent = this.getUserDisplayName();
      
      if (userPhoto && this.getUserPhotoURL()) {
        userPhoto.src = this.getUserPhotoURL();
        userPhoto.style.display = 'block';
      } else if (userPhoto) {
        userPhoto.style.display = 'none';
      }
    } else {
      // Show sign in button
      if (signInBtn) signInBtn.style.display = 'flex';
      if (userProfile) userProfile.style.display = 'none';
    }
  },

  // Show user menu
  showUserMenu() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    modal.innerHTML = `
      <div class="auth-content user-menu-content">
        <div class="auth-header">
          <h2>Profil</h2>
          <button class="auth-close" id="closeUserMenu">✕</button>
        </div>
        
        <div class="auth-body">
          <div class="user-info-card">
            ${this.getUserPhotoURL() ? 
              `<img src="${this.getUserPhotoURL()}" class="user-info-photo" />` :
              '<div class="user-info-avatar">👤</div>'
            }
            <div class="user-info-name">${this.getUserDisplayName()}</div>
            ${this.currentUser.email ? 
              `<div class="user-info-email">${this.currentUser.email}</div>` : 
              ''
            }
          </div>
          
          <div class="user-stats">
            <div class="user-stat">
              <div class="stat-label">En Yüksek Skor</div>
              <div class="stat-value">${this.getUserBestScore()}</div>
            </div>
            <div class="user-stat">
              <div class="stat-label">Toplam Oyun</div>
              <div class="stat-value">${this.getUserGameCount()}</div>
            </div>
          </div>
          
          <button class="signout-btn" id="signOutBtn">
            🚪 Çıkış Yap
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    document.getElementById('closeUserMenu').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Sign out button
    document.getElementById('signOutBtn').addEventListener('click', async () => {
      await this.signOut();
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });
  },

  // Get user's best score
  getUserBestScore() {
    if (!this.isSignedIn()) return 0;
    
    const bestScore = LeaderboardManager.getPlayerBestScore(this.getUserDisplayName());
    return bestScore ? bestScore.score.toLocaleString('tr-TR') : '0';
  },

  // Get user's game count
  getUserGameCount() {
    if (!this.isSignedIn()) return 0;
    
    const entries = LeaderboardManager.getLeaderboard();
    const userEntries = entries.filter(e => 
      e.name.toLowerCase() === this.getUserDisplayName().toLowerCase()
    );
    
    return userEntries.length;
  }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
  
  // Check for redirect result (for mobile)
  AuthManager.getRedirectResult();
});
