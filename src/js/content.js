let isAutoAnalyzeEnabled = false;
let moveObserver = null;
let previousHighlights = [];

// Toast system setup
const toastContainer = document.createElement("div");
toastContainer.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  width: 300px;
  pointer-events: none;
`;
document.body.appendChild(toastContainer);

// Move display toast
const moveDisplay = document.createElement("div");
moveDisplay.style.cssText = `
  background-color: #262421;
  color: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
  display: none;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #404040;
`;
toastContainer.appendChild(moveDisplay);

// Loading indicator toast
const loadingToast = document.createElement("div");
loadingToast.style.cssText = `
  background-color: #262421;
  color: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
  display: none;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #404040;
`;

// Add loading spinner
const spinner = document.createElement("div");
spinner.style.cssText = `
  width: 16px;
  height: 16px;
  border: 2px solid #404040;
  border-top: 2px solid #7fa650;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

// Add spinner animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

const loadingText = document.createElement("span");
loadingText.textContent = "Analyzing position...";
loadingToast.appendChild(spinner);
loadingToast.appendChild(loadingText);
toastContainer.appendChild(loadingToast);

function showLoading() {
  if (!isAutoAnalyzeEnabled) return;
  loadingToast.style.display = "flex";
  loadingToast.style.animation = "slideIn 0.3s ease-out forwards";
  moveDisplay.style.display = "none";
}

function hideLoading() {
  loadingToast.style.animation = "slideOut 0.3s ease-in forwards";
  setTimeout(() => {
    loadingToast.style.display = "none";
  }, 300);
}

function showBestMove(move) {
  if (!isAutoAnalyzeEnabled) return;

  // Check for promotion move
  if (move.length === 5) {
    let promotionPiece = "";
    switch (move[4].toLowerCase()) {
      case "q":
        promotionPiece = "Queen";
        break;
      case "r":
        promotionPiece = "Rook";
        break;
      case "b":
        promotionPiece = "Bishop";
        break;
      case "n":
        promotionPiece = "Knight";
        break;
    }

    moveDisplay.innerHTML = `
      <div style="margin-bottom: 8px;">
        <span style="color: #7fa650; font-weight: 600;">Best move:</span>
        <span style="font-weight: 500;"> ${move.substring(0, 4)}</span>
      </div>
      <div style="font-size: 13px; color: #a8a8a8;">
        <span style="color: #f1c40f;">★</span> Promote to ${promotionPiece}
      </div>
    `;
  } else {
    moveDisplay.innerHTML = `
      <span style="color: #7fa650; font-weight: 600;">Best move:</span>
      <span style="font-weight: 500;"> ${move}</span>
    `;
  }

  moveDisplay.style.display = "block";
  moveDisplay.style.animation = "slideIn 0.3s ease-out forwards";
  hideLoading();
  highlightBestMove(move);
}

function hideBestMove() {
  moveDisplay.style.animation = "slideOut 0.3s ease-in forwards";
  setTimeout(() => {
    moveDisplay.style.display = "none";
  }, 300);
  hideLoading();
  clearHighlights();
}

function showLoading() {
  if (!isAutoAnalyzeEnabled) return;
  loadingToast.style.display = "flex";
  moveDisplay.style.display = "none";
}

function hideLoading() {
  loadingToast.style.display = "none";
}

function highlightBestMove(bestMove) {
  // Remove existing highlights
  previousHighlights.forEach((highlight) => highlight.remove());
  previousHighlights = [];

  if (!bestMove || bestMove.length < 4) {
    console.error("Invalid best move:", bestMove);
    return;
  }

  // Map chess notation to numeric positions (e.g., a1 -> 11)
  const charToNum = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
  const fromSquare = `${charToNum[bestMove[0]]}${bestMove[1]}`;
  const toSquare = `${charToNum[bestMove[2]]}${bestMove[3]}`;

  // Create and style the initial highlight
  const initialHighlight = document.createElement("div");
  initialHighlight.className = `highlight cheat-highlight square-${fromSquare}`;
  initialHighlight.style.cssText =
    "background:red; opacity:0.5; z-index: 0; position: absolute;";

  // Create and style the final highlight
  const finalHighlight = document.createElement("div");
  finalHighlight.className = `highlight cheat-highlight square-${toSquare}`;
  finalHighlight.style.cssText =
    "background:red; opacity:0.5; z-index: 0; position: absolute;";

  // Append highlights to the chessboard
  const chessboard = document.querySelector("wc-chess-board");
  if (chessboard) {
    chessboard.appendChild(initialHighlight);
    chessboard.appendChild(finalHighlight);
    previousHighlights.push(initialHighlight, finalHighlight);
  } else {
    console.error("Chessboard not found for highlighting.");
  }
}

function clearHighlights() {
  previousHighlights.forEach((highlight) => highlight.remove());
  previousHighlights = [];
}

