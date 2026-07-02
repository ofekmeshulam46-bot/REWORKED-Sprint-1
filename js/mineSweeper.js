"use strict"
const MINE = "💣"
const FLAG = "🚩"
const NORMAL_SMILEY = "😀"
const HAPPY_SMILEY = " 😎"
const SAD_SMILEY = "🤯"
const LIGHTBULB = '<img src="imgs/hint.PNG">'
const LIT_LIGHTBULB = '<img src="imgs/clicked_hint.PNG">'
var gLevel = {
  SIZE: 4,
  MINES: 2,
}

var gGame

var gSafeCells
var gBoard
var gIsFirstClick
var gFirstCell
var gBoardRendered = null
var gLives
var gScore
var gTimerInterval = null
var gStartTime
var gTimeLapsed
// hinting
var gIsHint
var gCurrentlyHinting
var gHintedCellCount
var gFlashNum
var gFlashes
var gFlashTime //miliseconds
var gDisappearTime //miliseconds
//
const gElModal = document.querySelector(".modal span")
const gElEmoji = document.querySelector(".emoji span")
const gElHeader = document.querySelector(".lives")
const elScore = document.querySelector("h2 .score")
const elHintOne = document.querySelector(".-hint ")
const elHintTwo = document.querySelector(".-two ")
const elHintThree = document.querySelector(".-three ")
function onInit() {
  gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintTimeout: null,
    removeHintTimeout: null,
  }
  gGame.isOn = true
  gBoardRendered = null
  gSafeCells = gLevel.SIZE ** 2
  gLives = 3
  gElHeader.innerHTML = gLives
  gScore = 0
  elScore.innerHTML = gScore

  //hinting
  gIsHint = null
  gCurrentlyHinting = null
  gHintedCellCount = 0
  gFlashNum = 2
  gFlashes = 0
  gFlashTime = 600
  gDisappearTime = 400
  //
  gElModal.innerHTML = ""
  gElEmoji.innerHTML = NORMAL_SMILEY
  elHintOne.innerHTML = LIGHTBULB
  elHintTwo.innerHTML = LIGHTBULB
  elHintThree.innerHTML = LIGHTBULB
  gBoard = buildBoard()
  renderBoard(gBoard)
}

function setDifficulty(button) {
  if (button.innerHTML === "Easy") {
    gLevel = {
      SIZE: 4,
      MINES: 2,
    }
    //todo: stop timer show without reset

    // gTimerMilliSeconds = 0
    stopTimer()
    setTimerToZero()
    onInit()
    // gTimeLapsed = 0
    // updateTimerDisplay()
    // startTimer()
  }
  if (button.innerHTML === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 14,
    }
    //todo: stop timer show without reset

    // clearInterval(gTimerInterval)
    stopTimer()
    setTimerToZero()
    onInit()
  }
  if (button.innerHTML === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 32,
    }
    //todo: stop timer show without reset

    // clearInterval(gTimerInterval)
    stopTimer()
    setTimerToZero()
    onInit()
  }
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
        isHinted: false,
      }
    }
  }

  return board
}

function settingRandomMines() {
  var minesCount = 0
  for (var i = 0; minesCount < gLevel.MINES; i++) {
    var randomI = getRandomIntExclusive(0, gLevel.SIZE)
    var randomJ = getRandomIntExclusive(0, gLevel.SIZE)
    if (gBoard[randomI][randomJ].isMine) continue
    gBoard[randomI][randomJ].isMine = true
    minesCount++
    if (gBoard[gFirstCell.i][gFirstCell.j].isMine) {
      gBoard[gFirstCell.i][gFirstCell.j].isMine = false
      minesCount--
      continue
    }
    gSafeCells--
  }
}

function settingMinesAroundCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      negsMinesCount(i, j, board)
    }
  }
}

function negsMinesCount(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue
      if (i === rowIdx && j === colIdx) continue

      if (mat[i][j].isMine) mat[rowIdx][colIdx].minesAroundCount++
    }
  }
  return mat
}

