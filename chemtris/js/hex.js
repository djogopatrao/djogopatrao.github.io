window.onload = function() {

    var game = new Phaser.Game(420, 620, Phaser.CANVAS, '', { preload: preload, create: create, update: update });
    var hex,sizeX,sizeY;
    var a; // atom
    var aX,aY,myRotation=0;
    var state=0;
    var b; // rotating atom
    var currentAtom; // which is the current atom
    var centerx = 4, centery = 8, maxRadius=4;
    var initialCoordinates = { theta: 30, radius: 4, thetadiff:0 }
    var theta, radius, thetadiff;
    var map = Array()
    var gameStatus = 'ongoing'; // over,???
    //var atoms = ['H','O1','O2','C1','C2','C3']
    var atoms = ['H','O1','O2']
    var myTimer = 5000
    var rotation = 30

    window.game = game

    function preload () {

        game.scale.maxWidth=800;
        game.scale.maxHeight=1024;

        game.scale.scaleMode = Phaser.Stage.SHOW_ALL
        game.scale.setShowAll()
        game.scale.refresh()
        
        game.load.image('hex', 'img/hex.png'); // clean hexagon
        game.load.image('hex2', 'img/hex2.png'); // clean hexagon diff color

        for( i in atoms ) {
            for( angle=30; angle<=330; angle+=60 ) {
                var filename = "hex_atoms_"+atoms[i]+"_"+angle+".png";
                var spritename = atoms[i]+"_"+angle;
                game.load.image( spritename , 'img/'+filename );
            }
        }

        //game.load.image('atom', 'img/atom.png'); // atom hexagon
        //game.load.image('atomH', 'img/atomH.png'); // atom hydrogen
	sizeX = 62;
	sizeY = 62;        
    }

    function pos( x,y ) {
	if ( (x+y) %2 !=0 )
		return;
	posY = y*sizeY/2;
	posX = x*(sizeX-20);

	return {x:posX,y:posY}
    }

    function hexAt( x,y,sprite ) {
	myPos = pos(x,y)
	if ( myPos ) {
	        sp = game.add.sprite(myPos.x,myPos.y,sprite);
                return sp;
        }
        //map[x][y] = sprite
    }

    function onSpriteClickDown(sprite,pointer) {
        theta = sprite.polar.theta;
        thetadiff = sprite.polar.thetadiff;
        updateSprites()
    }

    function onCenterSpriteClickDown(sprite,pointer) {
        makeAtomFall();
        updateSprites()
    }

    function onAtomClickDown(sprite,pointer) {
        rotate()
        updateSprites()
    }

    function create () {

        alt = ['hex','hex2']

        radius = 0; theta = 0; thetadiff = 0;
        bPos = polar( theta, thetadiff, radius )
        i = bPos[0];
        j = bPos[1];
        if ( !map[i] )
            map[i] = Array()
        sp = hexAt(i,j,alt[(radius)%2]);
        sp.polar = { theta: theta, thetadiff: thetadiff, radius:radius };
        sp.inputEnabled=true;
        sp.events.onInputDown.add( onCenterSpriteClickDown, this );

	for ( radius=1;radius<5;radius++) {
            for ( theta=30;theta<360;theta+=60) {
                for ( thetadiff=0;thetadiff<radius;thetadiff++ ) {
                    bPos = polar( theta, thetadiff, radius )
                    i = bPos[0];
                    j = bPos[1];
                    if ( !map[i] )
                        map[i] = Array()
                    sp = hexAt(i,j,alt[(radius)%2]);
                    sp.polar = { theta: theta, thetadiff: thetadiff, radius:radius };
                    sp.inputEnabled=true;
                    sp.events.onInputDown.add( onSpriteClickDown, this );
                }
            }
        }

        createNewAtom()

        platforms = game.add.group();   
     
        //  Create our Timer
        timer = game.time.create(false);

        timer.loop(myTimer, updateCounter, this);

        //  Start the timer running - this is important!
        //  It won't start automatically, allowing you to hook it to button events and the like.
        timer.start();    
    }   

    function getRandomAtom() {
        return atoms[ Math.floor(Math.random()*atoms.length) ];
    }

    function getCurrentSpriteImage() {
        return currentAtom + "_" + (rotation%360);
    }

    function createNewAtom() {
        theta = initialCoordinates.theta
        radius = initialCoordinates.radius
        thetadiff = initialCoordinates.thetadiff

        currentAtom = getRandomAtom();
        bPos = polar( theta, thetadiff, radius )
        if ( isHexFilled( bPos[0], bPos[1] ) ) {
            return false;
        } else {
            b = hexAt( aX=bPos[0],aY=bPos[1], getCurrentSpriteImage() );

            b.inputEnabled=true;
            b.events.onInputDown.add( onAtomClickDown, this );

            return true;
        }
    }

    function isHexFilled( x, y ) {
        if ( map[x][y] )
            return 1;
        else
            return 0;
    }

    function atomWillCollideIfFall() {
        if (radius == 0 ) return true;
        r = evaluateRadiusDecreasement();
        targetPosition = polar( r.theta, r.thetadiff, r.radius );
        console.log(targetPosition)
        return isHexFilled( targetPosition[0], targetPosition[1] );
    }


    function updateCounter() {
        makeAtomFall()
        updateSprites()
    }

    function fixateAtom() {
        bPos = polar( theta, thetadiff, radius )
        newAtom = new ATOMS[currentAtom]();
        newAtom.rotation = rotation - 30
        map[bPos[0]][bPos[1]] = newAtom
        newAtom.setPositionInBoard( bPos[0], bPos[1] )
        newAtom.setSprite(b)
        atomsLinked = thereIsLinkageOnNewAtom(newAtom);
        if ( atomsLinked ) {
            for( i in atomsLinked ) {
                console.log("ligando");
                atomsLinked[i].atom.setLinkToAtom(atomsLinked[i].direction,newAtom);
                console.log(newAtom)
            }
            m = findMolecule(newAtom)
            if ( m )  {
                console.log("Fez molecula");
                points = vanishMolecule(m)
                alert("Pontos: "+points)
            }
        } 
        b.inputEnabled=false;
    }

    function vanishMolecule( m ) {
        var points = 0;
        var atomAlias = []
        for( i in m ) {
            atomAlias.push( m[i].alias )
            points += m[i].points;
            map[ m[i].getX()][ m[i].getY() ].getSprite().destroy();
            map[ m[i].getX()][ m[i].getY() ] = null;
        }
        console.log(atomAlias)
        return points
    }

    // BUG só checa na direção abaixo!
    function thereIsLinkageOnNewAtom(newAtom) {
        var result = []
        if ( radius>0 ) {
            r = evaluateRadiusDecreasement();
            otherPos = polar( r.theta, r.thetadiff, r.radius );
            checkedAtom = map[otherPos[0]][otherPos[1]];
            if ( checkedAtom.checkPossibleLinkage(newAtom,theta) ) {
                result.push( { atom: checkedAtom, direction: theta } );
            }
        }
        if ( result.length == 0 )
            return false;
        return result;
    }

    // BUG: molecula H-O- é molecula! não deveria ser
    function findMolecule(newAtom,visitedAtoms) {
        if ( !visitedAtoms ) {
            visitedAtoms = []
        }
        for( i in visitedAtoms ) {
            if ( visitedAtoms[i].id == newAtom.id )
                return visitedAtoms;
            }
        visitedAtoms.push(newAtom)
        for( i in ATOM.direction ) {
            direction = ATOM.direction[i];
            evaluatedAngle = direction;
            console.log("procurando ligacao na direcao"+direction)
            if ( newAtom.hasLink( evaluatedAngle ) ) {
                linkedAtom = newAtom.atomLinkedOnDirection(direction);
                if ( linkedAtom ) {
                    console.log("Tem atomo ligado")
                    tmp = findMolecule( linkedAtom, visitedAtoms )
                    if ( !tmp ) {
                        return false;
                    } else {
                        visitedAtoms = tmp
                    }
                } else {
                    console.log("Não tem e deveria ter")
                    return false
                }
            } else {
                console.log("Não tem ligação")
            }
        }
        console.log("molecula:")
        console.log(visitedAtoms);
        return visitedAtoms;
    }

    function makeAtomFall(){
        if ( ! atomWillCollideIfFall() )
            decreaseRadius()
        else {
            fixateAtom()
            if ( !createNewAtom() ) {
                gameOver()
            }
        }
    }

    function gameOver() {
        alert("Game Over!")
        gameStatus = 'over';
        timer.stop();
    }

    function evaluateRadiusDecreasement() {
       result = { radius: radius, theta: theta, thetadiff: thetadiff };
       if (result.radius>0) {
            result.radius --;
            result.thetadiff = Math.round( result.thetadiff / (result.radius+1) * result.radius );
        }
        return result;
    }

    function evaluateLeftRotation() {
       r = { radius: radius, theta: theta, thetadiff: thetadiff };
        if ( r.thetadiff<(r.radius-1) ) {
            r.thetadiff++;
        } else {
            r.theta = (r.theta+60) % 360;
            r.thetadiff=0;
        }
        return r
    }

    function evaluateRightRotation() {
       r = { radius: radius, theta: theta, thetadiff: thetadiff };
        if ( r.thetadiff>0 ) {
            r.thetadiff--;
        } else {
            r.theta = r.theta-60;
            if ( r.theta<0 )r.theta+=360;
            r.thetadiff=r.radius-1;
        }
        return r
    }

    function decreaseRadius(){
        r = evaluateRadiusDecreasement();
        radius = r.radius
        theta = r.theta
        thetadiff = r.thetadiff
    }

    function increaseRadius(){
        if (radius<maxRadius)
            radius ++;
    }

    function goLeft() {
        r = evaluateLeftRotation();
        bPos = polar( r.theta, r.thetadiff, r.radius );
        if ( !isHexFilled( bPos[0], bPos[1] ) ) {
            radius = r.radius
            theta = r.theta
            thetadiff = r.thetadiff
        }
    }

    function goRight() {
        r = evaluateRightRotation();
        bPos = polar( r.theta, r.thetadiff, r.radius );
        if ( !isHexFilled( bPos[0], bPos[1] ) ) {
            radius = r.radius
            theta = r.theta
            thetadiff = r.thetadiff
        }
    }

    function polar( Theta, Thetadiff, Radius ) {
        var x,y,dx=0,dy=0,ddx,ddy;
        dx = Math.round(2*Math.cos(Theta/180*Math.PI))/2;
        dy = -Math.round(2*Math.sin(Theta/180*Math.PI));
        console.log("theta: dx="+dx+" dy="+dy)
 
        // thetadiff
        ddx = Math.round(2*Math.cos((Theta+120)/180*Math.PI))/2;
        ddy = -Math.round(2*Math.sin((Theta+120)/180*Math.PI));
        console.log("thetadiff: ddx="+ddx+" ddy="+ddy)
        x = centerx + Radius*dx + Thetadiff*ddx;
        y = centery + Radius*dy + Thetadiff*ddy;
        return Array(x,y);
    }

    function rotate() {
        rotation = ( rotation + 60 ) % 360;
        b.loadTexture( getCurrentSpriteImage() )
    }

    function update() {
        if ( gameStatus != 'ongoing' )
            return;
	cursors = game.input.keyboard.createCursorKeys();
	if ( state == 0 ) {
		if ( cursors.left.isDown ) {
		    goLeft();
                    state = 1;
		}
		if ( cursors.right.isDown ) {
		    goRight();
                    state = 1;
		}
                if ( cursors.down.isDown) {
                    makeAtomFall();
                    state = 1;
                }
		if ( cursors.up.isDown ) { 
                    rotate();
                    state = 1;
		}
		if ( state == 1 ) {
                    updateSprites()
		}
	} else {
		if ( !cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown ) {
			state = 0;
		}
	}

    }

    function updateSprites() {
        console.log("theta="+theta+" | thetediff= "+thetadiff+" | rad="+radius)
        bPos = polar( theta, thetadiff, radius )
        console.log(bPos)
        bPos = pos( bPos[0], bPos[1] );
        console.log(bPos)
        b.x = bPos.x
        b.y = bPos.y
    }


};

