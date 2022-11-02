var board = [];
var boardSize;
var minNum = 5;
var visible = true;
var xWins = 0;
var oWins = 0;
var xoTied = 0;
var cellSize;
var contSize;
var step;
var turn;
var finished = false;
var X_Player = 0;
var O_Player = 111;
var lockedMenu = false;
var changeVis;
var addDelay;
var startSavedGame = false;
var storedGame = 0; //localStorage
var zoomed = false;
var restarted = false;


function $(id) { return document.getElementById(id); }
var m = $("min-num");

///// START SAVED GAME  //////
(function () {
    if (Storage && localStorage) {
        if (localStorage.hasOwnProperty("allParams")) {
            storedGame = JSON.parse (localStorage.allParams);
            
            boardSize = storedGame.boardSize;
            minNum = storedGame.minNum;
            
            $("board-size").value = boardSize;
            m.value = minNum;
            setMinNumRange();
            
            
            
            if (storedGame.hasOwnProperty("X_Player")) {
                X_Player = storedGame.X_Player;
                switch (X_Player) {
                    case 0:
                        $("p1-person").checked = true;
                        break;
                    case 1:
                        $("p1-easy").checked = true;
                        break;
                    case 11:
                        $("p1-medium").checked = true;
                        break;
                    case 111:
                        $("p1-hard").checked = true;
                        break;
                    default:
                        break;
                }
            }
                    

            if (storedGame.hasOwnProperty("O_Player")) {
                O_Player = storedGame.O_Player;
                switch (O_Player) {
                    case 0:
                        $("p2-person").checked = true;
                        break;
                    case 1:
                        $("p2-easy").checked = true;
                        break;
                    case 11:
                        $("p2-medium").checked = true;
                        break;
                    case 111:
                        $("p2-hard").checked = true;
                        break;
                    default:
                        break;
                }
            }
               
            if ((storedGame.xWins + storedGame.oWins + storedGame.xoTied > 0 || storedGame.step > 0)) {
                
                var ask = confirm ("Do you want to continue last game?")
                if (ask) {
                    startSavedGame = true;
                    unlockMenu();
                } else {
                    startSavedGame = false;
                }
            }
        }
    } 
    
    
} ) ()

function getBoardSize() {
    var e = $("board-size");
    var brd_Size = Number(e.options[e.selectedIndex].value);  //amount of cells in one direction
    return brd_Size;
}

function getPlayers(XorO, value) {
    if (XorO == 1) {
        X_Player = parseInt(value);
        if (X_Player > 0) {
            $("p2-person").checked = true;
            O_Player = 0;
        }
        
    } else {
        O_Player = parseInt(value);
        if (O_Player > 0) {
            $("p1-person").checked = true;
            X_Player = 0;
        }
    }
}


function setMinNumRange() {
    
    boardSize = getBoardSize();
    
    
    m.max = boardSize;
    
    if (boardSize <= 5) {
        m.min = boardSize;
        m.value = boardSize;
    } else {
        m.min = 5;
        if (m.value >=5 && m.value <= boardSize) {
            minNum = m.value;    
        } else {
            m.value = minNum = 5;
        }
    }
    
    if (m.max == m.min) {
        m.disabled = true;
    } else {
        m.disabled = false;
    }

    minNum = parseInt(m.value);
}