function renderBoard() {
  var strHTML = ""
  var lines = gBoard.length
  var columns = gBoard[0].length
  for (var i = 0; i < lines; i++) {
    strHTML += "<tr>"
    for (var j = 0; j < columns; j++) {
      const cell = gBoard[i][j]
      const className = `cell cell-${i}-${j}`
      var cellContent = cell.isMine ? MINE : cell.minesAroundCount
      strHTML += `<td  class="${className}"
      onclick= onCellClicked(this,${i},${j})
       oncontextmenu=onCellMarked(this,${i},${j},event) >
        <span class= hidden>${cellContent}</span><span class=flag></span>
                        </td>`
    }
    strHTML += "</tr>"
  }
  const elContainer = document.querySelector(".board")
  elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function firstClick(i, j) {
  gIsFirstClick = true
  for (var k = 0; k < gBoard.length; k++) {
    for (var l = 0; l < gBoard[0].length; l++) {
      if (k === i && l === j) continue
      if (gBoard[k][l].isRevealed) {
        gIsFirstClick = false
      }
    }
  }
  return gIsFirstClick
}

function checkMineMarks() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked === false) return false
    }
  }
  return true
}

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn) return
  let isFirstCell = firstClick(i, j)
  if (isFirstCell) {
    gFirstCell = { i, j }
    startGame()
  }
  if (gIsHint) {
    temporaryReveal(i, j)
    return
  }
  if (gBoard[i][j].isMarked) return
  if (gBoard[i][j].isRevealed) return
  const cell = document.querySelector(`.cell-${i}-${j} span`)
  cell.classList.remove("hidden")

  function startGame() {
    if (gBoardRendered) return
    startTimer()
    settingRandomMines()
    settingMinesAroundCount(gBoard)
    renderBoard(gBoard)
    gBoardRendered = true
  }

  if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
    gBoard[i][j].isRevealed = true
    gSafeCells--
    gScore++
    elScore.innerHTML = gScore
    // if (gIsHint) {
    //   temporaryReveal(i, j, gBoard)
    // }
    if (gBoard[i][j].minesAroundCount === 0) {
      countNeighbors(i, j, gBoard)
    }

    if (!gSafeCells && checkMineMarks()) {
      gameOver(true)
    }
  } else if (gBoard[i][j].isMine) {
    gBoard[i][j].isRevealed = true
    gLives--
    gElHeader.innerHTML = gLives
    if (gLives > 0) {
      setTimeout(() => {
        gBoard[i][j].isRevealed = false
        cell.classList.add("hidden")
        if (!gGame.isOn) {
          gBoard[i][j].isRevealed = true
          cell.classList.remove("hidden")
        }
      }, 900)
      return
    } else {
      for (var k = 0; k < gBoard.length; k++) {
        for (var l = 0; l < gBoard[0].length; l++) {
          if (gBoard[k][l].isMine) {
            var mineCell = document.querySelector(`.cell-${k}-${l} span`)
            var flagMine = document.querySelector(`.cell-${k}-${l} .flag`)
            flagMine.innerHTML = ""
            mineCell.classList.remove("hidden")
          }
        }
      }
      gameOver(false)
    }
  }
}
function onCellMarked(elCell, i, j, event) {
  event.preventDefault()
  if (!gGame.isOn) return
  if (!gBoardRendered) return
  if (gBoard[i][j].isRevealed) return
  // const isFirstMark
  const flagCell = document.querySelector(`.cell-${i}-${j} .flag`)
  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false
    flagCell.innerHTML = ""
  } else {
    gBoard[i][j].isMarked = true
    flagCell.innerHTML = FLAG
  }
  var minesMarked = checkMineMarks()
  if (!gSafeCells && minesMarked) gameOver(true)
}

function giveHint(hint) {
  if (!gGame.isOn) return // cant use hints when game is over
  if (!gBoardRendered) return //cant use hints before first move
  if (gIsHint || gCurrentlyHinting) return //doesn't allow to click hint before using current
  if (hint.innerHTML === LIT_LIGHTBULB) return //doesn't allow to get another hint from a used one
  hint.innerHTML = LIT_LIGHTBULB
  gIsHint = true
  gFlashes = 0
}

function countNeighbors(rowIdx, colIdx, mat) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue
      if (i === rowIdx && j === colIdx) continue
      var cell = document.querySelector(`.cell-${i}-${j} span`)
      var flaggedCell = document.querySelector(`.cell-${i}-${j} .flag`)

      if (!mat[i][j].isMine && !mat[i][j].isRevealed) {
        mat[i][j].isRevealed = true
        gSafeCells--
        gScore++
        elScore.innerHTML = gScore
        cell.classList.remove("hidden")
        if (mat[i][j].isMarked) {
          mat[i][j].isMarked = false
          flaggedCell.innerHTML = ""
        }
        if (mat[i][j].minesAroundCount === 0) {
          countNeighbors(i, j, gBoard)
        }
      }
    }
  }
  return
}

