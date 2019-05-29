'use strict'

var winIcon = '😎';
var normalIcon = '🙂';
var SadIcon = '😫';
var mineIcon = '💣';
var flagIcon = '🚩'
var gLivesIcons = ['', '💙 ', '💙 💙 ', '💙 💙 💙']
var gBoard;
var gLevel;
var gGame;
var gFirstMove;
var ginterval;
var gElLiveDisplay;
var gElTimeDisplay;
var gLives;
var gBombDisplay;
var gMode;
var gElModeDisplay
function initGame() {
    clearInterval(ginterval);
    gElTimeDisplay = document.querySelector('.timer');
    gElTimeDisplay.innerHTML = '0:0:0';
    gLives = 3;
    var userModeChoose = getSizefromUser();
    var boardSize = +userModeChoose.getAttribute('value');
    var numOFmines;
    if (boardSize === 4) { numOFmines = 2; gMode = 'Beginner'; }
    if (boardSize === 8) { numOFmines = 12; gMode = 'Medium'; }
    if (boardSize === 12) { numOFmines = 30; gMode = 'Hard'; }
    gLevel = { size: boardSize, mines: numOFmines }
    var gBombDisplay = document.querySelector('.mines');
    gBombDisplay.innerText = mineIcon + numOFmines;
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
    gBoard = buildBoard();
    renderBoard();
    var eLbtn = document.querySelector('button');
    eLbtn.innerText = normalIcon;
    gElLiveDisplay = document.querySelector('.lives');
    gElLiveDisplay.innerText = gLivesIcons[gLives];
    gFirstMove = true;
    gElModeDisplay = document.querySelector(`.${gMode}`)
    if (localStorage.getItem(`record ${gMode} level`) !== null) {
        gElModeDisplay.innerText = localStorage.getItem(`record ${gMode} level`) + ' seconds'
    }
}
function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < gLevel.size; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < gLevel.size; j++) {
            var tdId = `cell-${i}-${j}`
            strHtml += `<td id="${tdId}" onclick="cellClicked(this,${i},${j})" 
                        onContextMenu="cellMarked(event,this,${i},${j})"
                        class="cell">
                        </td>`;
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;

}

function getSizefromUser() {
    var elRadios = document.querySelectorAll('input')
    for (var i = 0; i < elRadios.length; i++) {
        if (elRadios[i].checked) return elRadios[i];
    }
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function placeMines(board) {
    var count = 0;
    while (count < gLevel.mines) {
        var iIdx = getRandomInt(0, gLevel.size);
        var jIdx = getRandomInt(0, gLevel.size);
        if (!board[iIdx][jIdx].isMine && !board[iIdx][jIdx].isShown) {
            board[iIdx][jIdx].isMine = true;
            count++;
        }
    }
    return board;
}

function setMinesNegsCount(board, iIdx, jIdx) {
    var count = 0;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (i === iIdx && j === jIdx) continue;
            if (i < 0 || i >= gLevel.size) continue;
            if (j < 0 || j >= gLevel.size) continue;
            if (board[i][j].isMine) count++;
        }
    }
    return count;
}



function cellClicked(elCell, i, j) {
    var clickedCell = gBoard[i][j];
    if (!(gGame.isOn)) return;
    if (gFirstMove) {
        gFirstMove = false;
        ginterval = setInterval(timer, 1000);
        clickedCell.isShown = true;
        var color = 'gainsboro'
        gBoard = placeMines(gBoard);
        for (var x = 0; x < gBoard.length; x++) {
            for (var y = 0; y < gBoard.length; y++) {
                gBoard[x][y].minesAroundCount = setMinesNegsCount(gBoard, x, y);
            }
        }
        renderBoard()
        if (clickedCell.minesAroundCount === 0) expandShown(i, j)
        renderCell(i, j, color, clickedCell.minesAroundCount)
    }
    if (clickedCell.isMarked) return;
    if (clickedCell.isShown) return;
    clickedCell.isShown = true;
    if (clickedCell.isMine) {
        gLives--;
        gElLiveDisplay.innerText = gLivesIcons[gLives];  
        if (gLives === 0) gameOver(elCell);
        else {
            elCell.innerText = mineIcon;
            elCell.style.backgroundColor = 'red';
            setTimeout(function () {
                elCell.innerText = '';
                elCell.style.backgroundColor = 'grey';
            }, 500)
            clickedCell.isShown = false;
        }
    }
    else {
        gGame.shownCount++;
        elCell.style.backgroundColor = 'gainsboro';
        if (clickedCell.minesAroundCount === 0) {
            expandShown(i, j);
        }
        else {
            elCell.innerText = clickedCell.minesAroundCount;
        }
    }
    checkGameOver();
}

