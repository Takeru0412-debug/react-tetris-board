import React, { useState, useEffect } from "react";
import "./App.css"

/* ====== 定数 ====== */
const ROWS = 20;
const COLS = 10;
const EMPTY = 0;

/* ====== 色 ====== */
const COLORS = [
  "#020617",
  "#0ea5e9",
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#a855f7",
  "#eab308",
];

/* ====== テトリミノ ====== */
const TETROMINOES = {
  1: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  2: [[0,2,2,0],[0,2,2,0],[0,0,0,0],[0,0,0,0]],
  3: [[0,0,0,0],[3,3,3,0],[0,3,0,0],[0,0,0,0]],
  4: [[0,0,0,0],[0,4,4,0],[4,4,0,0],[0,0,0,0]],
  5: [[0,0,0,0],[5,5,0,0],[0,5,5,0],[0,0,0,0]],
  6: [[0,0,0,0],[6,6,6,0],[0,0,6,0],[0,0,0,0]],
  7: [[0,0,0,0],[7,7,7,0],[7,0,0,0],[0,0,0,0]],
};

/* ====== 効果音 & BGM ====== */
const sfxRotate   = new Audio("/sounds/RollingBlockSound.mp3");
const sfxMove     = new Audio("/sounds/RollingBlockSound.mp3");
const sfxSoftDrop = new Audio("/sounds/RollingBlockSound.mp3");
const sfxHardDrop = new Audio("/sounds/RollingBlockSound.mp3");

const sfxClear    = new Audio("/sounds/collect-points-190037.mp3");
const sfxLevelUp  = new Audio("/sounds/next-level.mp3");
const sfxGameOver = new Audio("/sounds/game-over.mp3");
const sfxStart    = new Audio("/sounds/PlayingTetris.mp3");