function setCellSize(zoom) {
    var w = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    var h = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;


    var cell = document.getElementsByClassName("cell");

    var cellAmount = cell.length;

    var brdSize = Math.sqrt(cellAmount);

    var availSize = Math.min(w - 30, h) - 10;



    var maxCellSize = (availSize - 12 - brdSize*5)/brdSize; //maxCellSize is available cell size


    if (zoom == 1) {
        cellSize = (1.15*cellSize > maxCellSize) ? maxCellSize : 1.15*cellSize;
        zoomed = true;
    } 
    else if (zoom == -1) {
        cellSize = (0.85*cellSize < 25) ? 25 : 0.85*cellSize;
        zoomed = true;
    } 
    else if (zoom == 0) {
        zoomed = false;
        if (maxCellSize < 100) {
            cellSize = (maxCellSize < 25) ? 25 : maxCellSize;
        } else {
            cellSize = 100;
        }
    } 
    else if (!zoomed) {
        if (maxCellSize < 100) {
            cellSize = (maxCellSize < 25) ? 25 : maxCellSize;
        } else {
            cellSize = 100;
        }
    }

    contSize = brdSize*(cellSize + 5) + 12;


    if (cellSize >= maxCellSize) {
        $("zoom-in").disabled = true;
    } else {
        $("zoom-in").disabled = false;
    }

    if (cellSize == 25) {
        $("zoom-out").disabled = true;
    } else {
        $("zoom-out").disabled = false;
    }

    if ((cellSize == 25 && contSize > availSize) || (contSize == availSize)) {
        $("zoom-fit").disabled = true;
    } else {
        $("zoom-fit").disabled = false;
    }
    
    cont.style.width = contSize + "px";
    cont.style.height = contSize + "px"; 



    for (var i = 0; i < cellAmount; i++) {

        cell[i].style.width = cellSize + "px";
        cell[i].style.height = cellSize + "px";
    }
}

function saveGame() {
    //console.log("saved!");
    if (Boolean(board[0]) && localStorage) {
        var allParams = {};
        
        //console.log(xWins + ":" + oWins + ":" + xoTied);

        if (!finished && step > 0) {
            allParams.board = board;
            allParams.turn = turn;
            allParams.step = step;
        }

        allParams.boardSize = boardSize;
        allParams.minNum = minNum;
        allParams.xWins = xWins;
        allParams.oWins = oWins;
        allParams.xoTied = xoTied;
        allParams.X_Player = X_Player;
        allParams.O_Player = O_Player;

        localStorage.allParams = JSON.stringify(allParams);
    }
}


function showMenu() {

    if (visible) {
        visible = false;
        $("menu").className = "menu hidden";
        $("arrow").className = "arrow visible show_menu";
    } else {
        visible = true;
        $("menu").className = "menu visible";
        $("arrow").className = "arrow visible hide_menu";
    }
}


function unlockMenu() {
    if (lockedMenu) {
        lockedMenu = false;
        $("start-btn").value = "Start Game!";
        
        m.disabled = false;
        $("board-size").disabled = false;
        
        
        var p1radio = document.getElementsByName("p1");
        for (var k = 0; k < p1radio.length; k++) {
            p1radio[k].disabled = false;
        }
        
        var p2radio = document.getElementsByName("p2");
        for (k = 0; k < p2radio.length; k++) {
            p2radio[k].disabled = false;
        }
        finished = true;
        clearTimeout(changeVis);
        clearTimeout(addDelay);
        xWins = 0;
        oWins = 0;
        xoTied = 0;
        
        if (m.max == m.min) {
            m.disabled = true;
        }
        
    } else {
        lockedMenu = true;
        $("start-btn").value = "Stop Game!";
        m.disabled = true;
        $("board-size").disabled = true;


        var p1radio = document.getElementsByName("p1");
        for (var k = 0; k < p1radio.length; k++) {
            p1radio[k].disabled = true;
        }

        var p2radio = document.getElementsByName("p2");
        for (k = 0; k < p2radio.length; k++) {
            p2radio[k].disabled = true;
        }

        startGame(startSavedGame);
        changeVis = setTimeout(function(){showMenu();},800)  //hide menu
    }  
}



