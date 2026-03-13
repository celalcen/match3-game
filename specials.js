// ===== SPECIAL PIECES =====

const SpecialManager = {
  // Utility functions for clearing
  addUniqueCell(cleared, clearedSet, r, c, board, rows, cols) {
    const key = `${r},${c}`;
    if (clearedSet.has(key)) return false;
    if (!BoardManager.inBounds(r, c, rows, cols)) return false;
    
    const cell = board[r][c];
    if (cell === null) return false;
    
    // Don't clear stone obstacles
    if (cell.type === "obstacle" && cell.obstacleType === "stone") return false;
    
    clearedSet.add(key);
    cleared.push({ r, c });
    return true;
  },

  clearRowToList(row, cleared, clearedSet, board, cols, rows) {
    for (let c = 0; c < cols; c++) {
      if (BoardManager.inBounds(row, c, rows, cols)) {
        const cell = board[row][c];
        if (cell !== null) {
          // Don't clear stone obstacles
          if (cell.type === "obstacle" && cell.obstacleType === "stone") continue;
          
          const key = `${row},${c}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            cleared.push({ r: row, c });
          }
        }
      }
    }
  },

  clearColToList(col, cleared, clearedSet, board, rows, cols) {
    for (let r = 0; r < rows; r++) {
      if (BoardManager.inBounds(r, col, rows, cols)) {
        const cell = board[r][col];
        if (cell !== null) {
          // Don't clear stone obstacles
          if (cell.type === "obstacle" && cell.obstacleType === "stone") continue;
          
          const key = `${r},${col}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            cleared.push({ r, c: col });
          }
        }
      }
    }
  },

  clearAreaToList(centerR, centerC, radius, cleared, clearedSet, board, rows, cols) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        this.addUniqueCell(cleared, clearedSet, centerR + dr, centerC + dc, board, rows, cols);
      }
    }
  },

  // Activate row bomb
  activateRowBomb(r, c, board, rows, cols) {
    const cleared = [];
    const clearedSet = new Set();
    this.clearRowToList(r, cleared, clearedSet, board, cols, rows);
    return cleared;
  },

  // Activate column bomb
  activateColumnBomb(r, c, board, rows, cols) {
    const cleared = [];
    const clearedSet = new Set();
    this.clearColToList(c, cleared, clearedSet, board, rows, cols);
    return cleared;
  },

  // Activate area bomb
  activateAreaBomb(r, c, board, rows, cols) {
    const cleared = [];
    const clearedSet = new Set();
    this.clearAreaToList(r, c, 1, cleared, clearedSet, board, rows, cols);
    return cleared;
  },

  // Activate color bomb
  activateColorBomb(r, c, board, rows, cols) {
    const cell = board[r][c];
    if (!cell) return [];
    
    const targetColor = cell.color;
    const cleared = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = board[row][col];
        // Clear all balls with same color (including the color bomb itself, but not other specials or stone obstacles)
        if (cell && cell.type === "ball" && cell.color === targetColor) {
          if (!cell.special || (row === r && col === c)) {
            cleared.push({ r: row, c: col });
          }
        }
      }
    }

    return cleared;
  },

  // Activate mega sphere
  activateMegaSphere(r, c, board, rows, cols) {
    const cleared = [];
    const clearedSet = new Set();
    this.clearAreaToList(r, c, 2, cleared, clearedSet, board, rows, cols);
    return cleared;
  },

  // Activate any special piece
  activateSpecialPiece(r, c, board, rows, cols) {
    const cell = board[r][c];
    if (!cell || !cell.special) return [];

    let cleared = [];
    switch (cell.special) {
      case "row":
        cleared = this.activateRowBomb(r, c, board, rows, cols);
        break;
      case "col":
        cleared = this.activateColumnBomb(r, c, board, rows, cols);
        break;
      case "bomb":
        cleared = this.activateAreaBomb(r, c, board, rows, cols);
        break;
      case "color":
        cleared = this.activateColorBomb(r, c, board, rows, cols);
        break;
      case "mega":
        cleared = this.activateMegaSphere(r, c, board, rows, cols);
        break;
    }

    // Process obstacles and clear cells
    const processedCleared = this.processObstacles(cleared, board);

    return processedCleared;
  },
  
  // Process obstacles in cleared cells (damage ice, collect bonus)
  processObstacles(cleared, board) {
    const finalCleared = [];
    
    for (const pos of cleared) {
      const cell = board[pos.r][pos.c];
      
      if (cell && cell.type === "obstacle") {
        if (cell.obstacleType === "ice") {
          // Damage ice
          cell.health--;
          if (cell.health <= 0) {
            // Ice destroyed
            board[pos.r][pos.c] = null;
            finalCleared.push(pos);
          }
          // If ice still has health, don't add to cleared
        } else if (cell.obstacleType === "bonus") {
          // Collect bonus
          board[pos.r][pos.c] = null;
          finalCleared.push(pos);
        }
        // Stone obstacles are not added to cleared (already filtered out)
      } else {
        // Regular ball - clear it
        board[pos.r][pos.c] = null;
        finalCleared.push(pos);
      }
    }
    
    return finalCleared;
  },

  // Get special piece name
  getSpecialName(type) {
    const names = {
      row: "Satır Bombası",
      col: "Sütun Bombası",
      bomb: "Alan Bombası",
      color: "Renk Bombası",
      mega: "Mega Küre"
    };
    return names[type] || "Özel Taş";
  }
};


