// ===== SUPABASE AUTHENTICATION =====

// Supabase configuration
const SUPABASE_URL = 'https://rozmhxnuwsegoreejeoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvem1oeG51d3NlZ29yZWVqZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQwNzcsImV4cCI6MjA4ODgzMDA3N30.3P5_vg9Zn4L8VVRwBmXjCljOU7ttB9WJ2H_whBN4rEE';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthManager = {
  currentUser: null,
  isInitialized: false,

  // Initialize Supabase Auth
  async init() {
    // Get current session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session?.user) {
      this.currentUser = this.formatUser(session.user);
      this.saveUserToStorage(this.currentUser);
    }
    
    // Listen to auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        this.currentUser = this.formatUser(session.user);
        this.saveUserToStorage(this.currentUser);
      } else {
        this.currentUser = null;
        localStorage.removeItem('colorFusionUser');
      }
      
      this.updateUI();
    });
    
    this.isInitialized = true;
    this.updateUI();
  },

  // Format user data
  formatUser(user) {
    return {
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Oyuncu',
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      provider: user.app_metadata?.provider || 'email'
    };
  },

  // Save user to localStorage
  saveUserToStorage(user) {
    try {
      localStorage.setItem('colorFusionUser', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const redirectTo = window.location.href.split('?')[0]; // current page without query params
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      // OAuth will redirect, so we don't need to do anything here
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (error.message.includes('popup')) {
        alert('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
      } else {
        alert('Giriş yapılamadı: ' + error.message);
      }
      
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) throw error;
      
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
  async showUserMenu() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    
    // Load stats from Supabase
    const user = this.currentUser;
    let bestScore = '0';
    let gameCount = 0;
    
    if (user) {
      try {
        const { data } = await supabaseClient
          .from('leaderboard')
          .select('score')
          .eq('user_id', user.uid)
          .order('score', { ascending: false })
          .limit(1);
        
        if (data && data.length > 0) {
          bestScore = data[0].score.toLocaleString('tr-TR');
        }
        
        const { count } = await supabaseClient
          .from('leaderboard')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.uid);
        
        gameCount = count || 0;
      } catch (e) {
        console.error('Error loading user stats:', e);
      }
    }
    
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
              <div class="stat-value">${bestScore}</div>
            </div>
            <div class="user-stat">
              <div class="stat-label">Toplam Oyun</div>
              <div class="stat-value">${gameCount}</div>
            </div>
          </div>
          
          <button class="view-scores-btn" id="viewMyScoresBtn">
            📊 Skorlarımı Gör
          </button>
          
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
    
    document.getElementById('viewMyScoresBtn').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        LeaderboardUI.show().then(() => {
          // Switch to "mine" tab
          const mineTab = document.querySelector('.lb-tab[data-tab="mine"]');
          if (mineTab) mineTab.click();
        });
      }, 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });
  },
};

// AuthManager is initialized by game.js on DOMContentLoaded
