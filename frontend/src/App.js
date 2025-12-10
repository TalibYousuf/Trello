import React from "react";
import Board from "./components/Board";
import "./App.css";

function App() {
  return (
    <div className="app" style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Trello-alike</h1>
      </header>
      <Board />
    </div>
  );
}

export default App;