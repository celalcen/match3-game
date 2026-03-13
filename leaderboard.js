// ===== LEADERBOARD SYSTEM =====

const LeaderboardManager = {
  MAX_ENTRIES: 100, // Supabase'de daha fazla kayıt tutabiliriz
  STORAGE_KEY: 'colorFusionLeaderboard',

  // Get global leaderboard from Supabase
  async getGlobalLeaderboard(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map(entry => ({
        name: entry.user_name,
        email: entry.user_email,
        photo: entry.user_photo,
        score: entry.score,
        level: entry.level,
        date: entry.created_at,
        userId: entry.user_id
      }));
    } catch (e) {
      console.error('Error loading global leaderboard:', e);
      return this.getLocalLeaderboard(); // Fallback to local
    }
  },

  // Get user's personal scores from Supabase
  async getUserScores(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map(entry => ({
        name: entry.user_name,
        score: entry.score,
        level: entry.level,
        date: entry.created_at
      }));
    } catch (e) {
      console.error('Error loading user scores:', e);
      return [];
    }
  },

  // Get local leaderboard (fallback)
  getLocalLeaderboard() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading local leaderboard:', e);
      return [];
    }
  },

  // Save to local storage (fallback)
  saveLocalLeaderboard(entries) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving local leaderboard:', e);
    }
  },

  // Add new score (saves to both Supabase and localStorage)
  async addScore(playerName, score, level) {
    const user = AuthManager.getCurrentUser();
    
    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .insert([{
            user_id: user.uid,
            user_name: playerName,
            user_email: user.email,
            user_photo: user.photoURL,
            score: score,
            level: level
          }])
          .select();

        if (error) throw error;
        
        // Get user's rank
        const { count } = await supabase
          .from('leaderboard')
          .select('*', { count: 'exact', head: true })
          .gt('score', score);
        
        const rank = (count || 0) + 1;
        
        return {
          rank: rank,
          isTopScore: rank <= 100,
          savedToCloud: true
        };
      } catch (e) {
        console.error('Error saving to Supabase:', e);
        // Fallback to local storage
      }
    }
    
    // Fallback: Save to localStorage
    const entries = this.getLocalLeaderboard();
    
    const newEntry = {
      name: playerName,
      score: score,
      level: level,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    entries.push(newEntry);
    entries.sort((a, b) => b.score - a.score);
    const topEntries = entries.slice(0, this.MAX_ENTRIES);
    this.saveLocalLeaderboard(topEntries);
    
    const rank = topEntries.findIndex(e => e.timestamp === newEntry.timestamp) + 1;
    
    return {
      rank: rank,
      isTopScore: rank > 0 && rank <= this.MAX_ENTRIES,
      savedToCloud: false
    };
  },

  // Check if score qualifies for leaderboard
  async isHighScore(score) {
    // Always return true for cloud leaderboard (we keep more entries)
    if (AuthManager.isSignedIn()) {
      return true;
    }
    
    // For local, check top 100
    const entries = this.getLocalLeaderboard();
    if (entries.length < this.MAX_ENTRIES) {
      return true;
    }
    
    const lowestScore = entries[entries.length - 1].score;
    return score > lowestScore;
  },

  // Get player's best score
  getPlayerBestScore(playerName) {
    const entries = this.getLocalLeaderboard();
    const playerEntries = entries.filter(e => 
      e.name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (playerEntries.length === 0) return null;
    return playerEntries[0];
  },

  // Clear local leaderboard
  clearLeaderboard() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  // Format date
  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
};

// ===== LEADERBOARD UI =====