function startGame(saved) {
    
    var C_X = 1;
    var C_O = -1;
    var C_EMPTY = 0;
    var AIresult;
    var lastCell = {};
  
    setMinNumRange();
    m.disabled = true;
    minNum = parseInt(m.value);
    
    finished = false; //restarts game


    var cont = $("cont");
    cont.innerHTML = ""; //clear container
    cont.className = "container visible";
    $("cont").style.background = "#919192";
    $("cont").style.borderColor = "#919192";
    
    
    if (storedGame) {
        if (saved && storedGame.hasOwnProperty("board")) {
            turn = storedGame.turn;
            step = storedGame.step;
            xWins = storedGame.xWins;
            oWins = storedGame.oWins;
            xoTied = storedGame.xoTied;
        } else {
            turn = C_X;
            step = 0;
            boardSize = getBoardSize();
        }
    } else {
        
        turn = C_X; //always should start X
        step = 0;
        boardSize = getBoardSize();
        
    }
        
            
    for (var i = 0; i < boardSize; i++) {  //creating cells
        board[i] = [];
        for (var j = 0; j < boardSize; j++) {
            addCell(i, j);
        }
    }


    function addCell(x, y) {
        var div = document.createElement('div');        
        cont.appendChild(div);

        if (saved && storedGame.hasOwnProperty("board")) {
            var cellStateTemp = storedGame.board[x][y].state;
            board[x][y] = {state: cellStateTemp, element: div };
            if (cellStateTemp == C_X) {
                board[x][y].element.className = "cell cell-x";
            } 
            else if (cellStateTemp == C_O) {
                board[x][y].element.className = "cell cell-o";
            } else {
                board[x][y].element.className = "cell";
            }


        } else {
            board[x][y] = { state: C_EMPTY, element: div };
            div.className = "cell";
        }

        div.addEventListener("click", function() {
            if (!finished && ((turn == C_X && X_Player == 0) || (turn == C_O && O_Player == 0))) {
                addXO(x, y);
            }
        });
        
        div.addEventListener("mouseover", function() {
            if (!finished && board[x][y].state == 0) {
                if (turn == C_X && X_Player == 0) {
                    div.className += " cell-x-hover";
                }
                else if (turn == C_O && O_Player == 0) {
                    div.className += " cell-o-hover";
                }
            }});
        
        div.addEventListener("mouseout", function() {
            if (!finished && board[x][y].state == 0) {
                if (turn == C_X && X_Player == 0) {
                    div.className = "cell";
                }
                else if (turn == C_O && O_Player == 0) {
                    div.className = "cell";
                }
            }});
    }
    
    startSavedGame = false;
    storedGame = 0;
    
    if (Storage && localStorage) {
        if (localStorage.hasOwnProperty("allParams")) {
            localStorage.removeItem("allParams");
        }
    }
    
    setCellSize();
    changeBackgroundColor();

    
    function addXO(x, y) {
         if (board[x][y].state == C_EMPTY) {
            
            board[x][y].state = turn;
            step++;
            if (turn == C_X) {
                if (lastCell.hasOwnProperty("x")) {
                    board[lastCell.x][lastCell.y].element.className = "cell cell-o";
                }
                board[x][y].element.className = "cell cell-x";
                turn = C_O;
            } else {
                if (lastCell.hasOwnProperty("x")) {
                    board[lastCell.x][lastCell.y].element.className = "cell cell-x";
                }
                board[x][y].element.className = "cell cell-o";
                turn = C_X;
            } 
            board[x][y].element.className += " last";
            lastCell = {x: x, y: y};
        }
        
        findWinner(x, y);
    }
    
    function findWinner(x, y) {

        var ix = 0, io = 0, iMin, iMax, jMin, jMax, rightMaxStep, leftMaxStep, maxSteps;
        var lastXO = 0;
        var lastWinner = 0;
        var winnerCells = [];
        var num = 0;
        var stopChecking = false;
                
        restarted = false;
        
        //HORIZONTAL
        setVarValue ("h");

        for (j = jMin; j <= jMax && !stopChecking; j++) {
            countXO(x, j);
        }
        
        regularChecking();

        
        //VERTICAL
        setVarValue("v");
        
        for (i = iMin; i <= iMax && !stopChecking; i++){
            countXO(i, y);
        }
        
        regularChecking();


        //FIRST DIAGONAL (from upper right corner to lower left corner)
        setVarValue("d1");

        if (maxSteps >= minNum) {
            var xx, yy;
            for (var t = 0; t < maxSteps && !stopChecking; t++) {
                xx = x-rightMaxStep+t;
                yy = y+rightMaxStep-t;
                countXO(xx, yy);
            }
            
            regularChecking();
        }

        //SECOND DIAGONAL (from upper left corner to lower right corner)
        setVarValue("d2");

        if(maxSteps>=minNum){
            for(t=0; t<maxSteps && !stopChecking; t++){
                xx = x-leftMaxStep+t;
                yy = y-leftMaxStep+t;
                countXO(xx, yy);
            }
            
            regularChecking();
        }
        
        checkForWinner();
        
        
        

        function setVarValue(axis) {
            switch (axis) {
                case "h": //horizontal
                    jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                    jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);
                    break;

                case "v": //vertical
                    iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                    iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);
                    break;

                case "d1": //first diagonal (from upper right corner to lower left corner)
                    iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                    iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);

                    jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                    jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);

                    rightMaxStep = Math.min((x-iMin),(jMax - y));
                    leftMaxStep = Math.min((iMax - x),(y-jMin));
                    maxSteps = rightMaxStep+leftMaxStep+1;
                    break;

                case "d2": //second diagonal (from upper left corner to lower right corner)
                    iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                    iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);

                    jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                    jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);

                    rightMaxStep = Math.min((iMax-x),(jMax - y));
                    leftMaxStep = Math.min((x-iMin),(y-jMin));
                    maxSteps = rightMaxStep+leftMaxStep+1; 
                    break;
            } 
        }


        function countXO(x, y) {
            if (board[x][y].state == C_X) {
                if (lastXO == C_O && io >= minNum) {
                    stopChecking = true;
                } else {
                    winnerCells[num + ix] = {x: x, y: y, win: board[x][y].state};
                    ix++;
                    io = 0;
                    lastXO = C_X;
                }
            }
            else if (board[x][y].state == C_O) {
                if (lastXO == C_X && ix >= minNum) {
                    stopChecking = true;
                } else {
                    winnerCells[num + io] = {x: x, y: y, win: board[x][y].state};
                    io++;
                    ix = 0;
                    lastXO = C_O;
                }
            }
            else if (Math.max(ix,io) < minNum) {
                ix = 0;
                io = 0;
                lastXO = 0;
            } 
            else if (Math.max(ix,io) >= minNum) {
                stopChecking = true;
            }
        }

        
        function regularChecking() {
            
            if (Math.max(ix,io) >= minNum) {
                if (ix > io) {
                    num += ix;
                    lastWinner = C_X;
                } else {
                    num += io;
                    lastWinner = C_O;
                }
            } else {
                var extra = winnerCells.length - num;
                for (var i = 0; i < extra; i++) {
                        winnerCells.pop();
                }
            }
            
            ix = 0;
            io = 0;
            stopChecking = false;
        }
        
        
        function checkForWinner() {
            
            if (winnerCells.length >= minNum) {
                finished = true;
                if (winnerCells[0].win == 1) {
                    setTimeout(function() {
                        for (var i = 0; i < winnerCells.length; i++) {
                            var x = winnerCells[i].x;
                            var y = winnerCells[i].y;
                            board[x][y].element.className += " winner";
                        }
                        setTimeout(function() {announceWinner(C_X);}, 2000);
                    }, 800);
                    
                } else {
                    setTimeout(function() {
                        for (var i = 0; i < winnerCells.length; i++) {
                            var x = winnerCells[i].x;
                            var y = winnerCells[i].y;
                            board[x][y].element.className += " winner";
                        }
                        setTimeout(function() {announceWinner(C_O);}, 2000);
                    }, 800);
                } 
            }
            else if (step == Math.pow(boardSize, 2)){
                
                announceWinner();
                
            } else {
                checkForTied();
            }
        }  
    }
    
    
    checkAIturn();
    
    function checkAIturn() {
        if (!finished && turn == C_X && X_Player > 0) {
            
            var difficulty = (X_Player).toString().length;
           
            if (AIresult) {
                
                if (AIresult.diff != difficulty) {
                    AIresult = getNextStep(turn, difficulty);
                }
            }
            
            AIresult = getNextStep(turn, difficulty);
            addDelay = setTimeout (function () {
                        addXO(AIresult.coord.x, AIresult.coord.y);}, difficulty*400);
        }
                
        else if (!finished && turn == C_O && O_Player > 0) {
             
            var difficulty = (O_Player).toString().length;
           
            if (AIresult) {
                if (AIresult.diff != difficulty) {
                    AIresult = getNextStep(turn, difficulty);
                }
            } else {
                AIresult = getNextStep(turn, difficulty);
            }
            
            addDelay = setTimeout (function () {
                        addXO(AIresult.coord.x, AIresult.coord.y);}, difficulty*400);
        }
    }
    
    
    function checkForTied() {
        
        AIresult = getNextStep(turn, 3);
        
        if (AIresult.coord.Xweight + AIresult.coord.Oweight == 0) {
            AIresult = 0;
            announceWinner();
        } else {
            changeBackgroundColor();
            checkAIturn();
        }
    }
    
    function changeBackgroundColor() {
        var dang;
        var color;
        var max;
        if (!AIresult) {
            AIresult = getNextStep(turn, 2);
        }
        var xW = AIresult.coord.Xweight;
        var oW = AIresult.coord.Oweight;
        
        
        
        if (xW >= oW) {
            color = 240;
        } else {
            color = 0;
        }
        
        max = Math.pow(10, minNum);
        dang = (step == 0) ? 0 : 70*Math.abs(Math.log(10)/Math.log(Math.abs((Math.max(xW, oW))/max)));
        console.log(dang);
        $("cont").style.background = "hsla(" + color + "," + dang + "%,47%,1)";
        $("cont").style.borderColor = "hsla(" + color + "," + dang + "%,47%,1)";
    }

    
    function clearBoard() {
        for (var i = 0; i < boardSize; i++) {  //resettig cells
            for (var j = 0; j < boardSize; j++) {
                board[i][j].state = C_EMPTY;
            }
        }
        var cells = document.getElementsByClassName("cell");
        for (var k = 0; k < cells.length; k++) {
            cells[k].className = "cell";
        }

        ix = 0;
        io = 0;
        step = 0;
        
    }
    
    function announceWinner(winner) {
        var announce;
        if (winner == C_X) {
            xWins++;
            announce = "The winner is X";
        }
        else if (winner == C_O) {
            oWins++;
            announce = "The winner is O";
        } else {
            xoTied++;
            announce = "We tied";
        }

        var ask = confirm (announce + " !!!\n\n\nX wins: " + xWins + "\nO wins: " + oWins + 
                   "\nIt was tied: " + xoTied + "\n\n\nDo you want to restart game?");
        
        $("cont").style.background = "#919192";
        $("cont").style.borderColor = "#919192";
        
        if (ask) {
            clearBoard();
            restarted = true;
            turn = C_X;
            checkAIturn();
            finished = false;
            
        } else {
            visible = false;
            showMenu();
            unlockMenu();
            finished = true;
        }
        
        lastCell = {};
    }
}
   

