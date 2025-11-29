import React from "react";

const MobileControls = ({ onLeft, onRight, onRotate, onSoftDrop, onHardDrop, onHold }) => {
  return (
    <div className="mobile-controls">
      <div className="mobile-row">
        <button className="control-btn" onClick={onHold}>
          HOLD
        </button>
        <button className="control-btn" onClick={onRotate}>
          ⟳
        </button>
        <button className="control-btn" onClick={onHardDrop}>
          ▼▼
        </button>
      </div>
      <div className="mobile-row">
        <button className="control-btn" onClick={onLeft}>
          ←
        </button>
        <button className="control-btn" onClick={onSoftDrop}>
          ▼
        </button>
        <button className="control-btn" onClick={onRight}>
          →
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