// ===== SPECIAL COMBINATIONS =====

const CombinationManager = {
  // Detect special combination
  detectSpecialCombination(specials) {
    if (specials.length < 2) return null;
    
    if (specials.length >= 3) {
      return this.selectBestCombination(specials);
    }
    
    const type1 = specials[0].special;
    const type2 = specials[1].special;
    const types = [type1, type2].sort();
    
    return {
      type1: types[0],
      type2: types[1],
      pos1: specials[0],
      pos2: specials[1],
      remaining: []
    };
  },

  // Select best combination from 3+ specials
  selectBestCombination(specials) {
    const comboPriority = {
      "color+color": 1000,
      "color+mega": 800, "mega+color": 800,
      "mega+bomb": 800, "bomb+mega": 800,
      "mega+col": 800, "col+mega": 800,
      "mega+row": 800, "row+mega": 800,
      "bomb+color": 700, "color+bomb": 700,
      "col+color": 600, "color+col": 600,
      "color+row": 600, "row+color": 600,
      "bomb+bomb": 400,
      "bomb+col": 350, "col+bomb": 350,
      "bomb+row": 350, "row+bomb": 350,
      "col+row": 300, "row+col": 300,
      "col+col": 250, "row+row": 250
    };
    
    let bestCombo = null;
    let bestPriority = -1;
    let bestIndices = [-1, -1];
    
    for (let i = 0; i < specials.length; i++) {
      for (let j = i + 1; j < specials.length; j++) {
        const type1 = specials[i].special;
        const type2 = specials[j].special;
        const key = `${type1}+${type2}`;
        const priority = comboPriority[key] || 0;
        
        if (priority > bestPriority) {
          bestPriority = priority;
          const types = [type1, type2].sort();
          bestCombo = {
            type1: types[0],
            type2: types[1],
            pos1: specials[i],
            pos2: specials[j]
          };
          bestIndices = [i, j];
        }
      }
    }
    
    const remaining = [];
    for (let i = 0; i < specials.length; i++) {
      if (i !== bestIndices[0] && i !== bestIndices[1]) {
        remaining.push(specials[i]);
      }
    }
    
    bestCombo.remaining = remaining;
    return bestCombo;
  },

  // Execute combination
  executeCombo(combo, board, rows, cols) {
    const { type1, type2, pos1, pos2 } = combo;
    const key = `${type1}+${type2}`;
    
    const handler = this.comboHandlers[key] || this.comboDefault;
    return handler(pos1, pos2, board, rows, cols);
  },

  // Combo handlers
  comboHandlers: {
    "color+color": function(pos1, pos2, board, rows, cols) {
      const cleared = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = board[r][c];
          if (cell !== null) {
            // Don't clear stone obstacles
            if (cell.type === "obstacle" && cell.obstacleType === "stone") continue;
            cleared.push({ r, c });
          }
        }
      }
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Süper Patlama",
        bonus: 1000,
        sound: "combo"
      };
    },

    "color+row": function(pos1, pos2, board, rows, cols) {
      const colorPos = pos1.special === "color" ? pos1 : pos2;
      const rowPos = pos1.special === "row" ? pos1 : pos2;
      
      board[colorPos.r][colorPos.c] = { type: "ball", color: colorPos.color, special: "color" };
      const targetColor = board[colorPos.r][colorPos.c].color;
      
      const cleared = [];
      const clearedSet = new Set();
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = board[r][c];
          if (cell && cell.type === "ball" && cell.color === targetColor && !cell.special) {
            SpecialManager.clearRowToList(r, cleared, clearedSet, board, cols, rows);
          }
        }
      }
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Renk Satır Patlaması",
        bonus: 600,
        sound: "combo"
      };
    },

    "color+col": function(pos1, pos2, board, rows, cols) {
      const colorPos = pos1.special === "color" ? pos1 : pos2;
      const colPos = pos1.special === "col" ? pos1 : pos2;
      
      board[colorPos.r][colorPos.c] = { type: "ball", color: colorPos.color, special: "color" };
      const targetColor = board[colorPos.r][colorPos.c].color;
      
      const cleared = [];
      const clearedSet = new Set();
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = board[r][c];
          if (cell && cell.type === "ball" && cell.color === targetColor && !cell.special) {
            SpecialManager.clearColToList(c, cleared, clearedSet, board, rows, cols);
          }
        }
      }
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Renk Sütun Patlaması",
        bonus: 600,
        sound: "combo"
      };
    },

    "color+bomb": function(pos1, pos2, board, rows, cols) {
      const colorPos = pos1.special === "color" ? pos1 : pos2;
      
      board[colorPos.r][colorPos.c] = { type: "ball", color: colorPos.color, special: "color" };
      const targetColor = board[colorPos.r][colorPos.c].color;
      
      const cleared = [];
      const clearedSet = new Set();
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = board[r][c];
          if (cell && cell.type === "ball" && cell.color === targetColor && !cell.special) {
            SpecialManager.clearAreaToList(r, c, 1, cleared, clearedSet, board, rows, cols);
          }
        }
      }
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Renk Bomba Patlaması",
        bonus: 700,
        sound: "combo"
      };
    },

    "bomb+row": function(pos1, pos2, board, rows, cols) {
      const bombPos = pos1.special === "bomb" ? pos1 : pos2;
      const rowPos = pos1.special === "row" ? pos1 : pos2;
      
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearAreaToList(bombPos.r, bombPos.c, 1, cleared, clearedSet, board, rows, cols);
      SpecialManager.clearRowToList(rowPos.r, cleared, clearedSet, board, cols, rows);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Bomba + Satır",
        bonus: 350,
        sound: "areaBomb"
      };
    },

    "bomb+col": function(pos1, pos2, board, rows, cols) {
      const bombPos = pos1.special === "bomb" ? pos1 : pos2;
      const colPos = pos1.special === "col" ? pos1 : pos2;
      
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearAreaToList(bombPos.r, bombPos.c, 1, cleared, clearedSet, board, rows, cols);
      SpecialManager.clearColToList(colPos.c, cleared, clearedSet, board, rows, cols);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Bomba + Sütun",
        bonus: 350,
        sound: "areaBomb"
      };
    },

    "row+col": function(pos1, pos2, board, rows, cols) {
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearRowToList(pos1.r, cleared, clearedSet, board, cols, rows);
      SpecialManager.clearColToList(pos1.c, cleared, clearedSet, board, rows, cols);
      SpecialManager.clearRowToList(pos2.r, cleared, clearedSet, board, cols, rows);
      SpecialManager.clearColToList(pos2.c, cleared, clearedSet, board, rows, cols);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Çift Haç",
        bonus: 300,
        sound: "combo"
      };
    },

    "bomb+bomb": function(pos1, pos2, board, rows, cols) {
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearAreaToList(pos1.r, pos1.c, 2, cleared, clearedSet, board, rows, cols);
      SpecialManager.clearAreaToList(pos2.r, pos2.c, 2, cleared, clearedSet, board, rows, cols);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Çift Bomba",
        bonus: 400,
        sound: "areaBomb"
      };
    },

    "row+row": function(pos1, pos2, board, rows, cols) {
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearRowToList(pos1.r, cleared, clearedSet, board, cols, rows);
      SpecialManager.clearRowToList(pos2.r, cleared, clearedSet, board, cols, rows);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Çift Satır",
        bonus: 250,
        sound: "rowBomb"
      };
    },

    "col+col": function(pos1, pos2, board, rows, cols) {
      const cleared = [];
      const clearedSet = new Set();
      
      SpecialManager.clearColToList(pos1.c, cleared, clearedSet, board, rows, cols);
      SpecialManager.clearColToList(pos2.c, cleared, clearedSet, board, rows, cols);
      
      // Process obstacles
      const finalCleared = SpecialManager.processObstacles(cleared, board);
      
      return {
        cleared: finalCleared,
        comboName: "Çift Sütun",
        bonus: 250,
        sound: "columnBomb"
      };
    }
  },

  comboDefault: function(pos1, pos2, board, rows, cols) {
    board[pos1.r][pos1.c] = { type: "ball", color: pos1.color, special: pos1.special };
    const cleared1 = SpecialManager.activateSpecialPiece(pos1.r, pos1.c, board, rows, cols);
    
    board[pos2.r][pos2.c] = { type: "ball", color: pos2.color, special: pos2.special };
    const cleared2 = SpecialManager.activateSpecialPiece(pos2.r, pos2.c, board, rows, cols);
    
    return {
      cleared: [...cleared1, ...cleared2],
      comboName: "Çift Özel",
      bonus: 100,
      sound: "match"
    };
  }
};

