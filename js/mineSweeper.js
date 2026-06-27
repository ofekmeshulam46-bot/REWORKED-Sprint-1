"use strict";

const MINE = "💣";
const FLAG = "🚩";
const NORMAL_SMILEY = "😀";
const HAPPY_SMILEY = " 😎";
const SAD_SMILEY = "🤯";
const LIGHTBULB = '<img src="imgs/hint.PNG">';
const LIT_LIGHTBULB = '<img src="imgs/clicked_hint.PNG">';
var gLevel = {
  SIZE: 4,
  MINES: 2,
};

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

var gSafeCells;
var gBoard;
var gIsFirstClick;
var gFirstCell;
var gLives;
var gScore;
var gTimerInterval = null;
var gStartTime;
var gTimeLapsed;
var gIsHint;
const gElModal = document.querySelector(".modal span");
const gElEmoji = document.querySelector(".emoji span");
const gElHeader = document.querySelector(".lives");
const elScore = document.querySelector("h2 .score");
const elHintOne = document.querySelector(".-hint ");
const elHintTwo = document.querySelector(".-two ");
const elHintThree = document.querySelector(".-three ");

function onInit() {
  gGame.isOn = true;
  gSafeCells = gLevel.SIZE ** 2;
  gLives = 3;
  gElHeader.innerHTML = gLives;
  gScore = 0;
  elScore.innerHTML = gScore;
  gIsHint = false;
  gElModal.innerHTML = "";
  gElEmoji.innerHTML = NORMAL_SMILEY;
  elHintOne.innerHTML = LIGHTBULB;
  elHintTwo.innerHTML = LIGHTBULB;
  elHintThree.innerHTML = LIGHTBULB;
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function setDifficulty(button) {
  if (button.innerHTML === "Easy") {
    gLevel = {
      SIZE: 4,
      MINES: 2,
    };
    //todo: stop timer show without reset

    // gTimerMilliSeconds = 0
    setTimerToZero();
    onInit();
    // gTimeLapsed = 0
    // updateTimerDisplay()
    // startTimer()
  }
  if (button.innerHTML === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 14,
    };
    //todo: stop timer show without reset

    // clearInterval(gTimerInterval)
    setTimerToZero();
    onInit();
  }
  if (button.innerHTML === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 32,
    };
    //todo: stop timer show without reset

    // clearInterval(gTimerInterval)
    setTimerToZero();
    onInit();
  }
}

function buildBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([]);
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
        isHinted: false,
      };
    }
  }

  return board;
}

function settingRandomMines() {
  var minesCount = 0;
  for (var i = 0; minesCount < gLevel.MINES; i++) {
    var randomI = getRandomIntExclusive(0, gLevel.SIZE);
    var randomJ = getRandomIntExclusive(0, gLevel.SIZE);
    if (gBoard[randomI][randomJ].isMine) continue;
    gBoard[randomI][randomJ].isMine = true;
    minesCount++;
    if (gBoard[gFirstCell.i][gFirstCell.j].isMine) {
      gBoard[gFirstCell.i][gFirstCell.j].isMine = false;
      minesCount--;
      continue;
    }
    gSafeCells--;
  }
}

function settingMinesAroundCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      negsMinesCount(i, j, board);
    }
  }
}

function negsMinesCount(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;

      if (mat[i][j].isMine) mat[rowIdx][colIdx].minesAroundCount++;
    }
  }
  return mat;
}

function renderBoard() {
  var strHTML = "";
  var lines = gBoard.length;
  var columns = gBoard[0].length;
  for (var i = 0; i < lines; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < columns; j++) {
      const cell = gBoard[i][j];
      const className = `cell cell-${i}-${j}`;
      var cellContent = cell.isMine ? MINE : cell.minesAroundCount;
      strHTML += `<td  class="${className}" 
      onclick= onCellClicked(this,${i},${j})
       oncontextmenu=onCellMarked(this,${i},${j},event) >
        <span class= hidden>${cellContent}</span><span class=flag></span>
                        </td>`;
    }
    strHTML += "</tr>";
  }
  const elContainer = document.querySelector(".board");
  elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function firstClick(i, j) {
  gIsFirstClick = true;
  for (var k = 0; k < gBoard.length; k++) {
    for (var l = 0; l < gBoard[0].length; l++) {
      if (k === i && l === j) continue;
      if (gBoard[k][l].isRevealed) {
        gIsFirstClick = false;
      }
    }
  }
  return gIsFirstClick;
}

function checkMineMarks() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked === false) return false;
    }
  }
  return true;
}

