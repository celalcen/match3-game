// ===== UI MANAGEMENT =====

const UIManager = {
  // DOM references
  boardEl: null,
  scoreEl: null,
  statusEl: null,
  comboDisplayEl: null,
  comboCountEl: null,
  nextBallsEl: null,
  levelEl: null,

  // Helper to get cell element by position (cached via children index)
  getCellEl(r, c, cols) {
    if (!this.boardEl) return null;
    return this.boardEl.children[r * cols + c];
  },

  // Initialize UI
  init() {
    this.boardEl = document.getElementById("board");
    this.scoreEl = document.getElementById("score");
    this.statusEl = document.getElementById("status");
    this.comboDisplayEl = document.getElementById("comboDisplay");
    this.comboCountEl = document.getElementById("comboCount");
    this.nextBallsEl = document.getElementById("nextBalls");
    this.levelEl = document.getElementById("level");
    
    // Prevent zoom on mobile
    if (this.isMobile()) {
      this.preventZoom();
      this.setupMobileSidePanel();
    }
  },

  // Render the board
  renderBoard(board, rows, cols, selectedCell, onCellClick) {
    // If board is empty, create all cells
    if (this.boardEl.children.length === 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellDiv = document.createElement("div");
          cellDiv.className = "cell";
          cellDiv.dataset.row = r;
          cellDiv.dataset.col = c;
          cellDiv.addEventListener("click", () => onCellClick(r, c));
          this.boardEl.appendChild(cellDiv);
        }
      }
    }
    
    // Update existing cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        const cellDiv = this.boardEl.children[r * cols + c];
        
        // Clear previous content (but keep effects)
        const existingBall = cellDiv.querySelector(".ball");
        const existingObstacle = cellDiv.querySelector(".obstacle");
        if (existingBall) existingBall.remove();
        if (existingObstacle) existingObstacle.remove();

        // Add obstacle or ball
        if (cell) {
          if (cell.type === "obstacle") {
            const obstacle = document.createElement("div");
            obstacle.className = `obstacle obstacle-${cell.obstacleType}`;
            
            // Add health indicator for ice
            if (cell.obstacleType === "ice" && cell.health > 0) {
              obstacle.setAttribute("data-health", cell.health);
            }
            
            cellDiv.appendChild(obstacle);
          } else {
            // Regular ball
            const ball = document.createElement("div");
            ball.className = `ball ${cell.color}`;
            
            if (cell.special) {
              ball.classList.add("special", `special-${cell.special}`);
            }
            
            cellDiv.appendChild(ball);
          }
        }

        // Update selection
        if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
          cellDiv.classList.add("selected");
        } else {
          cellDiv.classList.remove("selected");
        }
      }
    }
  },

  // Update score display
  updateScore(score) {
    this.scoreEl.textContent = score;
  },

  // Update score-based level progress bar
  updateScoreProgress(totalScore, target) {
    const bar = document.getElementById('scoreProgressBar');
    const label = document.getElementById('scoreProgressLabel');
    // Previous level's target (what was needed to reach current level)
    const prevTarget = target - 500;
    const pct = Math.min(100, Math.max(0, ((totalScore - prevTarget) / 500) * 100));
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = Math.min(totalScore, target).toLocaleString('tr-TR') + ' / ' + target.toLocaleString('tr-TR');
  },

  // Update level display
  updateLevel(level) {
    const levelEl = document.getElementById("levelDisplay");
    if (levelEl) {
      levelEl.textContent = level;
    }
  },

  // Update moves display
  updateMoves(movesRemaining) {
    const movesDisplay = document.getElementById('movesDisplay');
    const movesValue = document.getElementById('movesValue');
    
    if (movesRemaining === null) {
      // Unlimited moves
      if (movesDisplay) movesDisplay.style.display = 'none';
    } else {
      // Limited moves
      if (movesDisplay) movesDisplay.style.display = 'flex';
      if (movesValue) {
        movesValue.textContent = movesRemaining;
        // Warning color if low
        if (movesRemaining <= 5) {
          movesValue.style.color = '#ff4d4f';
        } else if (movesRemaining <= 10) {
          movesValue.style.color = '#ffcc00';
        } else {
          movesValue.style.color = '#fff';
        }
      }
    }
  },

  // Update lives display
  updateLives(lives) {
    const livesValue = document.getElementById('livesValue');
    if (livesValue) {
      const hearts = '❤️'.repeat(Math.max(0, lives));
      livesValue.textContent = hearts || '💔';
      
      // Warning color if low
      if (lives <= 1) {
        livesValue.style.color = '#ff4d4f';
      } else if (lives <= 2) {
        livesValue.style.color = '#ffcc00';
      } else {
        livesValue.style.color = '#fff';
      }
    }
  },

  // Set status message
  setStatus(text) {
    // Status bar hidden in new design - could show as toast instead
    console.log('Status:', text);
  },

  // Show combo display
  showCombo(count) {
    if (count > 1) {
      this.comboCountEl.textContent = `${count}x`;
      this.comboDisplayEl.classList.add("show");
      
      // Add screen shake for combos 3+
      if (count >= 3) {
        this.addComboShake();
      }
      
      setTimeout(() => {
        this.comboDisplayEl.classList.remove("show");
      }, 1500);
    }
  },

  // Show floating score
  showFloatingScore(points, type, r, c, cols = 7) {
    const cellEl = this.getCellEl(r, c, cols);
    if (!cellEl) return;

    const floater = document.createElement("div");
    floater.className = `floating-score ${type}`;
    floater.textContent = `+${points}`;
    floater.style.left = "50%";
    floater.style.top = "50%";
    
    cellEl.style.position = "relative";
    cellEl.appendChild(floater);

    setTimeout(() => floater.remove(), 1000);
  },

  // Create particles
  createParticles(r, c, color, count = 8, cols = 7) {
    const cellEl = this.getCellEl(r, c, cols);
    if (!cellEl) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      const particleColor = this.getColorHex(color);
      particle.style.backgroundColor = particleColor;
      particle.style.boxShadow = `0 0 10px ${particleColor}`;
      
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      
      cellEl.appendChild(particle);
      
      setTimeout(() => particle.remove(), 800);
    }
  },

  // Add explosion animation
  addExplosionAnimation(r, c, cols = 7) {
    const cellEl = this.getCellEl(r, c, cols);
    if (cellEl) {
      cellEl.classList.add("exploding");
      setTimeout(() => cellEl.classList.remove("exploding"), 400);
    }
  },

  // Add area blast effect
  addAreaBlastEffect(r, c, radius, cols = 7) {
    const cellEl = this.getCellEl(r, c, cols);
    if (!cellEl) return;

    const blast = document.createElement("div");
    blast.className = "area-blast";
    blast.style.width = `${radius * 100}px`;
    blast.style.height = `${radius * 100}px`;
    
    cellEl.appendChild(blast);
    setTimeout(() => blast.remove(), 600);
  },

  // Add color blast effect
  addColorBlastEffect(positions, color, cols = 7) {
    positions.forEach(pos => {
      const cellEl = this.getCellEl(pos.r, pos.c, cols);
      if (!cellEl) return;

      const blast = document.createElement("div");
      blast.className = "color-blast";
      blast.style.backgroundColor = this.getColorHex(color);
      
      cellEl.appendChild(blast);
      setTimeout(() => blast.remove(), 500);
    });
  },

  // Update next balls display
  updateNextBalls(nextBalls, colors) {
    this.nextBallsEl.innerHTML = "";
    
    for (const color of nextBalls) {
      const ball = document.createElement("div");
      ball.className = `next-ball ${color}`;
      this.nextBallsEl.appendChild(ball);
    }
  },

  // Add spawn animations
  addSpawnAnimations(positions, cols = 7) {
    positions.forEach((pos, index) => {
      setTimeout(() => {
        const cellEl = this.getCellEl(pos.r, pos.c, cols);
        if (cellEl) {
          const ball = cellEl.querySelector(".ball");
          if (ball) {
            ball.classList.add("spawn");
            setTimeout(() => ball.classList.remove("spawn"), 800); // 400ms -> 800ms
          }
        }
      }, index * 200); // 100ms -> 200ms (toplar arası gecikme)
    });
  },

  // Animate move
  animateMove(from, to, path, board, rows, cols, callback) {
    const fromEl = this.getCellEl(from.r, from.c, cols);
    const ball = fromEl?.querySelector(".ball");
    
    if (!ball) {
      callback();
      return;
    }

    ball.classList.add("moving");
    
    let step = 0;
    const animate = () => {
      if (step >= path.length) {
        ball.classList.remove("moving");
        ball.style.transform = "";
        callback();
        return;
      }

      const pos = path[step];
      const targetEl = this.getCellEl(pos.r, pos.c, cols);
      
      if (targetEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = targetEl.getBoundingClientRect();
        
        ball.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;
      }

      step++;
      setTimeout(animate, 80); // Daha hızlı hareket
    };

    animate();
  },

  // Get color hex value
  getColorHex(color) {
    const colors = {
      red: "#e74c3c",
      blue: "#3498db",
      green: "#2ecc71",
      yellow: "#f1c40f",
      purple: "#9b59b6",
      orange: "#e67e22"
    };
    return colors[color] || "#95a5a6";
  },

  // Add special creation animation
  addSpecialCreationAnimation(r, c, cols = 7) {
    const cellEl = this.getCellEl(r, c, cols);
    if (cellEl) {
      cellEl.classList.add("special-creating");
      setTimeout(() => cellEl.classList.remove("special-creating"), 800);
    }
  },

  // Add combo screen shake
  addComboShake() {
    if (this.boardEl) {
      this.boardEl.classList.add("combo-shake");
      setTimeout(() => this.boardEl.classList.remove("combo-shake"), 400);
    }
  },

  // Create fireworks effect
  createFireworks(count = 20) {
    const boardRect = this.boardEl.getBoundingClientRect();
    const colors = ["#ff4d4f", "#4a90e2", "#34c759", "#ffcc00", "#af52de", "#e67e22"];
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const startX = boardRect.width / 2;
        const startY = boardRect.height / 2;
        const angle = (Math.PI * 2 * i) / count;
        const distance = 150 + Math.random() * 100;
        const fx = Math.cos(angle) * distance;
        const fy = Math.sin(angle) * distance;
        
        firework.style.left = `${startX}px`;
        firework.style.top = `${startY}px`;
        firework.style.setProperty("--fx", `${fx}px`);
        firework.style.setProperty("--fy", `${fy}px`);
        firework.style.animation = `firework ${0.8 + Math.random() * 0.4}s ease-out forwards`;
        
        this.boardEl.appendChild(firework);
        
        setTimeout(() => firework.remove(), 1200);
      }, i * 30);
    }
  },

  // Show level complete overlay
  showLevelComplete(level, score) {
    const overlay = document.createElement("div");
    overlay.className = "level-complete-overlay";
    overlay.innerHTML = `
      <div class="level-complete-content">
        <h2>🎉 Seviye ${level} Tamamlandı! 🎉</h2>
        <p>Skor: ${score}</p>
        <p style="font-size: 18px; margin-top: 20px; opacity: 0.9;">Yeni seviye yükleniyor...</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Create fireworks
    setTimeout(() => {
      this.createFireworks(30);
    }, 300);
    
    // Remove overlay after delay
    setTimeout(() => {
      overlay.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => overlay.remove(), 300);
    }, 2000);
  },

  // Show mobile toast notification
  showToast(message, duration = 2000) {
    const toast = document.createElement("div");
    toast.className = "mobile-toast";
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = "toastSlideUp 0.3s ease-out reverse";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Show message area
  showMessage(text, icon = "⚡", duration = 2000) {
    const messageArea = document.getElementById("messageArea");
    const messageText = document.getElementById("messageText");
    const messageIcon = messageArea?.querySelector(".message-icon");
    
    if (messageArea && messageText) {
      messageText.textContent = text;
      if (messageIcon) messageIcon.textContent = icon;
      messageArea.style.display = "flex";
      
      setTimeout(() => {
        messageArea.style.display = "none";
      }, duration);
    }
  },

  // Update level progress bar
  updateLevelProgress(progress) {
    const progressBar = document.getElementById("levelProgress");
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  },

  // Check if mobile device
  isMobile() {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Prevent zoom on double tap (mobile)
  preventZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  },

  // Setup mobile side panel toggle
  setupMobileSidePanel() {
    // Side panel removed - no longer needed
  }
};
