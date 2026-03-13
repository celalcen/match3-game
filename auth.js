// ===== FIREBASE AUTHENTICATION =====

const AuthManager = {
  currentUser: null,
  isInitialized: false,

  // Initialize Firebase (you need to add your config)
  init() {
    // Firebase config will be added here
    // For now, we'll use a mock system that can be replaced with real Firebase
    this.loadUserFromStorage();
    this.isInitialized = true;
  },

  // Load user from localStorage (temporary until Firebase is configured)
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('colorFusionUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.updateUI();
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
  },

  // Save user to localStorage
  saveUserToStorage(user) {
    try {
      localStorage.setItem('colorFusionUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  // Sign in with Google (Mock - will be replaced with Firebase)
  async signInWithGoogle() {
    return new Promise((resolve, reject) => {
      // Show mock Google sign-in dialog
      this.showMockGoogleSignIn((userData) => {
        this.currentUser = userData;
        this.saveUserToStorage(userData);
        this.updateUI();
        resolve(userData);
      });
    });
  },

  // Sign out
  signOut() {
    this.currentUser = null;
    localStorage.removeItem('colorFusionUser');
    this.updateUI();
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

  // Mock Google Sign-In Dialog (will be replaced with real Firebase)
  showMockGoogleSignIn(callback) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    modal.innerHTML = `
      <div class="auth-content">
        <div class="auth-header">
          <h2>Google ile Giriş Yap</h2>
          <button class="auth-close" id="closeAuth">✕</button>
        </div>
        
        <div class="auth-body">
          <p class="auth-description">
            Google hesabınızla giriş yaparak skorlarınızı kaydedin ve 
            liderlik tablosunda yerinizi alın!
          </p>
          
          <div class="mock-accounts">
            <div class="mock-account" data-email="oyuncu@gmail.com">
              <div class="mock-avatar">👤</div>
              <div class="mock-info">
                <div class="mock-name">Test Oyuncu</div>
                <div class="mock-email">oyuncu@gmail.com</div>
              </div>
            </div>
            
            <div class="mock-account" data-email="kullanici@gmail.com">
              <div class="mock-avatar">🎮</div>
              <div class="mock-info">
                <div class="mock-name">Oyun Kullanıcısı</div>
                <div class="mock-email">kullanici@gmail.com</div>
              </div>
            </div>
            
            <div class="custom-account">
              <input 
                type="text" 
                id="customName" 
                placeholder="Adınızı girin"
                maxlength="30"
              />
              <button class="custom-signin-btn" id="customSignIn">
                Giriş Yap
              </button>
            </div>
          </div>
          
          <p class="auth-note">
            ℹ️ Firebase yapılandırması yapıldığında gerçek Google girişi aktif olacak
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    document.getElementById('closeAuth').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Mock account selection
    document.querySelectorAll('.mock-account').forEach(account => {
      account.addEventListener('click', () => {
        const email = account.dataset.email;
        const name = account.querySelector('.mock-name').textContent;
        
        const userData = {
          uid: 'mock_' + Date.now(),
          email: email,
          displayName: name,
          photoURL: null,
          provider: 'google.com'
        };
        
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
          callback(userData);
        }, 300);
      });
    });
    
    // Custom sign in
    document.getElementById('customSignIn').addEventListener('click', () => {
      const name = document.getElementById('customName').value.trim();
      
      if (name.length === 0) {
        document.getElementById('customName').classList.add('error');
        setTimeout(() => {
          document.getElementById('customName').classList.remove('error');
        }, 500);
        return;
      }
      
      const userData = {
        uid: 'custom_' + Date.now(),
        email: null,
        displayName: name,
        photoURL: null,
        provider: 'custom'
      };
      
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        callback(userData);
      }, 300);
    });
    
    // Enter key on custom input
    document.getElementById('customName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('customSignIn').click();
      }
    });
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
    document.getElementById('signOutBtn').addEventListener('click', () => {
      this.signOut();
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
});
