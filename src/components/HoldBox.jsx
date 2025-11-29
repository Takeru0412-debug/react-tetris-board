import React from "react";

export default function HoldBox({ holdType, tetrominoes, colors }) {
  const cells = [];

  if (holdType) {
    const shape = tetrominoes[holdType];
    shape.forEach((row, y) =>
      row.forEach((v, x) => {
        cells.push({ x, y, value: v ? holdType : 0 });
      })
    );
  } else {
    for (let i = 0; i < 16; i++) {
      cells.push({ x: i % 4, y: Math.floor(i / 4), value: 0 });
    }
  }

  return (
    <div className="side-panel">
      <div className="panel-title">HOLD</div>
      <div className="hold-grid">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className="cell"
            style={{
              backgroundColor: cell.value ? colors[cell.value] : "transparent",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, marginTop: 6, opacity: 0.65 }}>
        Key: C / Button: Hold
      </div>
    </div>
  );
}