function showBestMove(move) {
  if (!isAutoAnalyzeEnabled) return;

  // Check for promotion move (length of 5 where last char is the promotion piece)
  if (move.length === 5) {
    let promotionPiece = "";
    switch (move[4].toLowerCase()) {
      case "q":
        promotionPiece = "Queen";
        break;
      case "r":
        promotionPiece = "Rook";
        break;
      case "b":
        promotionPiece = "Bishop";
        break;
      case "n":
        promotionPiece = "Knight";
        break;
    }

    moveDisplay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">Best move: ${move.substring(
        0,
        4
      )}</div>
      <div style="color: #ffd700; font-size: 12px;">⭐ Promote to ${promotionPiece}</div>
    `;
  } else {
    moveDisplay.innerHTML = `
      <div style="font-weight: bold;">Best move: ${move}</div>
    `;
  }

  moveDisplay.style.display = "block";
  hideLoading();
  highlightBestMove(move);
}

function hideBestMove() {
  moveDisplay.style.display = "none";
  hideLoading();
  clearHighlights();
}

function analyzeBoardState(playerColor) {
  if (!isAutoAnalyzeEnabled) {
    hideBestMove();
    return;
  }

  console.log("Auto-analyzing board state...");
  const boardState = getBoardState();
  if (!boardState) {
    hideLoading();
    return;
  }

  const activeTurn = playerColor === "white" ? "w" : "b";
  const fen = boardToFen(boardState, activeTurn);

  // Validate turn
  const currentTurn = fen.split(" ")[1];
  if (currentTurn !== activeTurn) {
    console.log("Not player's turn");
    hideBestMove();
    return;
  }

  showLoading();

  browser.runtime
    .sendMessage({
      action: "analyzeBoard",
      fen: fen,
    })
    .then((analysis) => {
      if (!isAutoAnalyzeEnabled) return;

      if (analysis && analysis.move) {
        console.log("Received analysis:", analysis.move);
        showBestMove(analysis.move);
      } else {
        hideLoading();
      }
    })
    .catch((error) => {
      console.error("Analysis error:", error);
      hideLoading();
    });
}

// Message listener
function setupMoveObserver(playerColor) {
  if (moveObserver) {
    moveObserver.disconnect();
  }

  // Find the chess board
  const board = document.querySelector("wc-chess-board");
  if (!board) return;

  let lastMove = null;
  const debounceTime = 500; // Debounce time in milliseconds

  // Create mutation observer to detect piece movements
  moveObserver = new MutationObserver((mutations) => {
    if (!isAutoAnalyzeEnabled) return;

    const now = Date.now();
    if (lastMove && now - lastMove < debounceTime) {
      return; // Debounce rapid fire mutations
    }

    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class" &&
        mutation.target.classList.contains("piece")
      ) {
        // Get the piece color that just moved
        const pieceClasses = mutation.target.className;
        const isWhitePiece = pieceClasses.includes("w");
        const isBlackPiece = pieceClasses.includes("b");

        // Only analyze after opponent's pieces move
        if (
          (playerColor === "white" && isBlackPiece) ||
          (playerColor === "black" && isWhitePiece)
        ) {
          lastMove = now;
          // Wait a bit for the move to complete
          setTimeout(() => {
            if (isAutoAnalyzeEnabled) {
              analyzeBoardState(playerColor);
            }
          }, 200);
          break;
        }
      }
    }
  });

  // Start observing the board
  moveObserver.observe(board, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

// Add moveObserver setup to the toggleAutoAnalyze handler
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  if (message.action === "toggleAutoAnalyze") {
    isAutoAnalyzeEnabled = message.enabled;
    if (isAutoAnalyzeEnabled) {
      browser.storage.local.get("playerColor").then((result) => {
        console.log("Starting analysis with color:", result.playerColor);
        setupMoveObserver(result.playerColor || "white"); // Add this line
        analyzeBoardState(result.playerColor || "white");
      });
    } else {
      if (moveObserver) {
        moveObserver.disconnect();
        moveObserver = null;
      }
      hideBestMove();
    }
    return true;
  }
});

// Utility functions (getBoardState and boardToFen remain unchanged)
function getBoardState() {
  console.log("Getting board state...");
  const pieces = document.querySelectorAll(".piece");
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  pieces.forEach((piece) => {
    const classList = piece.className;
    const match = classList.match(/square-(\d)(\d)/);
    if (match) {
      const row = 8 - parseInt(match[2], 10);
      const col = parseInt(match[1], 10) - 1;
      const typeMatch = classList.match(/\b[bw][pnbrqk]\b/);
      if (typeMatch) {
        board[row][col] = typeMatch[0];
      }
    }
  });
  return board;
}

function boardToFen(board, activeColor = "w") {
  let fen = board
    .map((row) =>
      row
        .map((cell) => {
          if (!cell) return "1";
          const piece = cell[1].toLowerCase();
          return cell[0] === "w" ? piece.toUpperCase() : piece;
        })
        .join("")
        .replace(/1+/g, (match) => match.length)
    )
    .join("/");

  const castlingRights = "KQkq";
  const enPassant = "-";
  const halfmoveClock = "0";
  const fullmoveNumber = "1";

  return `${fen} ${activeColor} ${castlingRights} ${enPassant} ${halfmoveClock} ${fullmoveNumber}`;
}
