import React from "react";

export default function StatusBar({
  score,
  lines,
  level,
  combo,
  b2b,
  highScore,
}) {
  const comboText = combo < 0 ? "-" : combo;
  const b2bText = b2b ? "Yes" : "-";

  return (
    <div className="status-bar">
      <div>
        <div className="status-item-title">Score</div>
        <div className="status-item-value">{score}</div>
      </div>
      <div>
        <div className="status-item-title">Lines</div>
        <div className="status-item-value">{lines}</div>
      </div>
      <div>
        <div className="status-item-title">Level</div>
        <div className="status-item-value">{level}</div>
      </div>
      <div>
        <div className="status-item-title">Combo</div>
        <div className="status-item-value">{comboText}</div>
      </div>
      <div>
        <div className="status-item-title">B2B</div>
        <div className="status-item-value">{b2bText}</div>
      </div>
      <div>
        <div className="status-item-title">High</div>
        <div className="status-item-value">{highScore}</div>
      </div>
    </div>
  );
}
