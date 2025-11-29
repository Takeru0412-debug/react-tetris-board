import React from "react";

export default function NextQueue({ queue, tetrominoes, colors }) {
  const shapes = queue.map((t) => tetrominoes[t]);

  return (
    <div className="side-panel">
      <div className="panel-title">NEXT × 3</div>
      <div className="next-queue-list">
        {shapes.map((shape, idx) => (
          <div key={idx} className="next-mini">
            {shape.map((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${idx}-${x}-${y}`}
                  className="cell"
                  style={{
                    backgroundColor: v ? colors[v] : "transparent",
                  }}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
