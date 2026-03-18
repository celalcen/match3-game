// ===== SECRET CODE SYSTEM =====

const SecretCodeManager = {
  STORAGE_KEY: 'colorFusionSecretCode',
  
  // Google Play hediye kartı kodu (16 karakter - gerçek format)
  // Format: XXXX-XXXX-XXXX-XXXX (sayı ve harf kombinasyonu)
  SECRET_CODE: 'A7K9-M2P5-Q8R3-W6X4',
  
  // Initialize or load secret code progress
  init() {
    let data = this.loadProgress();
    if (!data) {
      data = this.createNewProgress();
    }
    return data;
  },

  // Create new progress
  createNewProgress() {
    const code = this.SECRET_CODE.replace(/-/g, ''); // Remove dashes for storage
    const shuffled = this.shuffleCode(code);
    
    const data = {
      code: this.SECRET_CODE,
      shuffledPositions: shuffled,
      collectedCharacters: {},
      collectedCount: 0,
      isCompleted: false,
      completedAt: null,
      winnerEmail: null
    };
    
    this.saveProgress(data);
    return data;
  },

  // Shuffle code characters to random levels (16 chars across 50 levels)
  shuffleCode(code) {
    const positions = {};
    const chars = code.split('');
    
    // Select 16 random levels from 1-50
    const allLevels = Array.from({length: 50}, (_, i) => i + 1);
    const selectedLevels = [];
    
    // Shuffle and pick 16 levels
    for (let i = allLevels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLevels[i], allLevels[j]] = [allLevels[j], allLevels[i]];
    }
    
    // Take first 16 levels
    for (let i = 0; i < 16; i++) {
      selectedLevels.push(allLevels[i]);
    }
    
    // Sort levels for better distribution
    selectedLevels.sort((a, b) => a - b);
    
    // Assign each character to a level
    chars.forEach((char, index) => {
      positions[selectedLevels[index]] = {
        char: char,
        index: index
      };
    });
    
    return positions;
  },

  // Load progress from localStorage
  loadProgress() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading secret code:', e);
      return null;
    }
  },

  // Save progress to localStorage
  saveProgress(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving secret code:', e);
    }
  },

  // Get character for current level
  getCharacterForLevel(level) {
    const data = this.loadProgress();
    if (!data || level > 50) return null;
    
    const charData = data.shuffledPositions[level];
    if (!charData) return null;
    
    // Check if already collected
    if (data.collectedCharacters[charData.index]) return null;
    
    return charData;
  },

  // Collect character for level
  collectCharacter(level) {
    const data = this.loadProgress();
    if (!data || data.isCompleted) return null;
    
    const charData = data.shuffledPositions[level];
    if (!charData) return null;
    
    // Mark as collected
    data.collectedCharacters[charData.index] = charData.char;
    data.collectedCount++;
    
    this.saveProgress(data);
    
    return {
      char: charData.char,
      index: charData.index,
      total: data.collectedCount,
      isComplete: data.collectedCount === this.SECRET_CODE.replace(/-/g, '').length
    };
  },

  // Get collected code string with placeholders
  getCollectedCodeString() {
    const data = this.loadProgress();
    if (!data) return '';
    
    const codeWithDashes = this.SECRET_CODE;
    const codeNoDashes = codeWithDashes.replace(/-/g, '');
    let result = '';
    let noDashIndex = 0;
    
    for (let i = 0; i < codeWithDashes.length; i++) {
      if (codeWithDashes[i] === '-') {
        result += '-';
      } else {
        if (data.collectedCharacters[noDashIndex]) {
          result += data.collectedCharacters[noDashIndex];
        } else {
          result += '?';
        }
        noDashIndex++;
      }
    }
    
    return result;
  },

  // Complete the code with email
  async completeCode(email) {
    const data = this.loadProgress();
    if (!data || data.isCompleted) return false;
    
    data.isCompleted = true;
    data.completedAt = new Date().toISOString();
    data.winnerEmail = email;
    
    this.saveProgress(data);
    
    // Send to Supabase if available
    if (typeof supabaseClient !== 'undefined') {
      try {
        await supabaseClient
          .from('secret_code_winners')
          .insert({
            email: email,
            code: this.SECRET_CODE,
            completed_at: data.completedAt,
            user_id: AuthManager?.currentUser?.id || null
          });
      } catch (e) {
        console.error('Error saving winner to database:', e);
      }
    }
    
    return true;
  },

  // Check if code is completed
  isCompleted() {
    const data = this.loadProgress();
    return data ? data.isCompleted : false;
  },

  // Get progress percentage
  getProgress() {
    const data = this.loadProgress();
    if (!data) return 0;
    
    const total = this.SECRET_CODE.replace(/-/g, '').length;
    return Math.round((data.collectedCount / total) * 100);
  },

  // Get levels that have characters
  getLevelsWithCharacters() {
    const data = this.loadProgress();
    if (!data) return [];
    
    return Object.keys(data.shuffledPositions).map(Number).sort((a, b) => a - b);
  },

  // Check if level has uncollected character
  hasUncollectedCharacter(level) {
    const data = this.loadProgress();
    if (!data) return false;
    
    const charData = data.shuffledPositions[level];
    if (!charData) return false;
    
    return !data.collectedCharacters[charData.index];
  }
};

