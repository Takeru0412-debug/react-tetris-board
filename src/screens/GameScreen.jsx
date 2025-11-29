import React, { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar.jsx";
import GameBoard from "../components/GameBoard.jsx";
import HoldBox from "../components/HoldBox.jsx";
import NextQueue from "../components/NextQueue.jsx";
import MobileControls from "../components/MobileControls.jsx";
import "../styles/game.css";

/* ====== 定数 ====== */
const ROWS = 20;
const COLS = 10;
const EMPTY = 0;

/* ブロック色（0 は空） */
const COLORS = [
  "#020617", // 0: empty
  "#38bdf8", // 1: I
  "#facc15", // 2: O
  "#f97316", // 3: T
  "#22c55e", // 4: S
  "#ef4444", // 5: Z
  "#6366f1", // 6: J
  "#e879f9", // 7: L
];

/* テトリミノ（4x4マトリクス） */
export const TETROMINOES = {
  1: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  2: [
    [0, 2, 2, 0],
    [0, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  3: [
    [0, 0, 0, 0],
    [3, 3, 3, 0],
    [0, 3, 0, 0],
    [0, 0, 0, 0],
  ],
  4: [
    [0, 0, 0, 0],
    [0, 4, 4, 0],
    [4, 4, 0, 0],
    [0, 0, 0, 0],
  ],
  5: [
    [0, 0, 0, 0],
    [5, 5, 0, 0],
    [0, 5, 5, 0],
    [0, 0, 0, 0],
  ],
  6: [
    [0, 0, 0, 0],
    [6, 6, 6, 0],
    [0, 0, 6, 0],
    [0, 0, 0, 0],
  ],
  7: [
    [0, 0, 0, 0],
    [7, 7, 7, 0],
    [7, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

/* ====== 効果音 / BGM（シンプル版） ====== */
const sfxMove = new Audio("/sounds/RollingBlockSound.mp3");
const sfxRotate = new Audio("/sounds/RollingBlockSound.mp3");
const sfxSoftDrop = new Audio("/sounds/RollingBlockSound.mp3");
const sfxHardDrop = new Audio("/sounds/RollingBlockSound.mp3");
const sfxClear = new Audio("/sounds/collect-points-190037.mp3");
const sfxLevelUp = new Audio("/sounds/next-level.mp3");
const sfxGameOver = new Audio("/sounds/game-over.mp3");
const sfxStart = new Audio("/sounds/PlayingTetris.mp3");

const bgmMain = new Audio("/sounds/PlayingTetris.mp3");
bgmMain.loop = true;
bgmMain.volume = 0.4;

/* ====== ヘルパー ====== */
function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}
function getRandomType() {
  return 1 + Math.floor(Math.random() * 7);
}
function createPiece(type) {
  return {
    type,
    shape: TETROMINOES[type].map((r) => [...r]),
    x: 3,
    y: -1,
  };
}
function rotateMatrix(m) {
  return m[0].map((_, i) => m.map((row) => row[i])).reverse();
}
function canMove(shape, x, y, board) {
  for (let dy = 0; dy < 4; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      if (!shape[dy][dx]) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== EMPTY) return false;
    }
  }
  return true;
}
function mergePiece(board, piece) {
  const newBoard = board.map((r) => [...r]);
  piece.shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (!v) return;
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        newBoard[y][x] = piece.type;
      }
    })
  );
  return newBoard;
}
function clearLines(board) {
  let cleared = 0;
  const next = [];
  for (let y = 0; y < ROWS; y++) {
    if (board[y].every((c) => c !== EMPTY)) {
      cleared++;
    } else {
      next.push(board[y]);
    }
  }
  while (next.length < ROWS) next.unshift(Array(COLS).fill(EMPTY));
  return { board: next, cleared };
}
function getPoints(lines) {
  return [0, 100, 300, 500, 800][lines] || 0;
}

