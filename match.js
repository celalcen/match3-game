// ===== MATCH DETECTION =====

const MatchDetector = {
  // Find all matches on the board
  findAllMatches(board, rows, cols) {
    const matches = [];
    matches.push(...this.findHorizontalMatches(board, rows, cols));
    matches.push(...this.findVerticalMatches(board, rows, cols));
    matches.push(...this.findDiagonalMatches(board, "down", rows, cols));
    matches.push(...this.findDiagonalMatches(board, "up", rows, cols));
    matches.push(...this.findSquareMatches(board, rows, cols));
    return matches;
  },

  // Find 2x2 square matches
  findSquareMatches(board, rows, cols) {
    const matches = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const cell = board[r][c];
        if (!cell || cell.type !== "ball") continue;

        const color = cell.color;
        const cells = [
          board[r][c],
          board[r][c + 1],
          board[r + 1][c],
          board[r + 1][c + 1]
        ];

        if (
          cells.every(c => c && c.type === "ball" && c.color === color)
        ) {
          matches.push({
            type: "square",
            color: color,
            cells: [
              { r, c },
              { r, c: c + 1 },
              { r: r + 1, c },
              { r: r + 1, c: c + 1 }
            ]
          });
        }
      }
    }
    return matches;
  },

  // Find diagonal matches
  findDiagonalMatches(board, direction, rows, cols) {
    const matches = [];
    const rowDir = direction === "down" ? 1 : -1;
    const colDir = 1;

    // Start from top row
    for (let c = 0; c < cols; c++) {
      const startRow = direction === "down" ? 0 : rows - 1;
      const lineMatches = this.scanDiagonalLine(
        board, startRow, c, rowDir, colDir, rows, cols
      );
      matches.push(...lineMatches);
    }

    // Start from left column (skip corner)
    for (let r = 1; r < rows; r++) {
      const startRow = direction === "down" ? r : rows - 1 - r;
      const lineMatches = this.scanDiagonalLine(
        board, startRow, 0, rowDir, colDir, rows, cols
      );
      matches.push(...lineMatches);
    }

    return matches;
  },

  // Scan a single diagonal line
  scanDiagonalLine(board, startRow, startCol, rowDir, colDir, rows, cols) {
    const matches = [];
    let currentColor = null;
    let currentRun = [];

    let r = startRow;
    let c = startCol;

    while (r >= 0 && r < rows && c >= 0 && c < cols) {
      const cell = board[r][c];
      const color = (cell && cell.type === "ball") ? cell.color : null;

      if (color && color === currentColor) {
        currentRun.push({ r, c });
      } else {
        if (currentRun.length >= 3) {
          matches.push({
            type: rowDir === 1 ? "diagonalDown" : "diagonalUp",
            color: currentColor,
            cells: [...currentRun]
          });
        }
        currentColor = color;
        currentRun = color ? [{ r, c }] : [];
      }

      r += rowDir;
      c += colDir;
    }

    if (currentRun.length >= 3) {
      matches.push({
        type: rowDir === 1 ? "diagonalDown" : "diagonalUp",
        color: currentColor,
        cells: [...currentRun]
      });
    }

    return matches;
  },

  // Find horizontal matches
  findHorizontalMatches(board, rows, cols) {
    const matches = [];
    for (let r = 0; r < rows; r++) {
      let currentColor = null;
      let currentRun = [];

      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        const color = (cell && cell.type === "ball") ? cell.color : null;

        if (color && color === currentColor) {
          currentRun.push({ r, c });
        } else {
          if (currentRun.length >= 3) {
            matches.push({
              type: "horizontal",
              color: currentColor,
              cells: [...currentRun]
            });
          }
          currentColor = color;
          currentRun = color ? [{ r, c }] : [];
        }
      }

      if (currentRun.length >= 3) {
        matches.push({
          type: "horizontal",
          color: currentColor,
          cells: [...currentRun]
        });
      }
    }
    return matches;
  },

  // Find vertical matches
  findVerticalMatches(board, rows, cols) {
    const matches = [];
    for (let c = 0; c < cols; c++) {
      let currentColor = null;
      let currentRun = [];

      for (let r = 0; r < rows; r++) {
        const cell = board[r][c];
        const color = (cell && cell.type === "ball") ? cell.color : null;

        if (color && color === currentColor) {
          currentRun.push({ r, c });
        } else {
          if (currentRun.length >= 3) {
            matches.push({
              type: "vertical",
              color: currentColor,
              cells: [...currentRun]
            });
          }
          currentColor = color;
          currentRun = color ? [{ r, c }] : [];
        }
      }

      if (currentRun.length >= 3) {
        matches.push({
          type: "vertical",
          color: currentColor,
          cells: [...currentRun]
        });
      }
    }
    return matches;
  },

  // Build match map for special piece detection
  buildMatchMap(matches) {
    const matchMap = new Map();

    for (const match of matches) {
      for (const cell of match.cells) {
        const key = `${cell.r},${cell.c}`;
        if (!matchMap.has(key)) {
          matchMap.set(key, {
            r: cell.r,
            c: cell.c,
            color: match.color,
            horizontal: 0,
            vertical: 0,
            diagonalDown: 0,
            diagonalUp: 0,
            square: 0
          });
        }

        const info = matchMap.get(key);
        if (match.type === "horizontal") {
          info.horizontal = Math.max(info.horizontal, match.cells.length);
        } else if (match.type === "vertical") {
          info.vertical = Math.max(info.vertical, match.cells.length);
        } else if (match.type === "diagonalDown") {
          info.diagonalDown = Math.max(info.diagonalDown, match.cells.length);
        } else if (match.type === "diagonalUp") {
          info.diagonalUp = Math.max(info.diagonalUp, match.cells.length);
        } else if (match.type === "square") {
          info.square = 4;
        }
      }
    }

    return matchMap;
  },

  // Get all cells to clear from matches
  getCellsToClear(matches) {
    const cellSet = new Set();
    const cells = [];

    for (const match of matches) {
      for (const cell of match.cells) {
        const key = `${cell.r},${cell.c}`;
        if (!cellSet.has(key)) {
          cellSet.add(key);
          cells.push(cell);
        }
      }
    }

    return cells;
  }
};