function expandShown(iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (i === iIdx && j === jIdx) continue;
            if (i < 0 || i >= gLevel.size) continue;
            if (j < 0 || j >= gLevel.size) continue;
            var cellNeighbor = gBoard[i][j];
            var elCellNeighbor = document.querySelector(`#cell-${i}-${j}`)
            if (cellNeighbor.minesAroundCount === 0 && !cellNeighbor.isMine &&
                !cellNeighbor.isShown && !cellNeighbor.isMarked) {
                gGame.shownCount++;
                cellNeighbor.isShown = true;
                elCellNeighbor.style.backgroundColor = 'gainsboro';
                expandShown(i, j);
            } else if (cellNeighbor.minesAroundCount !== 0 && !cellNeighbor.isMine &&
                !cellNeighbor.isShown && !cellNeighbor.isMarked) {
                gGame.shownCount++;
                cellNeighbor.isShown = true;
                elCellNeighbor.innerText = cellNeighbor.minesAroundCount;
                elCellNeighbor.style.backgroundColor = 'gainsboro';
            }
        }
    }
}

function gameOver(elCell) {
    gElLiveDisplay.innerText = gLivesIcons[gLives];
    elCell.style.backgroundColor = 'red';
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine) {
                var elMine = document.querySelector(`#cell-${i}-${j}`)
                elMine.innerText = mineIcon;
            }
        }
    }
    var eLbtn = document.querySelector('button');
    eLbtn.innerText = SadIcon;
    clearInterval(ginterval);
    gGame.isOn = false;

}

function checkGameOver() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return;
        }
    }
    var cellsNum = gLevel.size * gLevel.size;
    var minesNum = gLevel.mines;
    var diff = cellsNum - minesNum;
    if (gGame.shownCount === diff) {
        var eLbtn = document.querySelector('button');
        eLbtn.innerText = winIcon;
        storeRecord();
        clearInterval(ginterval);
        gGame.isOn = false;
    }
}

function storeRecord() {
    if (localStorage.getItem(`record ${gMode} level`) === null) {
        localStorage.setItem(`record ${gMode} level`, gGame.secsPassed);
        gElModeDisplay.innerText = gGame.secsPassed + ' seconds'
    }
    else {
        var curTime = parseInt(localStorage.getItem(`record ${gMode} level`));
        if (curTime > gGame.secsPassed) {
            localStorage.setItem(`record ${gMode} level`, gGame.secsPassed);
            gElModeDisplay.innerText = gGame.secsPassed + ' seconds';
        }
    }
}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault();
    if (!(gGame.isOn)) return;
    if (gFirstMove) ginterval = setInterval(timer, 1000);
    var markedCell = gBoard[i][j];
    if (markedCell.isShown) return;
    if (markedCell.isMarked) {
        markedCell.isMarked = false;
        elCell.style.backgroundColor = 'grey';
        elCell.innerText = '';
        gGame.markedCount--;
    }
    else {
        gGame.markedCount++;
        markedCell.isMarked = true;
        elCell.innerText = flagIcon;
    }
    checkGameOver();
}

function timer() {
    gGame.secsPassed++;
    var hours = Math.floor(gGame.secsPassed / 3600);
    var minute = Math.floor((gGame.secsPassed - hours * 3600) / 60);
    var seconds = gGame.secsPassed - (hours * 3600 + minute * 60);
    var time = hours + ':' + minute + ':' + seconds
    gElTimeDisplay.innerHTML = time;
}

function renderCell(iIdx, jIdx, value, minesAround) {
    gGame.shownCount++;
    var elCell = document.querySelector(`#cell-${iIdx}-${jIdx}`);
    if (minesAround != 0) elCell.innerText = minesAround
    elCell.style.backgroundColor = value;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
