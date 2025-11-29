import React, { useEffect, useState, useCallback } from "react";
import GameBoard from "../components/GameBoard";
import NextQueue from "../components/NextQueue";
import HoldBox from "../components/HoldBox";
import StatusBar from "../components/StatusBar";
import MobileControls from "../components/MobileControls";
import {
  createEmptyBoard,
  createRandomPiece,
  canMove,
  mergePiece,
  clearLines,
  getGhostPieceY,
  calcScore,
  calcLevel,
  getDropInterval,
} from "../utils/tetrisCore";
import "../styles/game.css";

const GameScreen = ({ onBackToTitle }) => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [current, setCurrent] = useState(createRandomPiece);
  const [nextQueue, setNextQueue] = useState([
    createRandomPiece(),
    createRandomPiece(),
    createRandomPiece(),
  ]);
  const [hold, setHold] = useState(null);
  const [canHold, setCanHold] = useState(true);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [dropInterval, setDropInterval] = useState(getDropInterval(0));

  const ghostY = current ? getGhostPieceY(board, current) : 0;

  const spawnNext = useCallback(
    (prevBoard) => {
      const [next, ...rest] = nextQueue;
      const newPiece = {
        ...next,
        x: 3,
        y: -1,
        rotation: 0,
      };
      const newQueue = [...rest, createRandomPiece()];
      setNextQueue(newQueue);
      setCanHold(true);

      if (!canMove(prevBoard, newPiece, 0, 0, 0)) {
        setIsGameOver(true);
        return { board: prevBoard, piece: newPiece };
      }
      return { board: prevBoard, piece: newPiece };
    },
    [nextQueue]
  );

  const resetGame = () => {
    const empty = createEmptyBoard();
    setBoard(empty);
    setCurrent(createRandomPiece());
    setNextQueue([createRandomPiece(), createRandomPiece(), createRandomPiece()]);
    setHold(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setLevel(0);
    setDropInterval(getDropInterval(0));
    setIsGameOver(false);
    setIsPaused(false);
  };

  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused) return;
    let piece = current;
    let y = piece.y;
    while (canMove(board, { ...piece, y: y + 1 }, 0, 0, 0)) {
      y++;
    }
    piece = { ...piece, y };
    let merged = mergePiece(board, piece);
    const { board: clearedBoard, cleared } = clearLines(merged);
    const newLines = lines + cleared;
    const newLevel = calcLevel(newLines);

    setBoard(clearedBoard);
    setLines(newLines);
    setScore((s) => calcScore(s, cleared, newLevel));
    setLevel(newLevel);
    setDropInterval(getDropInterval(newLevel));

    const { board: afterSpawn, piece: newPiece } = spawnNext(clearedBoard);
    setCurrent(newPiece);
    setBoard(afterSpawn);
  }, [board, current, isGameOver, isPaused, lines, spawnNext]);

  // 自然落下
  useEffect(() => {
    if (isGameOver || isPaused) return;
    const id = setInterval(() => {
      setCurrent((piece) => {
        if (!piece) return piece;
        setBoard((prevBoard) => {
          if (canMove(prevBoard, piece, 0, 1, 0)) {
            return prevBoard;
          } else {
            let merged = mergePiece(prevBoard, piece);
            const { board: clearedBoard, cleared } = clearLines(merged);
            const newLines = lines + cleared;
            const newLevel = calcLevel(newLines);

            setLines(newLines);
            setScore((s) => calcScore(s, cleared, newLevel));
            setLevel(newLevel);
            setDropInterval(getDropInterval(newLevel));

            const { board: afterSpawn, piece: newPiece } = spawnNext(clearedBoard);
            setCurrent(newPiece);
            return afterSpawn;
          }
        });
        return piece;
      });
    }, dropInterval);

    return () => clearInterval(id);
  }, [dropInterval, isGameOver, isPaused, lines, spawnNext]);

  // キー操作
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) {
        if (e.code === "Enter") resetGame();
        return;
      }

      if (e.code === "KeyP") {
        setIsPaused((p) => !p);
        return;
      }

      if (isPaused) return;

      if (!current) return;

      if (e.code === "ArrowLeft") {
        if (canMove(board, current, -1, 0, 0)) {
          setCurrent((p) => ({ ...p, x: p.x - 1 }));
        }
      } else if (e.code === "ArrowRight") {
        if (canMove(board, current, 1, 0, 0)) {
          setCurrent((p) => ({ ...p, x: p.x + 1 }));
        }
      } else if (e.code === "ArrowDown") {
        if (canMove(board, current, 0, 1, 0)) {
          setCurrent((p) => ({ ...p, y: p.y + 1 }));
        }
      } else if (e.code === "ArrowUp" || e.code === "KeyX") {
        if (canMove(board, current, 0, 0, 1)) {
          setCurrent((p) => ({
            ...p,
            rotation: (p.rotation + 1) % 4,
            shape: p.shape,
          }));
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        hardDrop();
      } else if (e.code === "KeyC") {
        handleHold();
      } else if (e.code === "KeyR") {
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleHold = useCallback(() => {
    if (!canHold || !current || isGameOver || isPaused) return;

    if (!hold) {
      // 新しく HOLD に入れる
      setHold({ ...current, x: 0, y: 0 });
      const [next, ...rest] = nextQueue;
      const newPiece = { ...next, x: 3, y: -1, rotation: 0 };
      setCurrent(newPiece);
      setNextQueue([...rest, createRandomPiece()]);
    } else {
      // HOLD と入れ替え
      const swapped = {
        ...hold,
        x: 3,
        y: -1,
        rotation: 0,
      };
      setHold({ ...current, x: 0, y: 0 });
      setCurrent(swapped);
    }
    setCanHold(false);
  }, [canHold, current, hold, isGameOver, isPaused, nextQueue]);

  // モバイル用操作ラッパー
  const moveLeft = () => {
    if (canMove(board, current, -1, 0, 0)) {
      setCurrent((p) => ({ ...p, x: p.x - 1 }));
    }
  };
  const moveRight = () => {
    if (canMove(board, current, 1, 0, 0)) {
      setCurrent((p) => ({ ...p, x: p.x + 1 }));
    }
  };
  const rotate = () => {
    if (canMove(board, current, 0, 0, 1)) {
      setCurrent((p) => ({ ...p, rotation: (p.rotation + 1) % 4 }));
    }
  };
  const softDrop = () => {
    if (canMove(board, current, 0, 1, 0)) {
      setCurrent((p) => ({ ...p, y: p.y + 1 }));
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-top-bar">
        <button className="top-btn" onClick={onBackToTitle}>
          ◀ TITLE
        </button>
        <button className="top-btn" onClick={resetGame}>
          RESTART
        </button>
        <button
          className="top-btn"
          onClick={() => setIsPaused((p) => !p)}
          disabled={isGameOver}
        >
          {isPaused ? "RESUME" : "PAUSE"}
        </button>
      </div>
      <div className="game-layout">
        <div className="side-column">
          <HoldBox holdPiece={hold} canHold={canHold} />
          <StatusBar
            score={score}
            level={level}
            lines={lines}
            isPaused={isPaused}
            isGameOver={isGameOver}
          />
        </div>

        <GameBoard board={board} currentPiece={current} ghostY={ghostY} />

        <div className="side-column">
          <NextQueue nextPieces={nextQueue} />
        </div>
      </div>

      <MobileControls
        onLeft={moveLeft}
        onRight={moveRight}
        onRotate={rotate}
        onSoftDrop={softDrop}
        onHardDrop={hardDrop}
        onHold={handleHold}
      />
    </div>
  );
};

export default GameScreen;
