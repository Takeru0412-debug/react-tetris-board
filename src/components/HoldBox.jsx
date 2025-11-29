import React from "react";
import { getRotatedShape } from "../utils/tetrisCore";

const HoldBox = ({ holdPiece, canHold }) => {
  const renderPiece = () => {
    if (!holdPiece) {
      return <div className="mini-board empty" />;
    }
    const shape = getRotatedShape(holdPiece, 0);
    return (
      <div className="mini-board">
        {shape.map((row, y) => (
          <div key={y} className="mini-row">
            {row.map((v, x) => (
              <div
                key={x}
                className={`mini-cell ${v ? "mini-cell-filled" : ""}`}
                style={v ? { "--cell-color": holdPiece.color } : {}}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="panel">
      <h3 className="panel-title">
        HOLD {canHold ? "" : <span className="hold-lock">×</span>}
      </h3>
      {renderPiece()}
    </div>
  );
};

export default HoldBox;