// Add mega combinations
CombinationManager.comboHandlers["mega+row"] = 
CombinationManager.comboHandlers["mega+col"] = 
CombinationManager.comboHandlers["mega+bomb"] = 
CombinationManager.comboHandlers["mega+color"] = function(pos1, pos2, board, rows, cols) {
  const megaPos = pos1.special === "mega" ? pos1 : pos2;
  const otherPos = pos1.special === "mega" ? pos2 : pos1;
  
  const cleared = [];
  const clearedSet = new Set();
  
  SpecialManager.clearAreaToList(megaPos.r, megaPos.c, 2, cleared, clearedSet, board, rows, cols);
  
  if (otherPos.special === "row") {
    SpecialManager.clearRowToList(otherPos.r, cleared, clearedSet, board, cols, rows);
    for (let r = 0; r < rows; r++) {
      SpecialManager.clearRowToList(r, cleared, clearedSet, board, cols, rows);
    }
  } else if (otherPos.special === "col") {
    SpecialManager.clearColToList(otherPos.c, cleared, clearedSet, board, rows, cols);
    for (let c = 0; c < cols; c++) {
      SpecialManager.clearColToList(c, cleared, clearedSet, board, rows, cols);
    }
  } else if (otherPos.special === "bomb") {
    SpecialManager.clearAreaToList(otherPos.r, otherPos.c, 2, cleared, clearedSet, board, rows, cols);
  } else if (otherPos.special === "color") {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell !== null) {
          // Don't clear stone obstacles
          if (cell.type === "obstacle" && cell.obstacleType === "stone") continue;
          cleared.push({ r, c });
        }
      }
    }
  }
  
  // Process obstacles
  const finalCleared = SpecialManager.processObstacles(cleared, board);
  
  return {
    cleared: finalCleared,
    comboName: "Mega Kombinasyon",
    bonus: 800,
    sound: "combo"
  };
};
