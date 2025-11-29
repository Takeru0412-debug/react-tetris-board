import React from "react";
import { getRotatedShape } from "../utils/tetrisCore";

const MiniBoard = ({ piece }) => {
  if (!piece) return <div className="mini-board empty" />;

  const shape = getRotatedShape(piece, 0);
  return (
    <div className="mini-board">
      {shape.map((row, y) => (
        <div key={y} className="mini-row">
          {row.map((v, x) => (
            <div
              key={x}
              className={`mini-cell ${v ? "mini-cell-filled" : ""}`}
              style={v ? { "--cell-color": piece.color } : {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const NextQueue = ({ nextPieces }) => {
  return (
    <div className="panel">
      <h3 className="panel-title">NEXT</h3>
      <div className="next-list">
        {nextPieces.map((p, i) => (
          <MiniBoard key={i} piece={p} />
        ))}
      </div>
    </div>
  );
};

export default NextQueue;
