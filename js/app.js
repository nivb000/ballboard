var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />';

var gBoard;
var gGamerPos;
var gBallIntervalId
var gGlueIntervalId
var gBallsCounter
var gBallsEat
var gIsStuck

function initGame() {

    gGamerPos = { i: 2, j: 9 };
    gBallsCounter = 0
    gBallsEat = 0
    gIsStuck = false
    clearInterval(gBallIntervalId)
    clearInterval(gGlueIntervalId)
    gBoard = buildBoard();
}

function startGame() {
    renderBoard(gBoard);
    randomBalls(gBoard)
    randomGlue(gBoard)
}

function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)


    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }

            board[i][j] = cell;

        }
    }

    board[0][6].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR
    board[9][6].type = FLOOR
    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL;
    board[7][4].gameElement = BALL;
    board[1][2].gameElement = BALL;
    gBallsCounter = 3

    return board;
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i}, ${j})" >\n`;

            switch (currCell.gameElement) {
                case GAMER:
                    strHTML += GAMER_IMG;
                    break
                case BALL:
                    strHTML += BALL_IMG;
                    break

                case GLUE:
                    strHTML += GLUE_IMG
                    break
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

    var isInBound = false
    
    switch (i) {
        case -1:
            i = 9
            isInBound = true
            break;
    
        case gBoard.length:
            i = 0;
            isInBound = true
            break;
    }
    switch (j) {
        case -1:
            j = 11
            isInBound = true
            break;
    
        case gBoard[0].length:
            j = 0;
            isInBound = true
            break;
    }

    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;


    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    // If the clicked Cell is one of the four allowed
    if (!gIsStuck) {
        
        if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || isInBound) {

            if (targetCell.gameElement === BALL) {
                eatBall()
            }

            if (targetCell.gameElement === GLUE) {
                gIsStuck = !gIsStuck
                setTimeout(() => {
                    gIsStuck = !gIsStuck
                }, 3000);
            }            

            // MOVING from current position
            // Model:
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
            // Dom:
            renderCell(gGamerPos, '');

            // MOVING to selected position
            // Model:
            gGamerPos.i = i;
            gGamerPos.j = j;
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
            // DOM:
            renderCell(gGamerPos, GAMER_IMG);
        }
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;

    }

}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = `cell-${location.i}-${location.j}`;
    return cellClass;
}


function getRandCell(board) {

    var emptyCells = []

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            if (currCell.gameElement === null && currCell.type !== WALL) {
                emptyCells.push({ i, j })
            }

        }

    }

    var randIdx = getRandomInt(0, emptyCells.length - 1)
    var randCell = emptyCells[randIdx]
    return randCell
}

function randomBalls(board) {

    gBallIntervalId = setInterval(() => {
        var randCell = getRandCell(board)

        gBoard[randCell.i][randCell.j].gameElement = BALL
        renderCell(randCell, BALL_IMG)
        gBallsCounter++

    }, 3000);

}

function eatBall() {

    var audio = document.querySelector("audio")
    audio.play()

    var elBallsEat = document.querySelector("h3")

    gBallsEat++

    elBallsEat.innerText = `Balls Eat: ${gBallsEat}`

    gBallsCounter--

    checkEndGame()

}

function randomGlue(board) {

    gGlueIntervalId = setInterval(() => {

        var randCell = getRandCell(board)

        gBoard[randCell.i][randCell.j].gameElement = GLUE
        renderCell(randCell, GLUE_IMG)

        setInterval(() => {

            gBoard[randCell.i][randCell.j].gameElement = null
            renderCell(randCell, '')

        }, 3000);

    }, 5000);


}


function checkEndGame() {

    var elWin = document.querySelector("h5")

    
    
    if (gBallsCounter) return
    
    clearInterval(gBallIntervalId);
    clearInterval(gGlueIntervalId);
    elWin.style.display = 'inline'
}