function getNextStep(turn, diff) {
    var w = [];  // weight metrix
    var iX = 0;  // amount of Xs
    var iO = 0;  // amount of Os
    var pX = 0;  // amount of potential Xs
    var pO = 0;  // amount of potention Os
    var nX = 0;  // neighbor X
    var nO = 0;  // neighbor O
    var C_X = 1;
    var C_O = -1;
    var C_EMPTY = 0;
    var openedSide = 0;
    var lastXO = 0;
    var empty = false;
    var weight = 0;
    var stop = false;
    var XtotalWeight = 0;
    var OtotalWeight = 0;

    
    for (var i = 0; i < boardSize; i++) {
        w[i] = [];
        for (var j = 0; j < boardSize; j++) {
            if (board[i][j].state !== C_EMPTY) {
                w[i][j] = {weight: -1};
            } else {
                var k = 0;
                var t, xx, yy;
                weight = 0;
                XtotalWeight = 0;
                OtotalWeight = 0;
                //Horizontal
                setRanges(i, j, "h");

                //(right part)
                stop = false;
                for (k = j+1; (k <= jMax) && !stop; k++) {
                    evaluateCell(i, k);
                }

                //(left part)
                empty = false;
                lastXO = 0;
                stop = false;
                for (k = j-1; (k >= jMin) && !stop; k--) {
                    evaluateCell(i, k);
                }

                countWeight(turn);


                //Vertical
                empty = false;
                lastXO = 0;
                stop = false;
                setRanges(i, j, "v");

                //(upper part)
                empty = false;
                lastXO = 0;
                stop = false;
                for (k = i-1; (k >= iMin) && !stop; k--) {
                    evaluateCell(k, j);
                }

                //(lower part)
                empty = false;
                lastXO = 0;
                stop = false;
                for (k = i+1; (k <= iMax) && !stop; k++) {
                    evaluateCell(k, j);
                }

                countWeight(turn);



                //First diagonal
                setRanges(i, j, "d1");

                if (maxSteps >= minNum) {
                    //(to upper right corner)
                    empty = false;
                    lastXO = 0;
                    stop = false;
                    for (t = 1; (t <= rightMaxStep) && !stop; t++) {
                        xx = i - t;
                        yy = j + t;
                        evaluateCell(xx, yy);
                    }
                    //to lower left corner
                    empty = false;
                    lastXO = 0;
                    stop = false;
                    for (t = 1; (t <= leftMaxStep) && !stop; t++) {
                        xx = i + t;
                        yy = j - t;
                        evaluateCell(xx, yy);
                    }

                    countWeight(turn);
                }




                //Second diagonal
                setRanges(i, j, "d2");

                if (maxSteps >= minNum) {
                    
                    //(to upper left corner)
                    empty = false;
                    lastXO = 0;
                    stop = false;
                    for (t = 1; (t <= leftMaxStep) && !stop; t++) {
                        xx = i - t;
                        yy = j - t;
                        evaluateCell(xx, yy);
                    }


                    //to lower right corner 
                    empty = false;
                    lastXO = 0;
                    stop = false;
                    for (t = 1; (t <= rightMaxStep) && !stop; t++) {
                        xx = i + t;
                        yy = j + t;
                        evaluateCell(xx, yy);
                    }

                    countWeight(turn);
                }

                w[i][j] = {
                    weight: weight,
                    Xweight: XtotalWeight,
                    Oweight: OtotalWeight};
                
                weight = 0;
            }
        }
    }
    
    


    function setRanges(x, y, axis) {
        switch (axis) {
            case "h": //horizontal
                jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);
                break;

            case "v": //vertical
                iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);
                break;

            case "d1": //first diagonal (from upper right corner to lower left corner)
                iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);

                jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);

                rightMaxStep = Math.min((x-iMin),(jMax - y));
                leftMaxStep = Math.min((iMax - x),(y-jMin));
                maxSteps = rightMaxStep+leftMaxStep+1;
                break;

            case "d2": //second diagonal (from upper left corner to lower right corner)
                iMin = (x-minNum+1<0) ? 0: (x-minNum+1);
                iMax = (x+minNum-1<boardSize) ? (x+minNum-1): (boardSize-1);

                jMin = (y-minNum+1<0) ? 0: (y-minNum+1);
                jMax = (y+minNum-1<boardSize) ? (y+minNum-1): (boardSize-1);

                rightMaxStep = Math.min((iMax-x),(jMax - y));
                leftMaxStep = Math.min((x-iMin),(y-jMin));
                maxSteps = rightMaxStep+leftMaxStep+1; 
                break;
        } 
    }


    function evaluateCell(x, y) {
        if (board[x][y].state == C_EMPTY) {
            if (lastXO == C_X) {
                if (empty == false) {
                    openedSide++;
                }
                pX++;
                empty = true;
            } else if (lastXO == C_O) {
                if (empty == false) {
                    openedSide++;
                }
                pO++;
                empty = true;
            } else {
                if (empty == false) {
                    openedSide++;
                }
                pX++;
                pO++;
                empty = true;
            }
        }
        else if (board[x][y].state == C_X) {
            if (lastXO != C_O && empty == false) {
                nX++;
                pX++;
                iX++;
                lastXO = C_X;
            }
            else if (lastXO != C_O) {
                pX++;
                iX++;
                lastXO = C_X;
            } 
            else if (lastXO == C_O) {
                stop = true;
                return;
            }
        } 
        else if (board[x][y].state == C_O) {
            if (lastXO != C_X && empty == false) {
                nO++;
                pO++;
                iO++;
                lastXO = C_O;
            }
            else if (lastXO != C_X) {
                pO++;
                iO++;
                lastXO = C_O;
            } 
            else if (lastXO == C_X) {
                stop = true;
                return;
            }
        } 

    }


    function countWeight(turn) {
        var weightX = 0;
        var weightO = 0;
        
        
        if (diff == 3) {   ///hard
            
            weightX = (pX+1 < minNum) ? 0 : (pX + 10*iX + Math.pow(10, nX)*(1 + openedSide));
            weightO = (pO+1 < minNum) ? 0 : (pO + 10*iO + Math.pow(10, nO)*(1 + openedSide));

            if (turn == C_X) {
                weight += 1.1*weightX + weightO;
                weight = (nX >= minNum-1) ? 10*weight : weight;
            } else { 
                weight += weightX + 1.1*weightO;
                weight = (nO >= minNum-1) ? 10*weight : weight;
            }
            
        } 
        
        
        
        else if (diff == 2) {  ///medium
            
            if (pX+1 < minNum) {
                weightX = 0;
            } else {
                weightX = pX + 10*iX + Math.pow(10, nX-1)*(1 + openedSide);
                if (nX >= minNum-1) {
                    weightX = 1000*weightX;
                }
                else if ((nX >= minNum-2) && (openedSide == 2)) {
                    weightX = 200*weightX;
                }
            }
            
            
            if (pO+1 < minNum) {
                weightO = 0;
            } else {
                weightO = pO + 10*iO + Math.pow(10, nO-1)*(1 + openedSide);
                if (nO >= minNum-1) {
                    weightO = 1000*weightO;
                }
                else if ((nO >= minNum-2) && (openedSide == 2)) {
                    weightO = 200*weightO;
                }
            }
            
          
            if (turn == C_X) {
                weight += 1.1*weightX + weightO;
            } else { 
                weight += weightX + 1.1*weightO;
            }
            
        }
        
        
        else if (diff == 1) {  ///easy
            
            weightX = (pX+1 < minNum) ? 0 : (pX + 10*iX);
            weightO = (pO+1 < minNum-1) ? 0 : (pO + 10*iO);
            
            if (nX >= minNum-1) {
                    weightX = 100*weightX;
                }
            else if ((nX >= minNum-2) && (openedSide == 2)) {
                weightX = 15*weightX;
            }

            weight += weightX + weightO;
        }
        
        XtotalWeight += weightX;
        OtotalWeight += weightO;
        iX = iO = pX = pO = nX = nO = openedSide = lastXO = 0;
        empty = false;
    }

    function getMaxCoord() {
        
        var k = 0;
        var m = [];
        var max = w[0][0].weight;
        
        //console.log(w);

        for (var i = 0; i < boardSize; i++) {
            for (var j = 0; j < boardSize; j++) {
                if (w[i][j].weight > max) {
                    max = w[i][j].weight;
                    m = [];
                    m[0] = {
                        x: i, 
                        y: j, 
                        Xweight: w[i][j].Xweight, 
                        Oweight: w[i][j].Oweight};
                    k = 1;
                }
                else if (w[i][j].weight == max) {
                    m[k] = {
                        x: i, 
                        y: j, 
                        Xweight: w[i][j].Xweight, 
                        Oweight: w[i][j].Oweight};
                    k++; 
                }
            }
        }
        
        if (max >= 0) {
            var l = m.length;
            //console.log (l);
            for (var z = 0; z < l; z++) {
                //console.log (m[z]);
            } 
            var rand = Math.floor(Math.pow(boardSize, 2) * Math.random());
            var id = rand % l;
            //console.log (max);
            return m[id];

        } else {
            return ;
        }
        
    }
    
    var result = {};
    result.coord = getMaxCoord(); 
    result.diff = diff;
    
    return result;
}