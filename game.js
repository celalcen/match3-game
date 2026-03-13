// ===== MAIN GAME ORCHESTRATION =====

// Game configuration
const CONFIG = {
  ROWS: 7,
  COLS: 7,
  INITIAL_BALLS: 4,
  SPAWN_PER_TURN: 3,
  COLORS: ["red", "blue", "green", "yellow", "purple", "orange"],
  
  // Obstacle types
  OBSTACLES: {
    STONE: 'stone',      // Kırılamaz
    ICE: 'ice',          // 2 kez vurulmalı
    BONUS: 'bonus'       // Ekstra puan
  },
  
  // Dynamic difficulty based on level
  getInitialBalls(level) {
    // Level 1-3: 4 balls, Level 4-6: 5 balls, Level 7+: 6 balls
    return Math.min(4 + Math.floor((level - 1) / 3), 6);
  },
  
  getSpawnCount(level) {
    // Level 1-2: 3 balls, Level 3-5: 4 balls, Level 6+: 5 balls
    if (level <= 2) return 3;
    if (level <= 5) return 4;
    return 5;
  },
  
  getActiveColors(level) {
    // Level 1: 4 colors, Level 2-3: 5 colors, Level 4+: 6 colors
    if (level === 1) return this.COLORS.slice(0, 4);
    if (level <= 3) return this.COLORS.slice(0, 5);
    return this.COLORS;
  },
  
  // Obstacle configuration per level
  getObstacleCount(level) {
    // Level 1-2: 0, Level 3-4: 2, Level 5-6: 3, Level 7+: 4
    if (level <= 2) return 0;
    if (level <= 4) return 2;
    if (level <= 6) return 3;
    return 4;
  },
  
  getObstacleTypes(level) {
    // Level 3-4: Only ice, Level 5-6: Ice + bonus, Level 7+: All types
    if (level <= 4) return [this.OBSTACLES.ICE];
    if (level <= 6) return [this.OBSTACLES.ICE, this.OBSTACLES.BONUS];
    return [this.OBSTACLES.STONE, this.OBSTACLES.ICE, this.OBSTACLES.BONUS];
  }
};

// Game state
const GameState = {
  board: [],
  selectedCell: null,
  score: 0,
  isBusy: false,
  level: 1,
  nextBalls: [],
  sessionId: 0,
  comboCount: 0,

  reset() {
    this.board = BoardManager.createBoard(CONFIG.ROWS, CONFIG.COLS);
    this.selectedCell = null;
    this.score = 0;
    this.isBusy = false;
    this.level = 1;
    this.nextBalls = [];
    this.sessionId++;
    this.comboCount = 0;
  },

  incrementSession() {
    this.sessionId++;
  }
};

// Safe timeout wrapper
function safeTimeout(callback, delay) {
  const sessionId = GameState.sessionId;
  setTimeout(() => {
    if (sessionId !== GameState.sessionId) return;
    callback();
  }, delay);
}

// ===== GAME LOGIC =====

