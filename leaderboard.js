// ===== LEADERBOARD SYSTEM =====

const LeaderboardManager = {
  MAX_ENTRIES: 10,
  STORAGE_KEY: 'colorFusionLeaderboard',

  // Get all leaderboard entries
  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading leaderboard:', e);
      return [];
    }
  },

  // Save leaderboard
  saveLeaderboard(entries) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving leaderboard:', e);
    }
  },

  // Add new score
  addScore(playerName, score, level) {
    const entries = this.getLeaderboard();
    
    const newEntry = {
      name: playerName,
      score: score,
      level: level,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    entries.push(newEntry);
    
    // Sort by score (descending)
    entries.sort((a, b) => b.score - a.score);
    
    // Keep only top entries
    const topEntries = entries.slice(0, this.MAX_ENTRIES);
    
    this.saveLeaderboard(topEntries);
    
    // Return rank (1-based)
    const rank = topEntries.findIndex(e => 
      e.timestamp === newEntry.timestamp
    ) + 1;
    
    return {
      rank: rank,
      isTopScore: rank > 0 && rank <= this.MAX_ENTRIES
    };
  },

  // Check if score qualifies for leaderboard
  isHighScore(score) {
    const entries = this.getLeaderboard();
    
    if (entries.length < this.MAX_ENTRIES) {
      return true;
    }
    
    const lowestScore = entries[entries.length - 1].score;
    return score > lowestScore;
  },

  // Get player's best score
  getPlayerBestScore(playerName) {
    const entries = this.getLeaderboard();
    const playerEntries = entries.filter(e => 
      e.name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (playerEntries.length === 0) return null;
    
    return playerEntries[0]; // Already sorted
  },

  // Clear leaderboard
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
  // Show leaderboard modal
  show() {
    const entries = LeaderboardManager.getLeaderboard();
    
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal';
    modal.innerHTML = `
      <div class="leaderboard-content">
        <div class="leaderboard-header">
          <h2>🏆 Liderlik Tablosu</h2>
          <button class="leaderboard-close" id="closeLeaderboard">✕</button>
        </div>
        
        <div class="leaderboard-list">
          ${entries.length === 0 ? this.renderEmpty() : this.renderEntries(entries)}
        </div>
        
        <div class="leaderboard-footer">
          <button class="leaderboard-btn clear-btn" id="clearLeaderboard">
            🗑️ Temizle
          </button>
          <button class="leaderboard-btn close-btn" id="closeLeaderboardBtn">
            Kapat
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('closeLeaderboard').addEventListener('click', () => {
      this.hide();
    });
    
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
      this.hide();
    });
    
    document.getElementById('clearLeaderboard').addEventListener('click', () => {
      if (confirm('Liderlik tablosunu temizlemek istediğinize emin misiniz?')) {
        LeaderboardManager.clearLeaderboard();
        this.hide();
        this.show();
      }
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hide();
      }
    });
    
    // Animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
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
  renderEmpty() {
    return `
      <div class="leaderboard-empty">
        <div class="empty-icon">🎮</div>
        <p>Henüz kayıt yok</p>
        <p class="empty-subtitle">İlk rekor senin olsun!</p>
      </div>
    `;
  },

  // Render entries
  renderEntries(entries) {
    return entries.map((entry, index) => {
      const rank = index + 1;
      const medal = this.getMedal(rank);
      const isTop3 = rank <= 3;
      
      return `
        <div class="leaderboard-entry ${isTop3 ? 'top-entry' : ''}">
          <div class="entry-rank ${isTop3 ? 'medal' : ''}">
            ${medal || rank}
          </div>
          <div class="entry-info">
            <div class="entry-name">${this.escapeHtml(entry.name)}</div>
            <div class="entry-meta">
              Seviye ${entry.level} • ${LeaderboardManager.formatDate(entry.date)}
            </div>
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
