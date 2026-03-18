// ===== MOCK AUTHENTICATION (Test için geçici çözüm) =====
// Google OAuth kurulumu yapılana kadar bu sistemi kullanabilirsiniz

const MockAuthManager = {
  currentUser: null,
  isInitialized: false,

  MOCK_USERS: [
    {
      uid: 'mock-user-1',
      email: 'oyuncu1@test.com',
      displayName: 'Ahmet Yılmaz',
      photoURL: null,
      provider: 'mock'
    },
    {
      uid: 'mock-user-2',
      email: 'oyuncu2@test.com',
      displayName: 'Ayşe Demir',
      photoURL: null,
      provider: 'mock'
    },
    {
      uid: 'mock-user-3',
      email: 'oyuncu3@test.com',
      displayName: 'Mehmet Kaya',
      photoURL: null,
      provider: 'mock'
    }
  ],

  // Initialize
  async init() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('colorFusionUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }
    
    this.isInitialized = true;
    this.updateUI();
  },

  // Show mock sign in dialog
  async signInWithGoogle() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'auth-modal show';
      
      modal.innerHTML = `
        <div class="auth-content">
          <div class="auth-header">
            <h2>🧪 Test Girişi</h2>
            <button class="auth-close" id="closeMockAuth">✕</button>
          </div>
          
          <div class="auth-body">
            <div class="auth-description">
              Google OAuth kurulumu yapılana kadar test hesaplarından birini seçin:
            </div>
            
            <div class="mock-accounts">
              ${this.MOCK_USERS.map((user, index) => `
                <div class="mock-account" data-index="${index}">
                  <div class="mock-avatar">${['👨', '👩', '👤'][index]}</div>
                  <div class="mock-info">
                    <div class="mock-name">${user.displayName}</div>
                    <div class="mock-email">${user.email}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="custom-account">
              <input type="text" id="customName" placeholder="Veya özel isim gir..." />
              <button class="custom-signin-btn" id="customSignInBtn">Giriş</button>
            </div>
            
            <div class="auth-note">
              ⚠️ Bu geçici bir test sistemidir. Gerçek Google OAuth için GOOGLE_AUTH_SETUP.md dosyasına bakın.
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close button
      document.getElementById('closeMockAuth').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        resolve(null);
      });
      
      // Mock account selection
      modal.querySelectorAll('.mock-account').forEach(account => {
        account.addEventListener('click', () => {
          const index = parseInt(account.dataset.index);
          const user = this.MOCK_USERS[index];
          
          this.currentUser = user;
          this.saveUserToStorage(user);
          this.updateUI();
          
          modal.classList.remove('show');
          setTimeout(() => modal.remove(), 300);
          
          UIManager.showToast(`✅ ${user.displayName} olarak giriş yapıldı!`, 2000);
          resolve(user);
        });
      });
      
      // Custom name sign in
      document.getElementById('customSignInBtn').addEventListener('click', () => {
        const name = document.getElementById('customName').value.trim();
        
        if (!name) {
          document.getElementById('customName').classList.add('error');
          setTimeout(() => {
            document.getElementById('customName').classList.remove('error');
          }, 500);
          return;
        }
        
        const user = {
          uid: 'mock-custom-' + Date.now(),
          email: name.toLowerCase().replace(/\s+/g, '') + '@test.com',
          displayName: name,
          photoURL: null,
          provider: 'mock'
        };
        
        this.currentUser = user;
        this.saveUserToStorage(user);
        this.updateUI();
        
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        
        UIManager.showToast(`✅ ${user.displayName} olarak giriş yapıldı!`, 2000);
        resolve(user);
      });
      
      // Click outside to close
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
          setTimeout(() => modal.remove(), 300);
          resolve(null);
        }
      });
    });
  },

  // Save user to localStorage
  saveUserToStorage(user) {
    try {
      localStorage.setItem('colorFusionUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  // Sign out
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('colorFusionUser');
    this.updateUI();
    UIManager.showToast('👋 Çıkış yapıldı', 2000);
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
  async showUserMenu() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    
    const user = this.currentUser;
    
    // Mock stats
    const bestScore = Math.floor(Math.random() * 50000).toLocaleString('tr-TR');
    const gameCount = Math.floor(Math.random() * 100);
    
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
            <div style="margin-top: 8px; padding: 4px 12px; background: rgba(255, 193, 7, 0.2); border-radius: 8px; font-size: 12px; color: #ffc107;">
              🧪 Test Hesabı
            </div>
          </div>
          
          <div class="user-stats">
            <div class="user-stat">
              <div class="stat-label">En Yüksek Skor</div>
              <div class="stat-value">${bestScore}</div>
            </div>
            <div class="user-stat">
              <div class="stat-label">Toplam Oyun</div>
              <div class="stat-value">${gameCount}</div>
            </div>
          </div>
          
          <button class="signout-btn" id="signOutBtn">
            🚪 Çıkış Yap
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeUserMenu').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    document.getElementById('signOutBtn').addEventListener('click', async () => {
      await this.signOut();
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }
};

// Export as AuthManager for compatibility
if (typeof AuthManager === 'undefined') {
  window.AuthManager = MockAuthManager;
}