const bgmTitle = new Audio("/sounds/title.mp3");
const bgmMain  = new Audio("/sounds/PlayingTetris.mp3");
bgmTitle.loop = true;
bgmMain.loop  = true;
bgmTitle.volume = 0.4;
bgmMain.volume  = 0.4;
bgmTitle.addEventListener("ended", () => { bgmTitle.currentTime = 0; bgmTitle.play(); });
bgmMain.addEventListener("ended",  () => { bgmMain.currentTime  = 0; bgmMain.play(); });

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
    shape: TETROMINOES[type].map(r => [...r]),
    x: 3,
    y: -1,
  };
}
function rotateMatrix(m) {
  return m[0].map((_, i) => m.map(row => row[i])).reverse();
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
  const newBoard = board.map(r => [...r]);
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
    if (board[y].every(c => c !== EMPTY)) {
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

/* ====== コンポーネント本体 ====== */
export default function App() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [piece, setPiece] = useState(null);
  const [queue, setQueue] = useState([getRandomType(), getRandomType(), getRandomType()]);
  const [holdType, setHoldType] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(-1);
  const [b2b, setB2b] = useState(false);

  const [speed, setSpeed] = useState(800);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [tick, setTick] = useState(0);

  /* ====== タイトルBGM ====== */
  useEffect(() => {
    const auto = async () => {
      try { await bgmTitle.play(); } catch {}
    };
    bgmTitle.currentTime = 0;
    auto();
  }, []);

  /* ====== 自動落下 ====== */
  useEffect(() => {
    if (!isRunning || gameOver) return;
    const id = setInterval(() => setTick(t => t + 1), speed);
    return () => clearInterval(id);
  }, [isRunning, gameOver, speed]);

  useEffect(() => {
    if (isRunning && !gameOver) moveDown();
  }, [tick]);

  /* ====== キーボード操作 ====== */
  useEffect(() => {
    const handler = (e) => {
      if (!isRunning && !gameOver && e.code === "Enter") return startGame();
      if (gameOver && e.code === "Enter") return startGame();
      if (!isRunning) return;

      switch (e.code) {
        case "ArrowLeft":  e.preventDefault(); moveHorizontal(-1); break;
        case "ArrowRight": e.preventDefault(); moveHorizontal(1);  break;
        case "ArrowUp":    e.preventDefault(); rotatePiece();      break;
        case "ArrowDown":  e.preventDefault(); softDrop();         break;
        case "Space":      e.preventDefault(); hardDrop();         break;
        case "KeyC":       holdPiece();                            break;
        case "KeyP":       togglePause();                          break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ====== ゲーム開始 ====== */
  function startGame() {
    bgmTitle.pause();
    bgmMain.currentTime = 0;
    bgmMain.play().catch(()=>{});

    sfxStart.currentTime = 0;
    sfxStart.play().catch(()=>{});

    const q = queue.length === 3 ? queue : [getRandomType(), getRandomType(), getRandomType()];
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

  function togglePause() {
    if (!gameOver) setIsRunning(r => !r);
  }

  /* ====== 移動系 ====== */
  function moveHorizontal(dir) {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x + dir, y, board)) {
      sfxMove.currentTime = 0; sfxMove.play().catch(()=>{});
      setPiece({ ...piece, x: x + dir });
    }
  }

  function rotatePiece() {
    if (!piece) return;
    const rotated = rotateMatrix(piece.shape);
    if (canMove(rotated, piece.x, piece.y, board)) {
      sfxRotate.currentTime = 0; sfxRotate.play().catch(()=>{});
      setPiece({ ...piece, shape: rotated });
    }
  }

  function softDrop() {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x, y + 1, board)) {
      sfxSoftDrop.currentTime = 0; sfxSoftDrop.play().catch(()=>{});
      setPiece({ ...piece, y: y + 1 });
      setScore(s => s + 1);
    } else {
      lockPiece();
    }
  }

  function hardDrop() {
    if (!piece) return;
    const { shape, x } = piece;
    let dropY = piece.y;
    while (canMove(shape, x, dropY + 1, board)) dropY++;

    sfxHardDrop.currentTime = 0; sfxHardDrop.play().catch(()=>{});

    const landed = { ...piece, y: dropY };
    setPiece(landed);
    lockPiece(landed);
  }

  /* ← ここがなかったのでエラーになっていた！ */
  function moveDown() {
    if (!piece) return;
    const { shape, x, y } = piece;
    if (canMove(shape, x, y + 1, board)) {
      setPiece({ ...piece, y: y + 1 });
    } else {
      lockPiece();
    }
  }

  /* ====== HOLD ====== */
  function holdPiece() {
    if (!piece || !canHold) return;

    if (holdType === null) {
      // 初回 HOLD → 今のピースを HOLD, NEXT から新ピース
      const currentType = piece.type;
      const q = queue.length === 3 ? queue : [getRandomType(), getRandomType(), getRandomType()];
      const newPieceType = q[0];
      setHoldType(currentType);
      setPiece(createPiece(newPieceType));
      setQueue([q[1], q[2], getRandomType()]);
    } else {
      // 2回目以降 → HOLD と今のピースを入れ替え
      const swap = holdType;
      setHoldType(piece.type);
      setPiece(createPiece(swap));
    }
    setCanHold(false);
  }

  /* ====== ロック & ライン消去 ====== */
  function lockPiece(override) {
    const p = override || piece;
    if (!p) return;

    const merged = mergePiece(board, p);
    const { board: clearedBoard, cleared } = clearLines(merged);

    if (cleared > 0) {
      sfxClear.currentTime = 0; sfxClear.play().catch(()=>{});
      const base = getPoints(cleared);
      setScore(s => s + base * level);

      setCombo(c => c + 1);
      setLines(prev => {
        const total = prev + cleared;
        const newLv = Math.floor(total / 10) + 1;
        if (newLv !== level) {
          sfxLevelUp.currentTime = 0; sfxLevelUp.play().catch(()=>{});
          setLevel(newLv);
          setSpeed(800 - (newLv - 1) * 50);
        }
        return total;
      });

      if (cleared === 4) {
        setB2b(prev => !prev ? true : true); // 簡易B2B
      } else {
        setB2b(false);
      }
    } else {
      setCombo(-1);
    }

    setBoard(clearedBoard);
    setCanHold(true);

    // NEXT キューから次のピース
    const q = queue.length === 3 ? queue : [getRandomType(), getRandomType(), getRandomType()];
    const nextType = q[0];
    const newQueue = [q[1], q[2], getRandomType()];
    const newPiece = createPiece(nextType);

    if (!canMove(newPiece.shape, newPiece.x, newPiece.y, clearedBoard)) {
      sfxGameOver.currentTime = 0; sfxGameOver.play().catch(()=>{});
      bgmMain.pause();
      setGameOver(true);
      setIsRunning(false);
      return;
    }

    setPiece(newPiece);
    setQueue(newQueue);
  }

  /* ====== 描画用ボード & ゴースト ====== */
  const ghostCells = new Set();
  let ghostColor = null;
  if (piece) {
    let gy = piece.y;
    while (canMove(piece.shape, piece.x, gy + 1, board)) gy++;
    ghostColor = COLORS[piece.type];

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

  const displayBoard = board.map(r => [...r]);
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

  const nextShapes = queue.map(t => TETROMINOES[t]);
  const comboText = combo < 0 ? "-" : combo;
  const b2bText = b2b ? "Yes" : "-";

  /* ====== JSX ====== */
  return (
    <div className="tetris-root">
      <h1 className="title">React Tetris</h1>

      {/* 上部ステータスバー */}
      <div className="top-status">
        <div className="stat-item"><span>Score</span>{score}</div>
        <div className="stat-item"><span>Lines</span>{lines}</div>
        <div className="stat-item"><span>Level</span>{level}</div>
        <div className="stat-item"><span>Combo</span>{comboText}</div>
        <div className="stat-item"><span>B2B</span>{b2bText}</div>
      </div>

      {/* 中央：ボード + サイド */}
      <div className="middle-panel">
        <div className="board">
          {displayBoard.map((row, y) =>
            row.map((c, x) => {
              const key = `${x}-${y}`;
              const isGhost = ghostCells.has(key) && c === EMPTY;
              const style = {
                backgroundColor: isGhost ? "transparent" : COLORS[c],
                border: isGhost ? `1px dashed ${ghostColor}` : "none",
              };
              return <div key={key} className="cell" style={style} />;
            })
          )}

          {gameOver && (
            <div className="overlay">
              <div className="overlay-content">
                GAME OVER
                <div className="small-text">Press Enter / Tap Start</div>
              </div>
            </div>
          )}
        </div>

        <div className="side-stack">
          {/* HOLD */}
          <div className="hold-card">
            <div className="panel-title">HOLD</div>
            <div className="hold-grid">
              {holdType
                ? TETROMINOES[holdType].map((row, y) =>
                    row.map((v, x) => (
                      <div
                        key={`h-${x}-${y}`}
                        className="next-cell"
                        style={{ backgroundColor: v ? COLORS[holdType] : "transparent" }}
                      />
                    ))
                  )
                : Array.from({ length: 16 }).map((_, i) => (
                    <div key={`h-empty-${i}`} className="next-cell" style={{ backgroundColor: "transparent" }} />
                  ))}
            </div>
          </div>

          {/* NEXT ×3 */}
          <div className="next3-card">
            <div className="panel-title">NEXT × 3</div>
            <div className="next3-list">
              {nextShapes.map((shape, idx) => (
                <div key={idx} className="next-mini">
                  {shape.map((row, y) =>
                    row.map((v, x) => (
                      <div
                        key={`${idx}-${x}-${y}`}
                        className="next-cell"
                        style={{ backgroundColor: v ? COLORS[v] : "transparent" }}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="bottom-buttons">
        <button onClick={startGame}>{isRunning ? "Restart" : "Start"}</button>
        <button onClick={togglePause} disabled={gameOver}>
          {isRunning ? "Pause" : "Resume"}
        </button>
      </div>


      {/* モバイル操作ボタン（CSSでスマホ時だけ表示） */}
      <div className="mobile-controls">
        <button onClick={() => moveHorizontal(-1)}>←</button>
        <button onClick={() => moveHorizontal(1)}>→</button>
        <button onClick={rotatePiece}>↻</button>
        <button onClick={softDrop}>↓</button>
        <button onClick={hardDrop}>⬇</button>
      </div>
    </div>
  );
}
