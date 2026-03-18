// ===== DAILY QUESTS SYSTEM =====

const DailyQuestsManager = {
  STORAGE_KEY: 'colorFusionDailyQuests',
  
  // Quest definitions
  QUESTS: [
    {
      id: 'complete_levels',
      title: '3 Level Tamamla',
      description: 'Bugün 3 level tamamla',
      target: 3,
      reward: { type: 'booster', booster: 'hammer', amount: 1 },
      icon: '🎯',
      trackKey: 'levelsCompleted'
    },
    {
      id: 'create_specials',
      title: '50 Özel Taş Oluştur',
      description: 'Bugün 50 özel taş oluştur',
      target: 50,
      reward: { type: 'booster', booster: 'shuffle', amount: 1 },
      icon: '⭐',
      trackKey: 'specialsCreated'
    },
    {
      id: 'pop_balls',
      title: '500 Top Patlat',
      description: 'Bugün 500 top patlat',
      target: 500,
      reward: { type: 'booster', booster: 'colorBomb', amount: 1 },
      icon: '💥',
      trackKey: 'ballsPopped'
    },
    {
      id: 'earn_score',
      title: '5000 Puan Kazan',
      description: 'Bugün 5000 puan kazan',
      target: 5000,
      reward: { type: 'life', amount: 1 },
      icon: '🏆',
      trackKey: 'scoreEarned'
    }
  ],

  // Get today's date string (YYYY-MM-DD)
  getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },

  // Load quests from localStorage
  loadQuests() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return this.initializeQuests();
      
      const saved = JSON.parse(data);
      
      // Check if it's a new day
      if (saved.date !== this.getTodayString()) {
        return this.initializeQuests();
      }
      
      return saved;
    } catch (e) {
      console.error('Error loading quests:', e);
      return this.initializeQuests();
    }
  },

  // Initialize fresh quests for today
  initializeQuests() {
    const quests = {
      date: this.getTodayString(),
      progress: {},
      completed: {}
    };
    
    this.QUESTS.forEach(quest => {
      quests.progress[quest.id] = 0;
      quests.completed[quest.id] = false;
    });
    
    this.saveQuests(quests);
    return quests;
  },

  // Save quests to localStorage
  saveQuests(quests) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quests));
    } catch (e) {
      console.error('Error saving quests:', e);
    }
  },

  // Update quest progress
  updateProgress(trackKey, amount = 1) {
    const quests = this.loadQuests();
    
    this.QUESTS.forEach(quest => {
      if (quest.trackKey === trackKey && !quests.completed[quest.id]) {
        quests.progress[quest.id] = Math.min(
          quests.progress[quest.id] + amount,
          quest.target
        );
        
        // Check if quest completed
        if (quests.progress[quest.id] >= quest.target) {
          this.completeQuest(quest, quests);
        }
      }
    });
    
    this.saveQuests(quests);
  },

  // Complete a quest and give reward
  completeQuest(quest, quests) {
    if (quests.completed[quest.id]) return;
    
    quests.completed[quest.id] = true;
    
    // Give reward
    if (quest.reward.type === 'booster') {
      GameState.boosters[quest.reward.booster] += quest.reward.amount;
      if (typeof Game !== 'undefined' && Game.updateBoosterUI) {
        Game.updateBoosterUI();
      }
      UIManager.showToast(`🎁 ${quest.title} tamamlandı! +${quest.reward.amount} ${this.getBoosterName(quest.reward.booster)}`, 3000);
    } else if (quest.reward.type === 'life') {
      GameState.lives += quest.reward.amount;
      UIManager.updateLives(GameState.lives);
      UIManager.showToast(`🎁 ${quest.title} tamamlandı! +${quest.reward.amount} Can`, 3000);
    }
    
    this.saveQuests(quests);
  },

  // Get booster display name
  getBoosterName(booster) {
    const names = {
      hammer: 'Çekiç',
      shuffle: 'Karıştırıcı',
      colorBomb: 'Renk Bombası',
      extraMoves: '+5 Hamle'
    };
    return names[booster] || booster;
  },

  // Get all quests with progress
  getQuests() {
    const data = this.loadQuests();
    return this.QUESTS.map(quest => ({
      ...quest,
      progress: data.progress[quest.id] || 0,
      completed: data.completed[quest.id] || false
    }));
  }
};

// ===== DAILY QUESTS UI =====

const DailyQuestsUI = {
  // Show quests modal
  show() {
    const quests = DailyQuestsManager.getQuests();
    
    const modal = document.createElement('div');
    modal.className = 'quests-modal';
    modal.innerHTML = `
      <div class="quests-content">
        <div class="quests-header">
          <h2>📅 Günlük Görevler</h2>
          <button class="quests-close" id="closeQuests">✕</button>
        </div>
        
        <div class="quests-list">
          ${quests.map(quest => this.renderQuest(quest)).join('')}
        </div>
        
        <div class="quests-footer">
          <p class="quests-reset">Görevler her gün sıfırlanır</p>
          <button class="quests-btn" id="closeQuestsBtn">Kapat</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('closeQuests').addEventListener('click', () => this.hide());
    document.getElementById('closeQuestsBtn').addEventListener('click', () => this.hide());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });
    
    setTimeout(() => modal.classList.add('show'), 10);
  },

  // Hide quests modal
  hide() {
    const modal = document.querySelector('.quests-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  },

  // Render single quest
  renderQuest(quest) {
    const progress = Math.min(quest.progress, quest.target);
    const percentage = (progress / quest.target) * 100;
    const isCompleted = quest.completed;
    
    return `
      <div class="quest-item ${isCompleted ? 'completed' : ''}">
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-info">
          <div class="quest-title">${quest.title}</div>
          <div class="quest-description">${quest.description}</div>
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="quest-progress-text">${progress} / ${quest.target}</div>
        </div>
        <div class="quest-reward">
          ${isCompleted ? 
            '<span class="quest-completed-badge">✓</span>' :
            this.renderReward(quest.reward)
          }
        </div>
      </div>
    `;
  },

  // Render reward
  renderReward(reward) {
    if (reward.type === 'booster') {
      const icons = {
        hammer: '🔨',
        shuffle: '🔀',
        colorBomb: '🎨',
        extraMoves: '➕'
      };
      return `<span class="quest-reward-icon">${icons[reward.booster]} +${reward.amount}</span>`;
    } else if (reward.type === 'life') {
      return `<span class="quest-reward-icon">❤️ +${reward.amount}</span>`;
    }
    return '';
  }
};
