// 基本ロジック：ボード操作・衝突判定・ライン消去など

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// 空ボード作成
export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

// 4x4 マトリクスを回転
function rotateMatrix(matrix, rotation) {
  let result = matrix;
  for (let r = 0; r < rotation; r++) {
    result = result[0].map((_, i) => result.map(row => row[i]).reverse());
  }
  return result;
}

// ピース定義
const TETROMINOS = {
  I: {
    color: "#4dd0e1",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  O: {
    color: "#ffeb3b",
    shapes: [
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  T: {
    color: "#ba68c8",
    shapes: [
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  S: {
    color: "#81c784",
    shapes: [
      [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  Z: {
    color: "#e57373",
    shapes: [
      [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  J: {
    color: "#64b5f6",
    shapes: [
      [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  L: {
    color: "#ffb74d",
    shapes: [
      [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

export function createRandomPiece() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  const base = TETROMINOS[key];
  return {
    type: key,
    x: 3, // 中央あたり
    y: -1,
    rotation: 0,
    shape: base.shapes[0],
    color: base.color,
  };
}

export function cloneBoard(board) {
  return board.map(row => row.slice());
}

// 回転後の shape を取得
export function getRotatedShape(piece, rotationOffset = 0) {
  const base = TETROMINOS[piece.type].shapes[0];
  const rotation = (piece.rotation + rotationOffset + 4) % 4;
  return rotateMatrix(base, rotation);
}

// 衝突判定
export function canMove(board, piece, dx, dy, rotationOffset = 0) {
  const shape = getRotatedShape(piece, rotationOffset);
  const newX = piece.x + dx;
  const newY = piece.y + dy;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const bx = newX + x;
      const by = newY + y;
      if (by < 0) continue; // 上の見えない領域は OK
      if (bx < 0 || bx >= BOARD_WIDTH || by >= BOARD_HEIGHT) {
        return false;
      }
      if (board[by][bx]) {
        return false;
      }
    }
  }
  return true;
}

// ピースをボードに固定
export function mergePiece(board, piece) {
  const shape = getRotatedShape(piece, 0);
  const newBoard = cloneBoard(board);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const bx = piece.x + x;
      const by = piece.y + y;
      if (by < 0) continue;
      newBoard[by][bx] = {
        type: piece.type,
        color: piece.color,
      };
    }
  }
  return newBoard;
}

// 消えるラインを処理
export function clearLines(board) {
  const remaining = board.filter(
    row => row.some(cell => !cell)
  );
  const cleared = BOARD_HEIGHT - remaining.length;
  const newBoard = [
    ...Array.from({ length: cleared }, () =>
      Array.from({ length: BOARD_WIDTH }, () => null)
    ),
    ...remaining,
  ];
  return { board: newBoard, cleared };
}

// ゴースト位置
export function getGhostPieceY(board, piece) {
  let testY = piece.y;
  while (canMove(board, { ...piece, y: testY + 1 }, 0, 0, 0)) {
    testY++;
  }
  return testY;
}

// スコア計算
export function calcScore(currentScore, clearedLines, level) {
  if (clearedLines === 0) return currentScore;
  const base = [0, 40, 100, 300, 1200][clearedLines];
  return currentScore + base * (level + 1);
}

export function calcLevel(totalLines) {
  return Math.floor(totalLines / 10);
}

export function getDropInterval(level) {
  // レベルが上がるほど速く
  return Math.max(100, 1000 - level * 80);
}