/* ====== 本体 ====== */
export default function GameScreen({
  onBackToTitle,
  highScore,
  onUpdateHighScore,
}) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [piece, setPiece] = useState(null);
  const [queue, setQueue] = useState([
    getRandomType(),
    getRandomType(),
    getRandomType(),
  ]);
  const [holdType, setHoldType] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(-1);
  const [b2b, setB2b] = useState(false);

  const [speed, setSpeed] = useState(800);
  const [isRunning, setIsRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [tick, setTick] = useState(0);

  /* BGM */
  useEffect(() => {
    bgmMain.currentTime = 0;
    bgmMain.play().catch(() => {});
    return () => bgmMain.pause();
  }, []);

  /* 最初のピース配置 */
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 自動落下 */
  useEffect(() => {
    if (!isRunning || gameOver) return;
    const id = setInterval(() => setTick((t) => t + 1), speed);
    return () => clearInterval(id);
  }, [isRunning, gameOver, speed]);

  useEffect(() => {
    if (isRunning && !gameOver) {
      handleMoveDown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  /* キーボード操作 */
  useEffect(() => {
    const handler = (e) => {
      if (e.repeat) return;
      if (!isRunning && !gameOver && e.code === "Enter") {
        e.preventDefault();
        startGame();
        return;
      }
      if (gameOver && e.code === "Enter") {
        e.preventDefault();
        startGame();
        return;
      }
      if (!isRunning) return;

      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          handleMoveHorizontal(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMoveHorizontal(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleRotate();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleSoftDrop();
          break;
        case "Space":
        case "Spacebar":
          e.preventDefault();
          handleHardDrop();
          break;
        case "KeyC":
          e.preventDefault();
          handleHold();
          break;
        case "KeyP":
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ====== ゲーム制御 ====== */
  function startGame() {
    sfxStart.currentTime = 0;
    sfxStart.play().catch(() => {});

    const q =
      queue.length === 3
        ? queue
        : [getRandomType(), getRandomType(), getRandomType()];

    setBoard(createEmptyBoard());
    setPiece(createPiece(q[0]));
    setQueue([q[1], q[2], getRandomType()]);
    setHoldType(null);
    setCanHold(true);

    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(-1);
    setB2b(false);
    setSpeed(800);
    setGameOver(false);
    setIsRunning(true);
  }

  function restartGame() {
    startGame();
  }

  function togglePause() {
    if (!gameOver) setIsRunning((r) => !r);
  }

  /* ====== 移動系 ====== */
  function handleMoveHorizontal(dir) {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x + dir, y, board)) {
      sfxMove.currentTime = 0;
      sfxMove.play().catch(() => {});
      setPiece({ ...piece, x: x + dir });
    }
  }

  function handleRotate() {
    if (!piece) return;
    const rotated = rotateMatrix(piece.shape);
    if (canMove(rotated, piece.x, piece.y, board)) {
      sfxRotate.currentTime = 0;
      sfxRotate.play().catch(() => {});
      setPiece({ ...piece, shape: rotated });
    }
  }

  function handleSoftDrop() {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x, y + 1, board)) {
      sfxSoftDrop.currentTime = 0;
      sfxSoftDrop.play().catch(() => {});
      setPiece({ ...piece, y: y + 1 });
      setScore((s) => {
        const ns = s + 1;
        onUpdateHighScore(ns);
        return ns;
      });
    } else {
      lockPiece();
    }
  }

  function handleHardDrop() {
    if (!piece) return;
    const { shape, x } = piece;
    let dropY = piece.y;
    while (canMove(shape, x, dropY + 1, board)) dropY++;

    sfxHardDrop.currentTime = 0;
    sfxHardDrop.play().catch(() => {});

    const landed = { ...piece, y: dropY };
    setPiece(landed);
    lockPiece(landed);
  }

  function handleMoveDown() {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x, y + 1, board)) {
      setPiece({ ...piece, y: y + 1 });
    } else {
      lockPiece();
    }
  }

  /* ====== HOLD ====== */
  function handleHold() {
    if (!piece || !canHold) return;

    if (holdType === null) {
      const currentType = piece.type;
      const q =
        queue.length === 3
          ? queue
          : [getRandomType(), getRandomType(), getRandomType()];
      const newType = q[0];

      setHoldType(currentType);
      setPiece(createPiece(newType));
      setQueue([q[1], q[2], getRandomType()]);
    } else {
      const swap = holdType;
      setHoldType(piece.type);
      setPiece(createPiece(swap));
    }
    setCanHold(false);
  }

  /* ====== ロック & 行消し ====== */
  function lockPiece(overridePiece) {
    const p = overridePiece || piece;
    if (!p) return;

    const merged = mergePiece(board, p);
    const { board: clearedBoard, cleared } = clearLines(merged);

    if (cleared > 0) {
      sfxClear.currentTime = 0;
      sfxClear.play().catch(() => {});
      const base = getPoints(cleared);

      setScore((s) => {
        const ns = s + base * level;
        onUpdateHighScore(ns);
        return ns;
      });

      setCombo((c) => c + 1);
      setLines((prev) => {
        const total = prev + cleared;
        const newLevel = Math.floor(total / 10) + 1;
        if (newLevel !== level) {
          sfxLevelUp.currentTime = 0;
          sfxLevelUp.play().catch(() => {});
          setLevel(newLevel);
          setSpeed(800 - (newLevel - 1) * 50);
        }
        return total;
      });

      if (cleared >= 4) {
        setB2b(true);
      } else {
        setB2b(false);
      }
    } else {
      setCombo(-1);
    }

    setBoard(clearedBoard);
    setCanHold(true);

    const q =
      queue.length === 3
        ? queue
        : [getRandomType(), getRandomType(), getRandomType()];
    const nextType = q[0];
    const newQueue = [q[1], q[2], getRandomType()];
    const newPiece = createPiece(nextType);

    if (!canMove(newPiece.shape, newPiece.x, newPiece.y, clearedBoard)) {
      sfxGameOver.currentTime = 0;
      sfxGameOver.play().catch(() => {});
      bgmMain.pause();
      setGameOver(true);
      setIsRunning(false);
      onUpdateHighScore(score);
      return;
    }

    setPiece(newPiece);
    setQueue(newQueue);
  }

  /* ====== 描画用（ゴースト） ====== */
  const ghostCells = new Set();
  if (piece) {
    let gy = piece.y;
    while (canMove(piece.shape, piece.x, gy + 1, board)) gy++;
    piece.shape.forEach((row, dy) =>
      row.forEach((v, dx) => {
        if (!v) return;
        const x = piece.x + dx;
        const y = gy + dy;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          ghostCells.add(`${x}-${y}`);
        }
      })
    );
  }

  const displayBoard = board.map((r) => [...r]);
  if (piece) {
    piece.shape.forEach((row, dy) =>
      row.forEach((v, dx) => {
        if (!v) return;
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          displayBoard[y][x] = piece.type;
        }
      })
    );
  }

  /* ====== JSX ====== */
  return (
    <div className="game-layout fade-in">
      {/* ステータスバー */}
      <StatusBar
        score={score}
        lines={lines}
        level={level}
        combo={combo}
        b2b={b2b}
        highScore={highScore}
      />

      {/* 中央：ボード + サイド */}
      <div className="middle-row">
        <GameBoard
          displayBoard={displayBoard}
          ghostCells={ghostCells}
          colors={COLORS}
          showDeadline={!gameOver}
          gameOver={gameOver}
        />

        <div className="side-column">
          <HoldBox
            holdType={holdType}
            tetrominoes={TETROMINOES}
            colors={COLORS}
          />
          <NextQueue
            queue={queue}
            tetrominoes={TETROMINOES}
            colors={COLORS}
          />
        </div>
      </div>

      {/* 下部ボタン */}
      <div className="bottom-btn-row">
        <button className="btn-green" onClick={restartGame}>
          {isRunning ? "Restart" : "Restart"}
        </button>
        <button className="btn-orange" onClick={togglePause} disabled={gameOver}>
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button className="btn-gray" onClick={onBackToTitle}>
          Title
        </button>
      </div>

      {/* モバイル操作 */}
      <MobileControls
        onLeft={() => handleMoveHorizontal(-1)}
        onRight={() => handleMoveHorizontal(1)}
        onRotate={handleRotate}
        onSoftDrop={handleSoftDrop}
        onHardDrop={handleHardDrop}
      />
    </div>
  );
}
