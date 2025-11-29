import React, { useState } from "react";
import "./styles/App.css";
import "./styles/game.css";

import GameScreen from "./screens/GameScreen.jsx";
import TitleScreen from "./screens/TitleScreen.jsx";

export default function App() {
  const [screen, setScreen] = useState("title");
  const [highScore, setHighScore] = useState(() => {
    const v = Number(window.localStorage.getItem("tetrisHighScore"));
    return Number.isFinite(v) ? v : 0;
  });

  const handleUpdateHighScore = (score) => {
    setHighScore((prev) => {
      const next = score > prev ? score : prev;
      if (next !== prev) {
        window.localStorage.setItem("tetrisHighScore", String(next));
      }
      return next;
    });
  };

  return (
    <div className="app-root">
      {screen === "title" ? (
        <TitleScreen
          onStart={() => setScreen("game")}
          highScore={highScore}
        />
      ) : (
        <GameScreen
          onBackToTitle={() => setScreen("title")}
          highScore={highScore}
          onUpdateHighScore={handleUpdateHighScore}
        />
      )}
    </div>
  );
}
