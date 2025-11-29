import React from "react";
import { BOARD_WIDTH, BOARD_HEIGHT, getRotatedShape } from "../utils/tetrisCore";
import "../styles/game.css";

const GameBoard = ({ board, currentPiece, ghostY }) => {
  const renderCell = (cell, x, y) => {
    let type = cell?.type || null;
    let color = cell?.color || null;
    let isCurrent = false;
    let isGhost = false;

    if (currentPiece) {
      const shape = getRotatedShape(currentPiece, 0);
      for (let sy = 0; sy < shape.length; sy++) {
        for (let sx = 0; sx < shape[sy].length; sx++) {
          if (!shape[sy][sx]) continue;
          const px = currentPiece.x + sx;
          const py = currentPiece.y + sy;
          if (px === x && py === y) {
            type = currentPiece.type;
            color = currentPiece.color;
            isCurrent = true;
          }
        }
      }

      const ghostShape = getRotatedShape(currentPiece, 0);
      for (let sy = 0; sy < ghostShape.length; sy++) {
        for (let sx = 0; sx < ghostShape[sy].length; sx++) {
          if (!ghostShape[sy][sx]) continue;
          const px = currentPiece.x + sx;
          const py = ghostY + sy;
          if (px === x && py === y && !isCurrent && !cell) {
            type = currentPiece.type;
            color = currentPiece.color;
            isGhost = true;
          }
        }
      }
    }

    const classNames = ["cell"];
    if (type) classNames.push("cell-filled");
    if (isCurrent) classNames.push("cell-current");
    if (isGhost) classNames.push("cell-ghost");

    const style = color ? { "--cell-color": color } : {};

    return <div key={`${x}-${y}`} className={classNames.join(" ")} style={style} />;
  };

  return (
    <div className="board">
      {Array.from({ length: BOARD_HEIGHT }).map((_, y) => (
        <div key={y} className="board-row">
          {Array.from({ length: BOARD_WIDTH }).map((_, x) =>
            renderCell(board[y][x], x, y)
          )}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
