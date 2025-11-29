import React from "react";
import "./TitleScreen.css";


const TitleScreen = ({ onStart }) => {
  return (
    <div className="title-root">
      <div className="title-card">
        <div className="title-logo">TETRIS</div>
        <p className="title-sub">Modern React Edition</p>
        <button className="title-btn" onClick={onStart}>
          PLAY
        </button>
        <div className="title-info">
          <p>PC / スマホ対応</p>
          <p>矢印キー &amp; 画面下ボタンで操作</p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
