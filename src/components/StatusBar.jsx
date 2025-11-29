import React from "react";

const StatusBar = ({ score, level, lines, isPaused, isGameOver }) => {
  return (
    <div className="panel status-panel">
      <h3 className="panel-title">STATUS</h3>
      <div className="status-item">
        <span>Score</span>
        <span>{score}</span>
      </div>
      <div className="status-item">
        <span>Level</span>
        <span>{level}</span>
      </div>
      <div className="status-item">
        <span>Lines</span>
        <span>{lines}</span>
      </div>
      {isGameOver && <div className="status-badge gameover">GAME OVER</div>}
      {isPaused && !isGameOver && (
        <div className="status-badge paused">PAUSED</div>
      )}
      <div className="status-help">
        <p>← → : 移動</p>
        <p>↑ or X : 回転</p>
        <p>↓ : ソフトドロップ</p>
        <p>Space : ハードドロップ</p>
        <p>C : HOLD / 入れ替え</p>
        <p>P : 一時停止</p>
      </div>
    </div>
  );
};

export default StatusBar;
