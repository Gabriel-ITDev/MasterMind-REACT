import React, { useState } from "react";

const App = () => {
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [secretCode, setSecretCode] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(["", "", "", ""]);
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const colors = ["vermelho", "azul", "verde", "amarelo", "laranja", "roxo"];

  // Handle name input
  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
    setError("");
  };

  // Start a new game
  const startGame = () => {
    if (!playerName.trim()) {
      setError("Name cannot be empty or just spaces!");
      return;
    }

    setPlayers((prev) => [...new Set([...prev, playerName])]);
    setPlayerName("");
    setGameStarted(true);
    setSecretCode(generateSecretCode());
    setGuesses([]);
    setFeedback([]);
    setGameWon(false);
    setAttemptsLeft(3); // Reset attempts for a new game
    setError("");
  };

  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setSecretCode([]);
    setGuesses([]);
    setFeedback([]);
    setCurrentGuess(["", "", "", ""]);
    setAttemptsLeft(3); // Reset attempts
    setGameWon(false);
    setError("");
  };

  // Generate a random secret code
  const generateSecretCode = () => {
    const code = [];
    for (let i = 0; i < 4; i++) {
      code.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return code;
  };

  // Handle player's guess input
  const handleColorSelect = (index, color) => {
    const newGuess = [...currentGuess];
    newGuess[index] = color;
    setCurrentGuess(newGuess);
  };

  // Submit the guess
  const submitGuess = () => {
    if (attemptsLeft <= 0) {
      setError("Não tens mais tentativas ! Game OVer !");
      return;
    }

    if (currentGuess.includes("")) {
      setError("Deves selecionar uma cor para todas as posições!");
      return;
    }

    const newFeedback = generateFeedback(currentGuess);
    setGuesses([...guesses, currentGuess]);
    setFeedback([...feedback, newFeedback]);

    if (newFeedback.correctPosition === 4) {
      setGameWon(true);
      calculateScore();
      setError("");
      return;
    }

    setAttemptsLeft(attemptsLeft - 1);

    if (attemptsLeft - 1 <= 0) {
      setError("Game Over! You've used all your attempts.");
    } else {
      setError("");
    }

    setCurrentGuess(["", "", "", ""]);
  };

  // Calculate score for the current player
  const calculateScore = () => {
    const points = Math.max(100 - guesses.length * 10, 0); // 100 - 10 points per guess
    setScores((prev) => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + points,
    }));
  };

  // Generate feedback for a guess
  const generateFeedback = (guess) => {
    let correctPosition = 0;
    let correctColor = 0;

    const secretCopy = [...secretCode];
    const guessCopy = [...guess];

    // Check for correct positions
    guessCopy.forEach((color, index) => {
      if (color === secretCopy[index]) {
        correctPosition++;
        secretCopy[index] = null;
        guessCopy[index] = null;
      }
    });

    // Check for correct colors in wrong positions
    guessCopy.forEach((color) => {
      if (color && secretCopy.includes(color)) {
        correctColor++;
        secretCopy[secretCopy.indexOf(color)] = null;
      }
    });

    return { correctPosition, correctColor };
  };

  return (
    <div style={styles.app}>
      <h1>Mastermind</h1>
      <div style={styles.container}>
        {!gameStarted && (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={handleNameChange}
              style={styles.input}
            />
            <div>
              <button
                onClick={startGame}
                disabled={!playerName.trim()}
                style={playerName.trim() ? styles.button : styles.buttonDisabled}
              >
                Novo Jogo
              </button>
              <button onClick={resetGame} style={styles.resetButton}>
                Reinicia o jogo
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
          </>
        )}

        {gameStarted && (
          <>
            <h2>Descobre a chave secreta</h2>
            <p>Tentativas restantes: {attemptsLeft}</p>
            <div style={styles.colors}>
              {currentGuess.map((color, index) => (
                <div key={index} style={styles.guessSlot}>
                  <div
                    style={{
                      ...styles.colorSlot,
                      backgroundColor: color || "#ccc",
                    }}
                  />
                  <select
                    style={styles.select}
                    value={color}
                    onChange={(e) =>
                      handleColorSelect(index, e.target.value)
                    }
                    disabled={attemptsLeft <= 0} // Bloquear seleção após Game Over
                  >
                    <option value="">Seleciona</option>
                    {colors.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={submitGuess}
              style={styles.button}
              disabled={attemptsLeft <= 0} // Bloquear envio após Game Over
            >
              Enviar a Chave
            </button>
            <button onClick={resetGame} style={styles.resetButton}>
              Novo Jogo
            </button>

            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.history}>
              <h3>A tua chave</h3>
              <ul>
                {guesses.map((guess, index) => (
                  <li key={index} style={styles.guessRow}>
                    {guess.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.colorSquare,
                          backgroundColor: color,
                        }}
                      />
                    ))}{" "}
                    - {feedback[index]?.correctPosition} correct position,{" "}
                    {feedback[index]?.correctColor} correct color
                  </li>
                ))}
              </ul>
            </div>
            {gameWon && (
              <div>
                <p style={styles.success}>Que maluco, Acertas-te!</p>
                <button onClick={startGame} style={styles.button}>
                  Jogar de novo!
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.history}>
        <h2>Histórico de jogadores</h2>
        {players.length > 0 ? (
          <ul>
            {players.map((player, index) => (
              <li key={index}>
                {player} - {scores[player] || 0} points
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há jogadores inscritos.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  app: { fontFamily: "Arial", padding: "20px", textAlign: "center" },
  guessRow: { display: "flex", marginBottom: "10px", alignItems: "center" },
  colorSquare: { width: "20px", height: "20px", margin: "0 5px" },
};

export default App;