const Game = {
  // Initialize game
  init() {
    UIManager.init();
    
    GameState.reset();
    this.spawnInitialBalls();
    this.generateNextBalls();
    
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, GameState.selectedCell, 
      (r, c) => this.handleCellClick(r, c));
    UIManager.updateScore(GameState.score);
    UIManager.updateLevel(GameState.level);
    UIManager.updateNextBalls(GameState.nextBalls, CONFIG.COLORS);
    UIManager.updateLevelProgress(20); // Initial progress
    UIManager.setStatus("Oyun başladı!");

    // Setup restart button
    document.getElementById("restartBtn").addEventListener("click", () => this.restart());
    
    // Setup sound button - toggle volume slider
    const soundBtn = document.getElementById("soundBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeRange = document.getElementById("volumeRange");
    const volumeValue = document.getElementById("volumeValue");
    
    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = volumeSlider.style.display !== "none";
      volumeSlider.style.display = isVisible ? "none" : "flex";
    });
    
    // Close volume slider when clicking outside
    document.addEventListener("click", (e) => {
      if (!volumeSlider.contains(e.target) && e.target !== soundBtn) {
        volumeSlider.style.display = "none";
      }
    });
    
    // Volume range change
    volumeRange.addEventListener("input", (e) => {
      const volume = parseInt(e.target.value);
      volumeValue.textContent = `${volume}%`;
      
      // Update CSS variable for track fill
      volumeRange.style.setProperty('--volume-percent', `${volume}%`);
      
      // Update sound system volume
      soundSystem.setVolume(volume / 100);
      
      // Update icon based on volume
      if (volume === 0) {
        soundBtn.textContent = "🔇";
      } else if (volume < 50) {
        soundBtn.textContent = "🔉";
      } else {
        soundBtn.textContent = "🔊";
      }
    });
    
    // Setup music button
    document.getElementById("musicBtn").addEventListener("click", () => {
      const isEnabled = soundSystem.toggleMusic();
      document.getElementById("musicBtn").textContent = isEnabled ? "🎵" : "🎶";
    });
    
    // Setup leaderboard button
    document.getElementById("leaderboardBtn").addEventListener("click", () => {
      LeaderboardUI.show();
    });
    
    // Setup sign in button
    document.getElementById("signInBtn").addEventListener("click", async () => {
      await AuthManager.signInWithGoogle();
    });
    
    // Setup user profile click
    document.getElementById("userProfile").addEventListener("click", () => {
      AuthManager.showUserMenu();
    });
    
    // Start background music after first interaction
    document.addEventListener('click', () => {
      soundSystem.playBackgroundMusic(GameState.level);
    }, { once: true });
  },

  // Restart game
  restart() {
    GameState.reset();
    this.spawnInitialBalls();
    this.generateNextBalls();
    
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, GameState.selectedCell,
      (r, c) => this.handleCellClick(r, c));
    UIManager.updateScore(GameState.score);
    UIManager.updateLevel(GameState.level);
    UIManager.updateNextBalls(GameState.nextBalls, CONFIG.COLORS);
    UIManager.updateLevelProgress(20); // Initial progress
    UIManager.setStatus("Yeni oyun başladı!");
    
    // Restart music
    soundSystem.playBackgroundMusic(GameState.level);
  },

  // Handle cell click
  handleCellClick(r, c) {
    if (GameState.isBusy) return;

    const cell = GameState.board[r][c];

    // If clicking on a bonus obstacle, collect it
    if (cell && cell.type === "obstacle" && cell.obstacleType === CONFIG.OBSTACLES.BONUS) {
      GameState.board[r][c] = null;
      GameState.score += 100;
      soundSystem.playSpecialCreate();
      UIManager.setStatus("⭐ Bonus toplandı! +100");
      UIManager.updateScore(GameState.score);
      
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, GameState.selectedCell,
        (r, c) => this.handleCellClick(r, c));
      
      safeTimeout(() => {
        UIManager.addExplosionAnimation(r, c);
        UIManager.createParticles(r, c, "yellow", 10);
      }, 30);
      
      return;
    }

    // If clicking on a special piece, activate it
    if (cell && cell.special) {
      GameState.isBusy = true;
      soundSystem.playSelect();
      
      const cleared = SpecialManager.activateSpecialPiece(r, c, GameState.board, CONFIG.ROWS, CONFIG.COLS);
      
      if (cleared.length > 0) {
        const bonus = cleared.length * 10;
        GameState.score += bonus;
        
        UIManager.setStatus(`${SpecialManager.getSpecialName(cell.special)} aktif! ${cleared.length} top patladı!`);
        
        // Render first, then add effects
        UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
          (r, c) => this.handleCellClick(r, c));
        UIManager.updateScore(GameState.score);
        
        // Add visual effects after render
        safeTimeout(() => {
          for (const pos of cleared) {
            UIManager.addExplosionAnimation(pos.r, pos.c);
            UIManager.createParticles(pos.r, pos.c, cell.color, 8);
          }
        }, 30); // 50ms -> 30ms
        
        // Check for matches after special activation (no spawn)
        safeTimeout(() => {
          const matches = MatchDetector.findAllMatches(GameState.board, CONFIG.ROWS, CONFIG.COLS);
          
          if (matches.length > 0) {
            GameState.comboCount++;
            UIManager.showCombo(GameState.comboCount);
            this.handleMatchesWithSpecials(matches, null);
          } else {
            GameState.comboCount = 0;
            
            // Check for level completion
            const ballCount = BoardManager.countBalls(GameState.board, CONFIG.ROWS, CONFIG.COLS);
            if (ballCount <= 1) {
              this.completeLevel();
            } else {
              GameState.isBusy = false;
              UIManager.setStatus("Özel taş aktif edildi");
            }
          }
        }, 200); // Daha hızlı tepki
      } else {
        GameState.isBusy = false;
      }
      
      return;
    }

    // If no cell selected, select this one
    if (!GameState.selectedCell) {
      if (cell) {
        GameState.selectedCell = { r, c };
        soundSystem.playSelect();
        UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, GameState.selectedCell,
          (r, c) => this.handleCellClick(r, c));
      }
      return;
    }

    // If clicking same cell, deselect
    if (GameState.selectedCell.r === r && GameState.selectedCell.c === c) {
      GameState.selectedCell = null;
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
        (r, c) => this.handleCellClick(r, c));
      return;
    }

    // If clicking empty cell, try to move
    if (!cell) {
      this.attemptMove(GameState.selectedCell, { r, c });
    } else {
      // Select new cell
      GameState.selectedCell = { r, c };
      soundSystem.playSelect();
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, GameState.selectedCell,
        (r, c) => this.handleCellClick(r, c));
    }
  },

  // Attempt to move ball
  attemptMove(from, to) {
    const path = BoardManager.findPath(GameState.board, from, to, CONFIG.ROWS, CONFIG.COLS);
    
    if (!path) {
      UIManager.setStatus("Yol yok!");
      soundSystem.playError();
      return;
    }

    GameState.isBusy = true;
    GameState.selectedCell = null;

    UIManager.animateMove(from, to, path, GameState.board, CONFIG.ROWS, CONFIG.COLS, () => {
      BoardManager.moveBall(GameState.board, from, to);
      soundSystem.playMove();
      
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
        (r, c) => this.handleCellClick(r, c));
      
      // Immediately resolve turn (no delay)
      this.resolveTurn(to);
    });
  },

  // Resolve turn after move
  resolveTurn(movedTo) {
    const matches = MatchDetector.findAllMatches(GameState.board, CONFIG.ROWS, CONFIG.COLS);

    if (matches.length > 0) {
      GameState.comboCount++;
      UIManager.showCombo(GameState.comboCount);
      this.handleMatchesWithSpecials(matches, movedTo);
    } else {
      // No match after move - spawn new balls
      GameState.comboCount = 0;
      this.checkAndSpawn();
    }
  },

  // Handle matches with special piece creation
  handleMatchesWithSpecials(matches, movedTo) {
    const matchMap = MatchDetector.buildMatchMap(matches);
    
    let specialCreated = null;
    let specialType = null;

    // Try to create special at moved position
    if (movedTo) {
      const movedKey = `${movedTo.r},${movedTo.c}`;
      const movedCellInfo = matchMap.get(movedKey);

      if (movedCellInfo) {
        const maxLength = Math.max(
          movedCellInfo.horizontal,
          movedCellInfo.vertical,
          movedCellInfo.diagonalDown,
          movedCellInfo.diagonalUp
        );
        
        const matchCount = [
          movedCellInfo.horizontal >= 3 ? 1 : 0,
          movedCellInfo.vertical >= 3 ? 1 : 0,
          movedCellInfo.diagonalDown >= 3 ? 1 : 0,
          movedCellInfo.diagonalUp >= 3 ? 1 : 0,
          movedCellInfo.square === 4 ? 1 : 0
        ].reduce((a, b) => a + b, 0);
        
        if (maxLength >= 6) {
          specialCreated = { type: "mega", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "mega";
        } else if (movedCellInfo.square === 4) {
          specialCreated = { type: "bomb", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "bomb";
        } else if (matchCount >= 2) {
          specialCreated = { type: "bomb", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "bomb";
        } else if (maxLength >= 5) {
          specialCreated = { type: "color", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "color";
        } else if (movedCellInfo.horizontal === 4) {
          specialCreated = { type: "row", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "row";
        } else if (movedCellInfo.vertical === 4) {
          specialCreated = { type: "col", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "col";
        } else if (movedCellInfo.diagonalDown === 4 || movedCellInfo.diagonalUp === 4) {
          specialCreated = { type: "bomb", r: movedTo.r, c: movedTo.c, color: movedCellInfo.color };
          specialType = "bomb";
        }
      }
    }

    const cellsToClear = MatchDetector.getCellsToClear(matches);
    
    // Check for special pieces in cleared cells
    const specialsToActivate = [];
    for (const cell of cellsToClear) {
      const boardCell = GameState.board[cell.r][cell.c];
      if (boardCell && boardCell.special) {
        specialsToActivate.push({ 
          r: cell.r, 
          c: cell.c, 
          special: boardCell.special,
          color: boardCell.color 
        });
      }
    }

    // Check for combinations
    const combination = CombinationManager.detectSpecialCombination(specialsToActivate);

    const baseScore = cellsToClear.length * 10;
    soundSystem.playMatch();

    // Store colors before clearing
    const cellColors = new Map();
    for (const cell of cellsToClear) {
      const boardCell = GameState.board[cell.r][cell.c];
      if (boardCell) {
        cellColors.set(`${cell.r},${cell.c}`, boardCell.color);
      }
    }

    // Clear cells except where special will be placed
    this.clearCellsExcept(cellsToClear, specialCreated);

    // Create special piece
    if (specialCreated) {
      GameState.board[specialCreated.r][specialCreated.c] = {
        type: "ball",
        color: specialCreated.color,
        special: specialCreated.type
      };

      soundSystem.playSpecialCreate();
      
      let bonus = 50;
      if (specialType === "mega") bonus = 200;
      else if (specialType === "color") bonus = 150;
      else if (specialType === "bomb") bonus = 100;
      
      GameState.score += baseScore + bonus;
      UIManager.setStatus(`${cellsToClear.length} top temizlendi - ${SpecialManager.getSpecialName(specialCreated.type)} oluşturuldu! +${bonus} bonus`);
      
      // Add special creation animation
      UIManager.addSpecialCreationAnimation(specialCreated.r, specialCreated.c, CONFIG.COLS);
      
      safeTimeout(() => {
        UIManager.createParticles(specialCreated.r, specialCreated.c, specialCreated.color, 12);
      }, 100);
    } else {
      GameState.score += baseScore;
      UIManager.setStatus(`${cellsToClear.length} top temizlendi`);
    }
    
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
      (r, c) => this.handleCellClick(r, c));
    UIManager.updateScore(GameState.score);
    
    // Add particles for cleared cells
    safeTimeout(() => {
      for (const cell of cellsToClear) {
        const key = `${cell.r},${cell.c}`;
        const color = cellColors.get(key);
        if (color) {
          UIManager.addExplosionAnimation(cell.r, cell.c);
          UIManager.createParticles(cell.r, cell.c, color, 6);
        }
      }
    }, 50);
    
    // Handle combinations or activate specials
    safeTimeout(() => {
      if (combination) {
        this.handleSpecialCombination(combination);
      } else if (specialsToActivate.length > 0) {
        this.activateMatchedSpecials(specialsToActivate);
      } else {
        this.checkForMoreMatches();
      }
    }, 200);
  },

  // Handle special combination
  handleSpecialCombination(combo) {
    // Store colors before executing combo
    const cellColors = new Map();
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const cell = GameState.board[r][c];
        if (cell) {
          cellColors.set(`${r},${c}`, cell.color);
        }
      }
    }
    
    const result = CombinationManager.executeCombo(combo, GameState.board, CONFIG.ROWS, CONFIG.COLS);
    
    // Play sound
    if (result.sound === "combo") soundSystem.playCombo(5);
    else if (result.sound === "colorBomb") soundSystem.playColorBomb();
    else if (result.sound === "rowBomb") soundSystem.playRowBomb();
    else if (result.sound === "columnBomb") soundSystem.playColumnBomb();
    else if (result.sound === "areaBomb") soundSystem.playAreaBomb();
    else soundSystem.playMatch();
    
    // Set status
    let statusText = `💥 ${result.comboName}! ${result.cleared.length} top patladı! +${result.bonus}`;
    if (combo.remaining && combo.remaining.length > 0) {
      statusText += ` (+${combo.remaining.length} özel taş daha!)`;
    }
    UIManager.setStatus(statusText);
    
    // Update score
    GameState.score += result.bonus + result.cleared.length * 10;
    UIManager.updateScore(GameState.score);
    
    // Render first
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
      (r, c) => this.handleCellClick(r, c));
    
    // Then add effects with colors
    safeTimeout(() => {
      for (const pos of result.cleared) {
        const key = `${pos.r},${pos.c}`;
        const color = cellColors.get(key);
        if (color) {
          UIManager.addExplosionAnimation(pos.r, pos.c);
          UIManager.createParticles(pos.r, pos.c, color, 8);
        }
      }
    }, 50);
    
    // Activate remaining specials
    if (combo.remaining && combo.remaining.length > 0) {
      safeTimeout(() => {
        this.activateRemainingSpecials(combo.remaining);
      }, 400);
    } else {
      safeTimeout(() => {
        this.checkForMoreMatches();
      }, 200); // Hızlı tepki
    }
  },

  // Activate remaining specials from 3+ combination
  activateRemainingSpecials(remaining) {
    // Store colors before activation
    const cellColors = new Map();
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const cell = GameState.board[r][c];
        if (cell) {
          cellColors.set(`${r},${c}`, cell.color);
        }
      }
    }
    
    let totalCleared = 0;
    const allCleared = [];
    
    for (const special of remaining) {
      GameState.board[special.r][special.c] = {
        type: "ball",
        color: special.color,
        special: special.special
      };
      
      const cleared = SpecialManager.activateSpecialPiece(special.r, special.c, GameState.board, CONFIG.ROWS, CONFIG.COLS);
      totalCleared += cleared.length;
      allCleared.push(...cleared);
    }
    
    if (totalCleared > 0) {
      GameState.score += totalCleared * 10 + remaining.length * 50;
      UIManager.updateScore(GameState.score);
      UIManager.setStatus(`⚡ Zincirleme! +${remaining.length} özel taş daha patladı!`);
    }
    
    // Render first
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
      (r, c) => this.handleCellClick(r, c));
    
    // Then add effects with colors
    safeTimeout(() => {
      for (const special of remaining) {
        UIManager.addExplosionAnimation(special.r, special.c);
        UIManager.createParticles(special.r, special.c, special.color, 10);
      }
      
      // Add particles for all cleared cells
      for (const pos of allCleared) {
        const key = `${pos.r},${pos.c}`;
        const color = cellColors.get(key);
        if (color) {
          UIManager.createParticles(pos.r, pos.c, color, 6);
        }
      }
    }, 50);
    
    safeTimeout(() => {
      this.checkForMoreMatches();
    }, 500);
  },

  // Activate matched specials
  activateMatchedSpecials(specials) {
    // Store colors before activation
    const cellColors = new Map();
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const cell = GameState.board[r][c];
        if (cell) {
          cellColors.set(`${r},${c}`, cell.color);
        }
      }
    }
    
    const allCleared = [];
    
    for (const special of specials) {
      GameState.board[special.r][special.c] = {
        type: "ball",
        color: special.color,
        special: special.special
      };
      
      const cleared = SpecialManager.activateSpecialPiece(special.r, special.c, GameState.board, CONFIG.ROWS, CONFIG.COLS);
      
      if (cleared.length > 0) {
        GameState.score += cleared.length * 10;
        allCleared.push(...cleared);
      }
    }
    
    // Render first
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
      (r, c) => this.handleCellClick(r, c));
    
    // Then add effects with colors
    safeTimeout(() => {
      for (const special of specials) {
        UIManager.addExplosionAnimation(special.r, special.c);
        UIManager.createParticles(special.r, special.c, special.color, 8);
      }
      
      // Add particles for all cleared cells
      for (const pos of allCleared) {
        const key = `${pos.r},${pos.c}`;
        const color = cellColors.get(key);
        if (color) {
          UIManager.createParticles(pos.r, pos.c, color, 6);
        }
      }
    }, 50);
    
    UIManager.updateScore(GameState.score);
    
    safeTimeout(() => {
      this.checkForMoreMatches();
    }, 500);
  },

  // Check for more matches after clearing
  checkForMoreMatches() {
    const matches = MatchDetector.findAllMatches(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    
    if (matches.length > 0) {
      GameState.comboCount++;
      UIManager.showCombo(GameState.comboCount);
      this.handleMatchesWithSpecials(matches, null);
    } else {
      // No more matches - check for level completion
      GameState.comboCount = 0;
      
      const ballCount = BoardManager.countBalls(GameState.board, CONFIG.ROWS, CONFIG.COLS);
      if (ballCount <= 1) {
        this.completeLevel();
      } else {
        GameState.isBusy = false;
        UIManager.setStatus("Hamle tamamlandı");
      }
    }
  },

  // Clear cells except one
  clearCellsExcept(cells, keepCell) {
    for (const cell of cells) {
      if (keepCell && cell.r === keepCell.r && cell.c === keepCell.c) {
        continue;
      }
      GameState.board[cell.r][cell.c] = null;
    }
    
    // Damage adjacent ice obstacles
    this.damageAdjacentIce(cells);
  },
  
  // Damage ice obstacles adjacent to cleared cells
  damageAdjacentIce(clearedCells) {
    const damagedIce = new Set();
    const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const cell of clearedCells) {
      for (const [dr, dc] of DIRS) {
        const nr = cell.r + dr;
        const nc = cell.c + dc;
        
        if (BoardManager.inBounds(nr, nc, CONFIG.ROWS, CONFIG.COLS)) {
          const adjacentCell = GameState.board[nr][nc];
          const key = `${nr},${nc}`;
          
          if (adjacentCell && adjacentCell.type === "obstacle" && 
              adjacentCell.obstacleType === CONFIG.OBSTACLES.ICE && 
              !damagedIce.has(key)) {
            
            damagedIce.add(key);
            adjacentCell.health--;
            
            if (adjacentCell.health <= 0) {
              // Ice destroyed
              GameState.board[nr][nc] = null;
              GameState.score += 50;
              UIManager.setStatus("🧊 Buz kırıldı! +50");
              
              safeTimeout(() => {
                UIManager.addExplosionAnimation(nr, nc);
                UIManager.createParticles(nr, nc, "blue", 6);
              }, 50);
            }
          }
        }
      }
    }
  },

  // Check and spawn new balls
  checkAndSpawn() {
    const ballCount = BoardManager.countBalls(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    
    // Check level completion
    if (ballCount <= 1) {
      this.completeLevel();
      return;
    }
    
    // Spawn new balls (using current nextBalls) - count based on level
    const spawnCount = CONFIG.getSpawnCount(GameState.level);
    this.spawnNewBalls(spawnCount);
    
    // Generate next balls for NEXT turn (after spawning)
    this.generateNextBalls();
    UIManager.updateNextBalls(GameState.nextBalls, CONFIG.COLORS);
  },

  // Complete level
  completeLevel() {
    GameState.level++;
    GameState.score += 500;
    
    // Difficulty info
    const spawnCount = CONFIG.getSpawnCount(GameState.level);
    const colorCount = CONFIG.getActiveColors(GameState.level).length;
    const difficultyMsg = GameState.level > 1 ? ` | Zorluk: ${spawnCount} top, ${colorCount} renk` : '';
    
    UIManager.setStatus(`🎉 Seviye ${GameState.level - 1} tamamlandı! +500 bonus${difficultyMsg}`);
    UIManager.updateScore(GameState.score);
    UIManager.updateLevel(GameState.level);
    
    // Play level transition music
    soundSystem.playLevelTransition(GameState.level);
    
    // Show level complete overlay with fireworks
    UIManager.showLevelComplete(GameState.level - 1, GameState.score);
    
    safeTimeout(() => {
      // Clear the board for new level
      for (let r = 0; r < CONFIG.ROWS; r++) {
        for (let c = 0; c < CONFIG.COLS; c++) {
          GameState.board[r][c] = null;
        }
      }
      
      // Render empty board
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
        (r, c) => this.handleCellClick(r, c));
      
      // Spawn initial balls for new level
      this.spawnInitialBalls();
      
      // Spawn obstacles for new level
      this.spawnObstacles();
      
      // Generate next balls
      this.generateNextBalls();
      UIManager.updateNextBalls(GameState.nextBalls, CONFIG.COLORS);
      
      // Reset progress bar
      UIManager.updateLevelProgress(20);
      
      // Render with new balls and obstacles
      UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
        (r, c) => this.handleCellClick(r, c));
      
      GameState.isBusy = false;
      UIManager.setStatus(`Seviye ${GameState.level} başladı!`);
    }, 1500);
  },

  // Spawn new balls
  spawnNewBalls(count) {
    const emptyCells = BoardManager.getEmptyCells(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    
    if (emptyCells.length === 0) {
      this.gameOver();
      return;
    }

    const toSpawn = Math.min(count, emptyCells.length);
    const positions = [];

    for (let i = 0; i < toSpawn; i++) {
      const idx = Math.floor(Math.random() * emptyCells.length);
      const pos = emptyCells.splice(idx, 1)[0];
      
      // Use nextBalls if available, otherwise random color
      const color = GameState.nextBalls[i] || CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
      GameState.board[pos.r][pos.c] = { type: "ball", color };
      positions.push(pos);
    }
    
    UIManager.renderBoard(GameState.board, CONFIG.ROWS, CONFIG.COLS, null,
      (r, c) => this.handleCellClick(r, c));
    UIManager.addSpawnAnimations(positions);
    
    safeTimeout(() => {
      const matches = MatchDetector.findAllMatches(GameState.board, CONFIG.ROWS, CONFIG.COLS);
      
      if (matches.length > 0) {
        UIManager.setStatus("✨ Şanslı spawn!");
        soundSystem.playMatch();
        
        safeTimeout(() => {
          // Find best position for special piece creation (longest match)
          const matchMap = MatchDetector.buildMatchMap(matches);
          let bestPos = null;
          let bestScore = 0;
          
          for (const [key, info] of matchMap.entries()) {
            const [r, c] = key.split(',').map(Number);
            const score = Math.max(
              info.horizontal,
              info.vertical,
              info.diagonalDown,
              info.diagonalUp,
              info.square === 4 ? 4 : 0
            );
            
            if (score > bestScore) {
              bestScore = score;
              bestPos = { r, c };
            }
          }
          
          this.handleMatchesWithSpecials(matches, bestPos);
        }, 500);
      } else {
        const ballCount = BoardManager.countBalls(GameState.board, CONFIG.ROWS, CONFIG.COLS);
        const emptyCount = BoardManager.getEmptyCells(GameState.board, CONFIG.ROWS, CONFIG.COLS).length;
        
        if (emptyCount === 0) {
          this.gameOver();
        } else {
          UIManager.setStatus(`${toSpawn} yeni top eklendi`);
          
          // Update progress bar based on board fullness
          const totalCells = CONFIG.ROWS * CONFIG.COLS;
          const progress = (ballCount / totalCells) * 100;
          UIManager.updateLevelProgress(progress);
          
          GameState.isBusy = false;
        }
      }
    }, 1200); // 600ms -> 1200ms (3 top * 200ms + 600ms buffer)
  },

  // Spawn initial balls
  spawnInitialBalls() {
    const emptyCells = BoardManager.getEmptyCells(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    const activeColors = CONFIG.getActiveColors(GameState.level);
    const initialCount = CONFIG.getInitialBalls(GameState.level);
    
    for (let i = 0; i < initialCount; i++) {
      const idx = Math.floor(Math.random() * emptyCells.length);
      const pos = emptyCells.splice(idx, 1)[0];
      const color = activeColors[Math.floor(Math.random() * activeColors.length)];
      
      GameState.board[pos.r][pos.c] = { type: "ball", color };
    }
  },

  // Spawn obstacles
  spawnObstacles() {
    const obstacleCount = CONFIG.getObstacleCount(GameState.level);
    if (obstacleCount === 0) return;
    
    const emptyCells = BoardManager.getEmptyCells(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    const obstacleTypes = CONFIG.getObstacleTypes(GameState.level);
    
    for (let i = 0; i < obstacleCount && emptyCells.length > 0; i++) {
      const idx = Math.floor(Math.random() * emptyCells.length);
      const pos = emptyCells.splice(idx, 1)[0];
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      GameState.board[pos.r][pos.c] = {
        type: "obstacle",
        obstacleType: obstacleType,
        health: obstacleType === CONFIG.OBSTACLES.ICE ? 2 : 1
      };
    }
  },

  // Generate next balls
  generateNextBalls() {
    const ballCount = BoardManager.countBalls(GameState.board, CONFIG.ROWS, CONFIG.COLS);
    const activeColors = CONFIG.getActiveColors(GameState.level);
    const spawnCount = CONFIG.getSpawnCount(GameState.level);
    
    GameState.nextBalls = [];
    
    if (ballCount <= 4) {
      const boardColors = BoardManager.getBoardColors(GameState.board, CONFIG.ROWS, CONFIG.COLS);
      
      if (ballCount <= 2 && boardColors.length > 0) {
        // Son 2 top kaldığında aynı renk gelsin
        const commonColor = BoardManager.getMostCommonBallColor(GameState.board, CONFIG.ROWS, CONFIG.COLS);
        for (let i = 0; i < spawnCount; i++) {
          GameState.nextBalls.push(commonColor);
        }
      } else if (boardColors.length > 0) {
        // 3-4 top kaldığında tahtadaki renklerden gelsin
        for (let i = 0; i < spawnCount; i++) {
          const color = boardColors[Math.floor(Math.random() * boardColors.length)];
          GameState.nextBalls.push(color);
        }
      } else {
        for (let i = 0; i < spawnCount; i++) {
          const color = activeColors[Math.floor(Math.random() * activeColors.length)];
          GameState.nextBalls.push(color);
        }
      }
    } else {
      // Normal durum: aktif renklerden rastgele
      for (let i = 0; i < spawnCount; i++) {
        const color = activeColors[Math.floor(Math.random() * activeColors.length)];
        GameState.nextBalls.push(color);
      }
    }
  },

  // Game over
  async gameOver() {
    UIManager.setStatus("🎮 Oyunu Kaybettiniz! Yeniden başlatın.");
    GameState.isBusy = true;
    soundSystem.playError();
    
    // Check if score qualifies for leaderboard
    const qualifies = await LeaderboardManager.isHighScore(GameState.score);
    if (qualifies) {
      setTimeout(() => {
        LeaderboardUI.showNameInput(GameState.score, GameState.level, async (playerName) => {
          const result = await LeaderboardManager.addScore(playerName, GameState.score, GameState.level);
          
          if (result.isTopScore) {
            const cloudMsg = result.savedToCloud ? ' ☁️' : '';
            UIManager.showToast(`🏆 ${result.rank}. sırada! Tebrikler!${cloudMsg}`, 3000);
          }
          
          // Show leaderboard
          setTimeout(() => {
            LeaderboardUI.show();
          }, 500);
        });
      }, 1000);
    }
  }
};

// Start game when page loads
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
});
