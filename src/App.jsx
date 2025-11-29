import React, { useState } from "react";
import "./styles/App.css";
import TitleScreen from "./screens/TitleScreen";
import GameScreen from "./screens/GameScreen";

const App = () => {
  const [scene, setScene] = useState("title");

  return (
    <div className="app-root">
      <div className="app-inner">
        {scene === "title" && <TitleScreen onStart={() => setScene("game")} />}
        {scene === "game" && (
          <GameScreen onBackToTitle={() => setScene("title")} />
        )}
      </div>
    </div>
  );
};

export default App;