function temporaryReveal(rowIdx, colIdx) {
  console.log("temorary reveal")
  console.log(gIsHint, "gIsHint")
  // if (!gGame.hintTimeout || !gGame.removeHintTimeout) return
  gCurrentlyHinting = true
  gHintedCellCount = 0
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue
      if (gBoard[i][j].isRevealed && !gBoard[i][j].isHinted) continue
      let cellContainer = document.querySelector(`.cell-${i}-${j}`)
      let cell = document.querySelector(`.cell-${i}-${j} span`)
      let flaggedCell = document.querySelector(`.cell-${i}-${j} .flag`)
      gBoard[i][j].isHinted = true
      if (gBoard[i][j].isHinted) {
        gHintedCellCount++
        gBoard[i][j].isRevealed = true
        cell.classList.remove("hidden")
        cellContainer.style.backgroundColor = "rgb(196, 238, 44)"
        flaggedCell.classList.add("hidden")
      }
    }
  }
  if (!gGame.isOn) {
    renderBoard(gBoard)
    // return // cant use hints when game is over
  }

  if (gHintedCellCount === 0) return removeHinted()
  gGame.hintTimeout = setTimeout(() => {
    console.log("timeout")
    removeHinted()
  }, gFlashTime)

  function removeHinted() {
    console.log("remove hinted")
    for (let i = 0; i < gBoard.length; i++) {
      for (let j = 0; j < gBoard[0].length; j++) {
        let cellContainer = document.querySelector(`.cell-${i}-${j}`)
        let cell = document.querySelector(`.cell-${i}-${j} span`)
        let flaggedCell = document.querySelector(`.cell-${i}-${j} .flag`)

        if (gBoard[i][j].isHinted || gHintedCellCount === 0) {
          if (gHintedCellCount === 0) {
            gIsHint = true
            gCurrentlyHinting = false
            return //if theres no hinted cells at all - return
          }
          if (cell && cell.classList) {
            //defense
            cellContainer.style.backgroundColor = "lightblue"
            cell.classList.add("hidden")
            flaggedCell.classList.remove("hidden")
          }
          if (gFlashes >= gFlashNum) {
            gBoard[i][j].isHinted = false
            gBoard[i][j].isRevealed = false
            gIsHint = null
            gCurrentlyHinting = null
          }
        }
      }
    }
    console.log(gFlashes, "gFlashes")
    gFlashes++
    if (gFlashes < gFlashNum + 1) {
      setTimeout(() => {
        gGame.removeHintTimeout = temporaryReveal(rowIdx, colIdx)
      }, gDisappearTime)
    }
  }
}
function startTimer() {
  gStartTime = Date.now()
  gTimerInterval = setInterval(updateTimerDisplay, 31)
}

function stopTimer() {
  clearInterval(gTimerInterval)
  updateTimerDisplay()
}

function setTimerToZero() {
  startTimer()
  stopTimer()
}

function updateTimerDisplay() {
  var now = Date.now()
  var gTimeLapsed = now - gStartTime
  const ms = (gTimeLapsed % 1000) + ""
  const totalSeconds = (gTimeLapsed - ms) / 1000
  const seconds = (totalSeconds % 60) + ""
  const minutes = Math.floor((totalSeconds - seconds) / 60) + ""

  const elTimer = document.querySelector(".timer")
  elTimer.innerText = `${seconds.padStart(3, "0")}`
}

function gameOver(isWin) {
  gGame.isOn = false
  stopTimer()
  if (isWin) {
    gElModal.style.color = "white"
    gElModal.innerHTML = "you won!"
    gElModal.style.textalign = "center"
    gElEmoji.innerHTML = HAPPY_SMILEY
  } else if (!isWin) {
    gElModal.innerHTML = "you lost!"
    gElModal.style.color = "black"
    gElModal.style.textalign = "center"
    gElEmoji.innerHTML = SAD_SMILEY
  }
  gElModal.classList.remove("hidden") // display=false didnt work
}