function onCellClicked(elCell, i, j) {
  if (gBoard[i][j].isMarked) return;
  if (!gGame.isOn) return;
  let isFirstCell = firstClick(i, j);
  if (isFirstCell) {
    startTimer();
    gFirstCell = { i, j };
    settingRandomMines();
    settingMinesAroundCount(gBoard);
    renderBoard(gBoard);
  }
  const cell = document.querySelector(`.cell-${i}-${j} span`);
  cell.classList.remove("hidden");
  if (gIsHint) {
    temporaryReveal(i, j);
    gIsHint = false;
    return;
  }

  if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
    gBoard[i][j].isRevealed = true;
    gSafeCells--;
    gScore++;
    elScore.innerHTML = gScore;
    // if (gIsHint) {
    //   temporaryReveal(i, j, gBoard)
    // }
    if (gBoard[i][j].minesAroundCount === 0) {
      countNeighbors(i, j, gBoard);
    }

    if (!gSafeCells && checkMineMarks()) {
      gameOver(true);
    }
  } else if (gBoard[i][j].isMine) {
    gBoard[i][j].isRevealed = true;
    gLives--;
    gElHeader.innerHTML = gLives;
    if (gLives > 0) {
      setTimeout(() => {
        gBoard[i][j].isRevealed = false;
        cell.classList.add("hidden");
        if (!gGame.isOn) {
          gBoard[i][j].isRevealed = true;
          cell.classList.remove("hidden");
        }
      }, 900);
      return;
    } else {
      for (var k = 0; k < gBoard.length; k++) {
        for (var l = 0; l < gBoard[0].length; l++) {
          if (gBoard[k][l].isMine) {
            var mineCell = document.querySelector(`.cell-${k}-${l} span`);
            var flagMine = document.querySelector(`.cell-${k}-${l} .flag`);
            flagMine.innerHTML = "";
            mineCell.classList.remove("hidden");
          }
        }
      }
      gameOver(false);
    }
  }
}
function onCellMarked(elCell, i, j, event) {
  event.preventDefault();
  if (!gGame.isOn) return;
  if (gBoard[i][j].isRevealed) return;
  // const isFirstMark
  const flagCell = document.querySelector(`.cell-${i}-${j} .flag`);
  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false;
    flagCell.innerHTML = "";
  } else {
    gBoard[i][j].isMarked = true;
    flagCell.innerHTML = FLAG;
  }
  var minesMarked = checkMineMarks();
  if (!gSafeCells && minesMarked) gameOver(true);
}

function giveHint(hint) {
  hint.innerHTML = LIT_LIGHTBULB;
  gIsHint = true;
}

function gameOver(isWin) {
  if (isWin) {
    gElModal.style.color = "white";
    gElModal.innerHTML = "you won!";
    gElModal.style.textalign = "center";
    gElEmoji.innerHTML = HAPPY_SMILEY;
  } else if (!isWin) {
    gElModal.innerHTML = "you lost!";
    gElModal.style.color = "black";
    gElModal.style.textalign = "center";
    gElEmoji.innerHTML = SAD_SMILEY;
  }
  gElModal.classList.remove("hidden"); // display=false didnt work
  gGame.isOn = false;
  stopTimer(); // this and settimertozero dont work well
}

function countNeighbors(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue;

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = document.querySelector(`.cell-${i}-${j} span`);
      var flaggedCell = document.querySelector(`.cell-${i}-${j} .flag`);

      if (!mat[i][j].isMine && !mat[i][j].isRevealed) {
        mat[i][j].isRevealed = true;
        gSafeCells--;
        gScore++;
        elScore.innerHTML = gScore;
        cell.classList.remove("hidden");
        if (mat[i][j].isMarked) {
          mat[i][j].isMarked = false;
          flaggedCell.innerHTML = "";
        }
        if (mat[i][j].minesAroundCount === 0) {
          countNeighbors(i, j, gBoard);
        }
      }
    }
  }
  return;
}

function temporaryReveal(rowIdx, colIdx) {
  console.log("temporary reveal");
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (gBoard[i][j].isRevealed) continue;
      if (j < 0 || j >= gBoard[i].length) continue;
      let cellContainer = document.querySelector(`.cell-${i}-${j}`);
      let cell = document.querySelector(`.cell-${i}-${j} span`);
      let flaggedCell = document.querySelector(`.cell-${i}-${j} .flag`);
      gBoard[i][j].isHinted = true;
      if (gBoard[i][j].isHinted) {
        console.log("was hinted");
        gBoard[i][j].isRevealed = true;
        // console.table(gBoard);
        cell.classList.remove("hidden");
        cellContainer.style.backgroundColor = "rgb(196, 238, 44)";
      } //defense
    }
    setTimeout(() => {
      removeHinted();
    }, 1500);
  }
}
function removeHinted() {
  console.log("remove hint");
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      let cellContainer = document.querySelector(`.cell-${i}-${j}`);
      let cell = document.querySelector(`.cell-${i}-${j} span`);
      if (gBoard[i][j].isHinted) {
        gBoard[i][j].ishinted = false;
        gBoard[i][j].isRevealed = false;
        if (cell && cell.classList) {
          //defense
          console.log(cell.innerHTML);
          cellContainer.style.backgroundColor = "lightblue";
          cell.classList.add("hidden");
          console.log("done");
        }
      }
    }
  }
}

function startTimer() {
  gStartTime = Date.now();
  gTimerInterval = setInterval(updateTimerDisplay, 31);
}

function stopTimer() {
  clearInterval(gTimerInterval);
  // gTimerInterval = null
  // gStartTime = Date.now()
  updateTimerDisplay();
}

function setTimerToZero() {
  startTimer();
  stopTimer();
}

function updateTimerDisplay() {
  var now = Date.now();
  var gTimeLapsed = now - gStartTime;
  const ms = (gTimeLapsed % 1000) + "";
  const totalSeconds = (gTimeLapsed - ms) / 1000;
  const seconds = (totalSeconds % 60) + "";
  const minutes = Math.floor((totalSeconds - seconds) / 60) + "";

  const elTimer = document.querySelector(".timer");
  elTimer.innerText = `${seconds.padStart(3, "0")}`;
}
