// ===== BOARD MANAGEMENT =====

// Board state and utilities
const BoardManager = {
  // Create empty board
  createBoard(rows, cols) {
    const board = [];
    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = null;
      }
    }
    return board;
  },

  // Check if position is valid
  inBounds(r, c, rows, cols) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  },

  // Get cell color
  getColor(cell) {
    return cell ? cell.color : null;
  },

  // Move ball from one position to another
  moveBall(board, from, to) {
    board[to.r][to.c] = board[from.r][from.c];
    board[from.r][from.c] = null;
  },

  // Get all empty cells (excluding obstacles)
  getEmptyCells(board, rows, cols) {
    const empty = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell === null) {
          empty.push({ r, c });
        }
      }
    }
    return empty;
  },

  // Count total balls on board (excluding obstacles)
  countBalls(board, rows, cols) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "ball") count++;
      }
    }
    return count;
  },

  // Get most common ball color on board
  getMostCommonBallColor(board, rows, cols) {
    const colorCount = {};
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "ball" && !cell.special) {
          colorCount[cell.color] = (colorCount[cell.color] || 0) + 1;
        }
      }
    }

    let maxColor = null;
    let maxCount = 0;
    for (const color in colorCount) {
      if (colorCount[color] > maxCount) {
        maxCount = colorCount[color];
        maxColor = color;
      }
    }
    return maxColor;
  },

  // Get all colors currently on board
  getBoardColors(board, rows, cols) {
    const colors = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell && cell.type === "ball" && !cell.special) {
          colors.add(cell.color);
        }
      }
    }
    return Array.from(colors);
  },

  // Find path using BFS (obstacles block movement)
  findPath(board, start, target, rows, cols) {
    const targetCell = board[target.r][target.c];
    if (targetCell !== null) return null;

    const queue = [{ r: start.r, c: start.c, path: [] }];
    const visited = new Set();
    visited.add(`${start.r},${start.c}`);

    const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.r === target.r && current.c === target.c) {
        return current.path;
      }

      for (const [dr, dc] of DIRS) {
        const nr = current.r + dr;
        const nc = current.c + dc;
        const key = `${nr},${nc}`;

        if (
          this.inBounds(nr, nc, rows, cols) &&
          !visited.has(key) &&
          board[nr][nc] === null
        ) {
          visited.add(key);
          queue.push({
            r: nr,
            c: nc,
            path: [...current.path, { r: nr, c: nc }]
          });
        }
      }
    }

    return null;
  }
};
