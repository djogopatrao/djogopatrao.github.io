window.onload = function() {

    var game = new Phaser.Game(453, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var c4, background;
    var state = 0;
    var boardXSize = 6;
    var boardYSize = 8;
    var board = new Array( boardXSize );
    var atoms = [ 'c4', 'h1' ];
    var speedUp = 0;
    var points = 0;

    function preload () {
        game.load.image('c4', 'img/c4.png'); // carbon 4
        game.load.image('h1', 'img/h1.png'); // hydrogen
        game.load.image('background', 'img/background.jpg'); // background

        for( var i=0;i<boardXSize;i++ ) {
            board[i] = new Array(boardYSize);
            for( var j=0; j<boardYSize;j++) {   
                board[i][j] = null;
            }
        }
    }

    function myRandom() {
        if ( Math.random() < 1/5 ) {
            return atoms[0]; // C
        } else {
            return atoms[1]; // H
        }
    }

    function newBlock() {
        /* TODO regular a distribuição dos átomos */
        var atom = myRandom();
        var c = game.add.sprite(64*boardXSize/2, 0, atom);
        c.anchor.setTo(0.5, 0.5); 
        c.atomType = atom;
        return c;
    }

    function create () {
        background = game.add.sprite( 0, 0, 'background' );
        platforms = game.add.group();        
        c4 = newBlock();
        //  Create our Timer
        timer = game.time.create(false);

        //  Set a TimerEvent to occur after 2 seconds
        timer.loop(5, updateCounter, this);

        //  Start the timer running - this is important!
        //  It won't start automatically, allowing you to hook it to button events and the like.
        timer.start();    
    }   

    function updateCounter() {
        c4.y+=1 + speedUp*4;
        if ( c4.y >= 64*boardYSize || checkCollisionDown() ) {
            stopBlock()
        }
    }

    function checkCollisionDown() {
        x = Math.floor( c4.x / 64 );
        y = Math.floor( c4.y / 64 );
        return ( board[x][y+1] || y == (boardYSize-1) ) ? true : false;
    }
    function checkCollisionLeft() {
        x = Math.floor( c4.x / 64 );
        y = Math.floor( c4.y / 64 );
        return ( board[x-1][y] ) ? true : false;
    }
    function checkCollisionRight() {
        x = Math.floor( c4.x / 64 );
        y = Math.floor( c4.y / 64 );
        return ( board[x+1][y] ) ? true : false;
    }

    function update() {
        cursors = game.input.keyboard.createCursorKeys();

        if ( state == 0 ) {
            if ( cursors.left.isDown && c4.x > (64*1) && ! checkCollisionLeft() ) {
                c4.x -= 64;
                state = 1;
            } else if ( cursors.right.isDown && c4.x < (64*(boardXSize-1)) && ! checkCollisionRight() ) {
                c4.x += 64;
                state = 1;
            } else if ( cursors.up.isDown ) {
                c4.angle = ( c4.angle + 90 ) % 360;
                state = 1;
            } 
        } else {
            if ( !cursors.left.isDown && !cursors.right.isDown  && !cursors.up.isDown) {
                state = 0;
            } 
        }
        if ( cursors.down.isDown ) {
            speedUp = 1;                
        } else { 
            speedUp = 0;
        }

        updateScore();
    }

    function updateScore() {
        document.getElementById('score').innerHTML = "Points: "+points;
    }

    function stopBlock() {
        if ( endgame() ) {
            gameover();
        } else {
            x = Math.floor( c4.x / 64 );
            y = Math.floor( c4.y / 64 );
            c4.x = x*64
            c4.y = y*64
            board[x][y] = c4;
            checkMolecules();
            c4 = newBlock();
            document.getElementById('fx_drop').play();
        }
    }

    function endgame() {
        return c4.y < 64;
    }

    function gameover() {
        c4 = null;
        alert("game over");
    }

    function checkMolecules() {
        var findMolecule=false;
        for( var i=0; i<boardXSize && !findMolecule; i++ ) {
            for( var j=0; j<boardYSize && !findMolecule; j++ ) {
                if ( board[i][j] ) {
                    switch( board[i][j].atomType ) {
                        case 'h1': 
                            console.log("tem H em "+i+","+j);
                            if( checkH2(i,j) ) {
                                removeH2(i,j)
                                findMolecule = true;
                                moveBoard();
                                points += 2;
                            }
                            break;
                        case 'c4': 
                            console.log("tem C em "+i+","+j);
                            if( checkCH4(i,j) ) {
                                removeCH4(i,j)
                                findMolecule = true;
                                moveBoard();
                                points += 4+12;
                            }
                            break;
                    }
                }
            }
        }
    }

    function getAngleAt( x, y)  {
        var angle = board[x][y].angle;
        while ( angle<0 ) {
            angle += 360;
        }
        return angle % 360;
    }

    function getComplementaryAngle( angle ) {
        return ( angle + 180 ) % 360;
    }

    function findH2( x, y ) {
        if ( board[x][y].atomType != 'h1' ) {
            console.log("nao é H em "+x+","+y);
            return false;
        }
        var newX, newY, newAngle, angle;

        // angle the other particle should have
        angle = getAngleAt( x, y );
        newAngle = getComplementaryAngle( angle );
        if( angle == 0 ) {
            newX = x+1; newY=y;
        } else
        if( angle == 90 ) {
            newX = x;   newY=y+1;
        } else
        if( angle == 180 ) {
            newX = x-1; newY=y;
        } else
        if( angle == 270 ) {
            newX = x;   newY=y-1;
        } else {
            console.log("dont know that angle="+(board[x][y].angle) + "("+angle+")");
            return false;
        }
        if ( !inBounds( newX, newY ) ) {
            console.log("out of bounds");
            return false;
        }
        console.log("testando H no angulo "+board[x][y].angle+" em "+newX+","+newY);
        if ( !board[newX][newY] )
            return false;
        if ( board[newX][newY].atomType == 'h1' && board[newX][newY].angle == newAngle )
            return [newX,newY];
        return false;
    }

    function inBounds( x, y ) {
        if ( x < 0 || x > boardXSize || y < 0 || y > boardYSize ) {
            console.log("out of bounds");
            return false;
        }
        return true;
    }

    function checkH2( x, y ) {
       return findH2(x,y) !== false;
    }

    function removeH2( x, y ) {
        newPos = findH2(x,y);
        board[x][y].destroy();
        board[newPos[0]][newPos[1]].destroy();
        board[x][y]=null;
        board[newPos[0]][newPos[1]]=null;
    }

    function removePosition(x,y) {
        board[x][y].destroy();
        board[x][y] = null;
    }

    function removeCH4( x, y ) {
        removePosition(x,y);
        removePosition(x,y+1);
        removePosition(x,y-1);
        removePosition(x+1,y);
        removePosition(x-1,y);
    }

    function boundAtomAt( dir, x, y ) {
        console.log("testando vinculos da posicao "+x+","+y+" na direcao "+dir);
        var bound = false;
        var newX,newY,angle;
        newX = x; newY = y;
        switch (dir) {
            case 'bottom': newY=y+1;angle=90;break;
            case 'top'   : newY=y-1;angle=270;break;
            case 'left'  : newX=x-1;angle=180;break;
            case 'right' : newX=x+1;angle=0;break;
        }
        if ( board[x][y].atomType == 'c4' ) {
            bound = true;
        }
        if ( board[x][y].atomType == 'h1' && getAngle(x,y) != angle ) {
            console.log('não tem vínculo de h1 na direção '+dir);
            return false;
        }
        if ( !inBounds( newX, newY ) ) {
            console.log('posicao '+newX+","+newY+" fora do tabuleiro");
            return false;
        }
        if ( !board[newX][newY] ) {
            console.log('posicao '+newX+","+newY+" não tem atomos");
            return false;
        }
        console.log('posicao '+newX+","+newY+" tem "+board[newX][newY].atomType);
        if ( board[newX][newY].atomType == 'c4' ) {
            console.log('vinculado a um C4');
            return 'c4';
        }
        if ( board[newX][newY].atomType == 'h1' ) {
            if ( getAngleAt( newX,newY ) == getComplementaryAngle(angle) ) {
                console.log('vinculado a um H1');
                return 'h1';
            } else {
                console.log('não vinculado a um H1 (angulo:'+getAngleAt(newX,newY));
                return false;
            }
        }
        console.log('não tem nada!');
        return false;
    }

    function checkCH4( x, y ) {
        console.log('testando CH4');
        if ( board[x][y].atomType != 'c4' ) {
            console.log("nao é C em "+x+","+y);
            return false;
        }
        return ( boundAtomAt( 'top', x, y ) == 'h1' &&
             boundAtomAt( 'bottom', x, y ) == 'h1' &&
             boundAtomAt( 'left', x, y ) == 'h1' &&
             boundAtomAt( 'right', x, y ) == 'h1' );
    }
    function moveBoard() {
        for( var i=0; i<boardXSize ; i++ ) {
            for( var j=boardYSize-1; j > 0 ; j-- ) {
                if ( !board[i][j] && !emptyColumn(i) ) {
                    pullColumn(i)
                }
            }
        }
    }

    function emptyColumn(i) {
        for( var j=0;j<boardYSize;j++ ) {
            if ( board[i][j] )
                return false;
        }
        return true;
    }

    function pullColumn(i) {
        for( var j=boardYSize-1; j>0; j-- ) {
            if ( board[i][j] ) continue;
            for( var j2=j-1;j2>0;j2-- ) {
                if ( board[i][j2] ) {
                    board[i][j] = board[i][j2];
                    board[i][j2] = null;
                    break;
                }
            }
            if( board[i][j] ) {
                board[i][j].y = j*64;
                console.log("atualizando posicao y para "+j*64);
            }
        }
    }

};
