import React from "react";
import GameBoard from "../components/GameBoard";
import HoldBox from "../components/HoldBox";
import NextQueue from "../components/NextQueue";
import StatusBar from "../components/StatusBar";
import MobileControls from "../components/MobileControls";

import "../styles/game.css";

export default function GameScreen({
  board,
  piece,
  ghost,
  holdType,
  nextQueue,
  score,
  lines,
  level,
  combo,
  b2b,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onHold,
  onRestart,
  onPause,
  onBackToTitle
}) {

  return (
    <div className="game-layout">

      {/* ① ステータスバー（上部固定） */}
      <StatusBar
        score={score}
        lines={lines}
        level={level}
        combo={combo}
        b2b={b2b}
      />

      {/* ② ボード＋サイド（PC時のみ横並び） */}
      <div className="game-main">

        {/* ゲームボード */}
        <GameBoard board={board} piece={piece} ghost={ghost} />

        {/* HOLD & NEXT（PC） */}
        <div className="side-area pc-only">
          <HoldBox holdType={holdType} />
          <NextQueue nextQueue={nextQueue} />
        </div>
      </div>

      {/* ③ HOLD & NEXT（スマホ時） */}
      <div className="mobile-side mobile-only">
        <HoldBox holdType={holdType} />
        <NextQueue nextQueue={nextQueue} />
      </div>

      {/* ④ ボタン */}
      <div className="bottom-buttons">
        <button className="restart-btn" onClick={onRestart}>Restart</button>
        <button className="pause-btn" onClick={onPause}>Pause</button>
        <button className="title-btn" onClick={onBackToTitle}>Title</button>
      </div>

      {/* ⑤ スマホ操作パッド */}
      <MobileControls
        onLeft={onMoveLeft}
        onRight={onMoveRight}
        onRotate={onRotate}
        onSoftDrop={onSoftDrop}
        onHardDrop={onHardDrop}
      />

    </div>
  );
}
