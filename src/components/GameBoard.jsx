import React from "react";

export default function GameBoard({
  displayBoard,
  ghostCells,
  colors,
  showDeadline = true,
  gameOver,
}) {
  return (
    <div className="game-board">
      {showDeadline && <div className="deadline" />}

      {displayBoard.map((row, y) =>
        row.map((value, x) => {
          const key = `${x}-${y}`;
          const isGhost = ghostCells.has(key) && value === 0;

          const style = {
            backgroundColor: isGhost ? "transparent" : colors[value],
            boxShadow:
              value !== 0
                ? "0 0 6px rgba(148, 163, 253, 0.55)"
                : "none",
            border: isGhost ? "2px dashed rgba(148, 163, 253, 0.8)" : "none",
          };

          const className =
            value === 0 && !isGhost ? "cell empty" : "cell";

          return (
            <div
              key={key}
              className={className + (isGhost ? " ghost" : "")}
              style={style}
            />
          );
        })
      )}

      {gameOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,23,42,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            GAME OVER
          </div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            Press Enter / Tap Restart
          </div>
        </div>
      )}
    </div>
  );
}