// ===== SECRET CODE UI =====

const SecretCodeUI = {
  // Show secret code panel
  show() {
    const data = SecretCodeManager.loadProgress();
    if (!data) return;
    
    const codeString = SecretCodeManager.getCollectedCodeString();
    const progress = SecretCodeManager.getProgress();
    
    const modal = document.createElement('div');
    modal.className = 'secret-modal';
    modal.innerHTML = `
      <div class="secret-content">
        <div class="secret-header">
          <h2>🎁 Gizli Hediye Kodu</h2>
          <button class="secret-close" id="closeSecret">✕</button>
        </div>
        
        <div class="secret-body">
          <div class="secret-description">
            50 level boyunca 16 karakterlik Google Play hediye kartı kodunu topla!<br>
            Karakterler oyun sırasında rastgele belirir.
          </div>
          
          <div class="secret-progress">
            <div class="secret-progress-bar">
              <div class="secret-progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="secret-progress-text">${data.collectedCount} / 16 karakter toplandı</div>
          </div>
          
          <div class="secret-code-display">
            ${this.renderCodeDisplay(codeString)}
          </div>
          
          ${data.isCompleted ? `
            <div class="secret-completed">
              <div class="secret-completed-icon">🎉</div>
              <div class="secret-completed-title">Tebrikler!</div>
              <div class="secret-completed-text">Hediye kodunu tamamladınız!</div>
              <div class="secret-winner-email">📧 ${data.winnerEmail}</div>
              <div class="secret-completed-date">Tamamlanma: ${new Date(data.completedAt).toLocaleDateString('tr-TR')}</div>
            </div>
          ` : ''}
          
          <div class="secret-hint">
            💡 16 karakter 50 level arasında rastgele dağıtılmıştır.<br>
            Karakterler oyun sırasında tahtada belirir - hızlıca yakala!
          </div>
        </div>
        
        <div class="secret-footer">
          <button class="secret-btn" id="closeSecretBtn">Kapat</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('closeSecret').addEventListener('click', () => this.hide());
    document.getElementById('closeSecretBtn').addEventListener('click', () => this.hide());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });
    
    setTimeout(() => modal.classList.add('show'), 10);
  },

  // Hide modal
  hide() {
    const modal = document.querySelector('.secret-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  },

  // Render code display with characters
  renderCodeDisplay(codeString) {
    return codeString.split('').map(char => {
      if (char === '-') {
        return `<span class="code-dash">-</span>`;
      } else if (char === '?') {
        return `<span class="code-char unknown">?</span>`;
      } else {
        return `<span class="code-char collected">${char}</span>`;
      }
    }).join('');
  },

  // Show character collected notification
  showCharacterCollected(char, index, total, isComplete) {
    const notification = document.createElement('div');
    notification.className = 'secret-notification';
    notification.innerHTML = `
      <div class="secret-notif-icon">🎁</div>
      <div class="secret-notif-text">
        <div class="secret-notif-title">Gizli Karakter Bulundu!</div>
        <div class="secret-notif-char">${char}</div>
        <div class="secret-notif-progress">${total} / 16</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    if (isComplete) {
      setTimeout(() => this.showCompletionDialog(), 3500);
    }
  },

  // Show completion dialog with email input
  showCompletionDialog() {
    const modal = document.createElement('div');
    modal.className = 'secret-modal';
    modal.innerHTML = `
      <div class="secret-content completion-dialog">
        <div class="secret-header">
          <h2>🎉 Tebrikler!</h2>
        </div>
        
        <div class="secret-body">
          <div class="completion-icon">🏆</div>
          <div class="completion-title">Gizli Kodu Tamamladınız!</div>
          <div class="completion-text">
            Google Play hediye kartı kodunu kazandınız!<br>
            16 karakteri tamamladınız!<br>
            Lütfen e-posta adresinizi girin:
          </div>
          
          <div class="completion-code">
            ${SecretCodeManager.SECRET_CODE}
          </div>
          
          <div class="input-group">
            <label>E-posta Adresi</label>
            <input type="email" id="winnerEmail" placeholder="ornek@email.com" />
          </div>
        </div>
        
        <div class="secret-footer">
          <button class="secret-btn primary" id="submitEmail">Gönder</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('submitEmail').addEventListener('click', async () => {
      const email = document.getElementById('winnerEmail').value.trim();
      
      if (!email || !email.includes('@')) {
        UIManager.showToast('Lütfen geçerli bir e-posta adresi girin!', 2000);
        return;
      }
      
      await SecretCodeManager.completeCode(email);
      
      modal.remove();
      UIManager.showToast('🎉 Tebrikler! Hediye kodunuz kaydedildi!', 3000);
      
      // Show final success
      setTimeout(() => this.show(), 500);
    });
    
    setTimeout(() => modal.classList.add('show'), 10);
  }
};