const LeaderboardUI = {
  // Show leaderboard modal with tabs
  async show() {
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    const isLoggedIn = AuthManager.isSignedIn();
    
    modal.innerHTML = `
      <div class="leaderboard-content">
        <div class="leaderboard-header">
          <h2>🏆 Liderlik Tablosu</h2>
          <button class="leaderboard-close" id="closeLeaderboard">✕</button>
        </div>
        
        <div class="leaderboard-tabs">
          <button class="lb-tab active" data-tab="global">🌍 Global</button>
          ${isLoggedIn ? '<button class="lb-tab" data-tab="mine">👤 Benim Skorlarım</button>' : ''}
        </div>
        
        <div class="leaderboard-list" id="leaderboardList">
          <div class="lb-loading">⏳ Yükleniyor...</div>
        </div>
        
        <div class="leaderboard-footer">
          ${!isLoggedIn ? `
            <button class="leaderboard-btn signin-prompt-btn" id="lbSignInBtn">
              🔐 Giriş Yap & Skoru Kaydet
            </button>
          ` : ''}
          <button class="leaderboard-btn close-btn" id="closeLeaderboardBtn">
            Kapat
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load global leaderboard
    await this.loadTab('global');
    
    // Tab switching
    modal.querySelectorAll('.lb-tab').forEach(tab => {
      tab.addEventListener('click', async () => {
        modal.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        await this.loadTab(tab.dataset.tab);
      });
    });
    
    // Close buttons
    document.getElementById('closeLeaderboard').addEventListener('click', () => this.hide());
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => this.hide());
    
    // Sign in button in leaderboard
    const lbSignInBtn = document.getElementById('lbSignInBtn');
    if (lbSignInBtn) {
      lbSignInBtn.addEventListener('click', async () => {
        this.hide();
        await AuthManager.signInWithGoogle();
      });
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });
    
    // Animation
    setTimeout(() => modal.classList.add('show'), 10);
  },

  // Load tab content
  async loadTab(tab) {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    
    list.innerHTML = '<div class="lb-loading">⏳ Yükleniyor...</div>';
    
    if (tab === 'global') {
      const entries = await LeaderboardManager.getGlobalLeaderboard(100);
      const currentUserId = AuthManager.getCurrentUser()?.uid;
      list.innerHTML = entries.length === 0 
        ? this.renderEmpty() 
        : this.renderEntries(entries, currentUserId);
    } else if (tab === 'mine') {
      const user = AuthManager.getCurrentUser();
      if (!user) {
        list.innerHTML = this.renderEmpty();
        return;
      }
      const entries = await LeaderboardManager.getUserScores(user.uid, 20);
      list.innerHTML = entries.length === 0 
        ? this.renderEmpty('Henüz skor kaydetmedin!') 
        : this.renderUserEntries(entries);
    }
  },

  // Hide leaderboard modal
  hide() {
    const modal = document.querySelector('.leaderboard-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  },

  // Render empty state
  renderEmpty(msg = 'Henüz kayıt yok') {
    return `
      <div class="leaderboard-empty">
        <div class="empty-icon">🎮</div>
        <p>${msg}</p>
        <p class="empty-subtitle">İlk rekor senin olsun!</p>
      </div>
    `;
  },

  // Render global entries (highlight current user)
  renderEntries(entries, currentUserId) {
    return entries.map((entry, index) => {
      const rank = index + 1;
      const medal = this.getMedal(rank);
      const isTop3 = rank <= 3;
      const isCurrentUser = currentUserId && entry.userId === currentUserId;
      
      return `
        <div class="leaderboard-entry ${isTop3 ? 'top-entry' : ''} ${isCurrentUser ? 'my-entry' : ''}">
          <div class="entry-rank ${isTop3 ? 'medal' : ''}">
            ${medal || rank}
          </div>
          <div class="entry-avatar">
            ${entry.photo 
              ? `<img src="${entry.photo}" class="entry-photo" onerror="this.style.display='none'" />`
              : `<span class="entry-avatar-placeholder">👤</span>`
            }
          </div>
          <div class="entry-info">
            <div class="entry-name">${this.escapeHtml(entry.name)} ${isCurrentUser ? '<span class="you-badge">Sen</span>' : ''}</div>
            <div class="entry-meta">
              Seviye ${entry.level} • ${LeaderboardManager.formatDate(entry.date)}
            </div>
          </div>
          <div class="entry-score">${entry.score.toLocaleString('tr-TR')}</div>
        </div>
      `;
    }).join('');
  },

  // Render user's own scores
  renderUserEntries(entries) {
    return entries.map((entry, index) => {
      const rank = index + 1;
      return `
        <div class="leaderboard-entry ${rank === 1 ? 'top-entry' : ''}">
          <div class="entry-rank">${rank === 1 ? '🏆' : rank}</div>
          <div class="entry-info">
            <div class="entry-name">Seviye ${entry.level}</div>
            <div class="entry-meta">${LeaderboardManager.formatDate(entry.date)}</div>
          </div>
          <div class="entry-score">${entry.score.toLocaleString('tr-TR')}</div>
        </div>
      `;
    }).join('');
  },

  // Get medal emoji
  getMedal(rank) {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return medals[rank] || null;
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Show name input dialog
  showNameInput(score, level, callback) {
    // If user is signed in, use their name automatically
    if (AuthManager.isSignedIn()) {
      const playerName = AuthManager.getUserDisplayName();
      callback(playerName);
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal show';
    modal.innerHTML = `
      <div class="leaderboard-content name-input-content">
        <div class="leaderboard-header">
          <h2>🎉 Yeni Rekor!</h2>
        </div>
        
        <div class="name-input-body">
          <p class="score-display">Skorun: <strong>${score.toLocaleString('tr-TR')}</strong></p>
          <p class="level-display">Seviye: <strong>${level}</strong></p>
          
          <div class="input-group">
            <label for="playerName">İsmin:</label>
            <input 
              type="text" 
              id="playerName" 
              maxlength="20" 
              placeholder="Adını gir"
              autocomplete="off"
            />
          </div>
          
          <p class="signin-suggestion">
            💡 <a href="#" id="signInLink">Google ile giriş yap</a> ve skorlarını otomatik kaydet!
          </p>
        </div>
        
        <div class="leaderboard-footer">
          <button class="leaderboard-btn cancel-btn" id="cancelName">
            İptal
          </button>
          <button class="leaderboard-btn save-btn" id="saveName">
            💾 Kaydet
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = document.getElementById('playerName');
    const saveBtn = document.getElementById('saveName');
    const cancelBtn = document.getElementById('cancelName');
    const signInLink = document.getElementById('signInLink');
    
    // Focus input
    setTimeout(() => input.focus(), 100);
    
    // Save handler
    const save = () => {
      const name = input.value.trim();
      if (name.length === 0) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 500);
        return;
      }
      
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        callback(name);
      }, 300);
    };
    
    // Event listeners
    saveBtn.addEventListener('click', save);
    
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        save();
      }
    });
    
    // Sign in link
    signInLink.addEventListener('click', async (e) => {
      e.preventDefault();
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
      
      await AuthManager.signInWithGoogle();
      
      // After sign in, save score with user's name
      const playerName = AuthManager.getUserDisplayName();
      callback(playerName);
    });
  }
};
