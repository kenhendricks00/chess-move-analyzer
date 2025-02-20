let stockfish = new Worker("stockfish/stockfish.wasm.js");
const fenCache = new Map();

stockfish.postMessage("uci"); // Pre-initialize
stockfish.postMessage("ucinewgame");

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "analyzeBoard") {
    const cachedResult = fenCache.get(message.fen);
    if (cachedResult) {
      return Promise.resolve({ move: cachedResult });
    }

    return new Promise((resolve) => {
      stockfish.onmessage = (event) => {
        if (event.data.startsWith("bestmove")) {
          const bestMove = event.data.split(" ")[1];
          fenCache.set(message.fen, bestMove);
          resolve({ move: bestMove });
        }
      };

      const depth = message.fen.includes("rnbqkbnr") ? 14 : 18;
      stockfish.postMessage(`position fen ${message.fen}`);
      stockfish.postMessage(`go depth ${depth}`);
    });
  }
});
