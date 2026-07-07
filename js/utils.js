"use strict"

function createMat(rows, cols) {
  const mat = []

  for (var i = 0; i < rows; i++) {
    const row = []

    for (var j = 0; j < cols; j++) {
      row.push("")
    }
    mat.push(row)
  }
  return mat
}

function countNeighbors(rowIdx, colIdx, mat) {
  var neighborsCount = 0

  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue
      if (i === rowIdx && j === colIdx) continue

      if (mat[i][j].isMine) neighborsCount++
    }
  }
  return neighborsCount
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomIntExclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function getRandomColor() {
  const letters = "0123456789ABCDEF"
  var color = "#"

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function makeId(length = 6) {
  var txt = ""
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

const cssRegistry = {
  // Read a variable from any element (defaults to root)
  get(variableName, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(variableName).trim()
  },

  // Set a variable on any element (defaults to root)
  set(variableName, value, element = document.documentElement) {
    element.style.setProperty(variableName, value)
  },
}
