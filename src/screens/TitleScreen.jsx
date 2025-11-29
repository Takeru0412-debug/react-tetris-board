import React from "react";
import "../styles/game.css"; // 背景色だけ共有

export default function TitleScreen({ onStart, highScore }) {
  return (
    <div
      className="fade-in"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "90%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            marginBottom: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          React <span style={{ color: "#22c55e" }}>TETRIS</span>
        </h1>

        <p style={{ marginBottom: 24, opacity: 0.75 }}>
          Simple &amp; Stable Edition
        </p>

        <button
          onClick={onStart}
          style={{
            margin: "0 auto 16px",
            padding: "14px 36px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(90deg, #22c55e, #38bdf8)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow:
              "0 0 15px rgba(34,197,94,0.6), 0 0 25px rgba(56,189,248,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
          START
        </button>

        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
          High Score: {highScore}
        </div>

        <div style={{ fontSize: 11, opacity: 0.5 }}>
          © 2025 React Tetris
        </div>
      </div>
    </div>
  );
}
