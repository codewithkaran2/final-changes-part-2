// main.js

// Utility function to load a script dynamically with error handling.
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.src = url;
  script.defer = true;
  script.onload = () => callback();
  script.onerror = () => {
    console.error(`Failed to load script: ${url}`);
  };
  document.body.appendChild(script);
}

// Global variable to store the selected game mode.
let gameMode = "duo";

// DOM elements
const nameContainer = document.getElementById("nameContainer");
const p1NameInput = document.getElementById("p1Name");
const p2NameInput = document.getElementById("p2Name");
const startButton = document.getElementById("startButton");
const p2ControlBox = document.getElementById("p2ControlBox");
const capsLockWarning = document.getElementById("capsLockWarning");
const colorPickerContainer = document.getElementById("colorPickerContainer");
const playerColorPicker = document.getElementById("playerColor");
const p1ControlTitle = document.getElementById("p1ControlTitle");

// Add pulsing animation to the Start button
function animateStartButton() {
  if (startButton) {
    startButton.classList.add("animate-button");
  }
}

// Detect Caps Lock
if (p1NameInput) {
  p1NameInput.addEventListener("keyup", (e) => {
    if (e.getModifierState("CapsLock")) {
      capsLockWarning.style.display = "block";
    } else {
      capsLockWarning.style.display = "none";
    }
  });
}

// Mode selection functions
function selectDuoMode() {
  gameMode = "duo";
  nameContainer.style.display = "block";
  p1NameInput.placeholder = "Enter 🟦 Player 1 Name";
  p2NameInput.style.display = "inline-block";
  p2NameInput.placeholder = "Enter 🟥 Player 2 Name";
  p2ControlBox.style.display = "block";
  colorPickerContainer.style.display = "none";
  animateStartButton();
}

function selectSurvivalMode() {
  gameMode = "survival";
  nameContainer.style.display = "block";
  p1NameInput.placeholder = "Enter Your Name";
  p2NameInput.style.display = "none";
  p2ControlBox.style.display = "none";
  colorPickerContainer.style.display = "block";
  animateStartButton();
}

// Start game logic
function startGame() {
  const startScreen = document.getElementById("startScreen");
  if (startScreen) startScreen.classList.add("hidden");

  animateStartButton();

  if (gameMode === "survival") {
    const playerName = p1NameInput.value.trim();
    const selectedColor = playerColorPicker.value;

    if (playerName !== "" && p1ControlTitle) {
      p1ControlTitle.innerText = `${playerName} 🎮:`;
    }

    // Store survival name and color
    localStorage.setItem("survivalPlayerName", playerName);
    localStorage.setItem("survivalPlayerColor", selectedColor);

    loadScript("survivalMode.js", () => {
      if (typeof survivalStartGame === "function") {
        survivalStartGame();
      } else {
        console.error("Function survivalStartGame not found.");
      }
    });
  } else if (gameMode === "duo") {
    const player1Name = p1NameInput.value.trim();
    const player2Name = p2NameInput.value.trim();

    if (player1Name !== "" && p1ControlTitle) {
      p1ControlTitle.innerText = `${player1Name} 🎮:`;
    }

    const p2ControlTitle = document.getElementById("p2ControlBox").querySelector("h3");
    if (player2Name !== "" && p2ControlTitle) {
      p2ControlTitle.innerText = `${player2Name} 🎮:`;
    }

    // Store duo names
    localStorage.setItem("player1Name", player1Name);
    localStorage.setItem("player2Name", player2Name);

    loadScript("duoMode.js", () => {
      if (typeof duoStartGame === "function") {
        duoStartGame();
      } else {
        console.error("Function duoStartGame not found.");
      }
    });
  } else {
    console.error("Unknown game mode: " + gameMode);
  }
}

// Fullscreen toggle
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Open feedback form
function openFeedback() {
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLSeAoFZsKul8s3ri1X4Dk6igH8n2kC3_mv_drBF1xBCmjr_9jw/viewform?usp=dialog',
    '_blank'
  );
}

// Expose to window
window.selectDuoMode = selectDuoMode;
window.selectSurvivalMode = selectSurvivalMode;
window.startGame = startGame;
window.toggleFullScreen = toggleFullScreen;
window.openFeedback = openFeedback;
