import React from "react";

export default function MobileControls({
  onLeft,
  onRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
}) {
  return (
    <div className="mobile-controls">
      <button onClick={onLeft}>←</button>
      <button onClick={onRight}>→</button>
      <button onClick={onRotate}>⟳</button>
      <button onClick={onSoftDrop}>↓</button>
      <button onClick={onHardDrop}>⬇</button>
    </div>
  );
}
