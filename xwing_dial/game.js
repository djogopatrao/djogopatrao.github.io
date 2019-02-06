// the game itself
var game;

// 
var init_dials = [];

// the spinning wheel DIALS
var wheel = {};

// the back of the DIALS
var dial_backs = {}

var drag_event=null;

// how many maneuvers on eah dial
var dial_movements = {   "attack_shuttle": 17,
    "auzituck": 15,
    "awing": 17,
    "bwing": 17,
    "ewing": 20,
    "firespray": 17,
    "headhunter": 16,
    "kwing": 11,
    "hwk": 15,
    "quadjumper": 18,
    "sheathipede": 16,
    "starfighter": 15,
    "t65_xwing": 17,
    "uwing": 13,
    "vcx100": 17,
    "yt1300": 17,
    "yt2400": 17,
    "ywing": 14
};
var angles = {}
var dials;

window.onload = function() {	
    if ( !window.sessionStorage.getItem('xwingDials') ) {
    } else {

        var obj = JSON.parse( window.sessionStorage.getItem('xwingDials') )

        dials  = obj.dials
        angles = obj.angles
        init_dials = obj.init_dials

        init_playarea()
    }


    // hook events to the form
    $('#select-dial').on('change',function(){
        init_dials.push( $('#select-dial').val() );
        var txt="";
        $(init_dials).each(function(i,v){txt+=v+"<br>"});
        $('#dial-list').html(txt);
        $('#select-dial').val("");
    });

    // hook events to the form
    $('#show-dial-button').on('click',function(){
        dials = init_dials.length;
        for( var i=0;i<dials;i++ ) {
            angles["wheel_"+i] = 0;
        }
        init_playarea();
    });

}

function init_playarea() {
    // creation of a 458x488 game
    game = new Phaser.Game(458, 350*dials, Phaser.AUTO, "main");
    // adding "PlayGame" state
    game.state.add("PlayGame",playGame);
    // launching "PlayGame" state
    game.state.start("PlayGame");

    $('#menubar').hide();
    $('#dial-list').hide();
}

// PLAYGAME STATE
	
var playGame = function(game){};

playGame.prototype = {
     // function to be executed once the state preloads
     preload: function(){
            // preloading graphic assets
            $(init_dials).each(function(i,v){
                game.load.image(v+"_dial", "dials/"+v+"_dial.png");
            });
            game.load.image("back", "dials/dial_back.png");
            game.load.image("rebel_back", "dials/rebel_dial_back.png");
            game.load.image("pin", "pin.png");     
     },
     // funtion to be executed when the state is created
  	create: function(){
        // giving some color to background
        game.stage.backgroundColor = "#880044";

        for (var i=0;i<dials;i++) {
            var key = "wheel_"+i;
            // add the back dial
            var backdial = game.add.sprite(game.width /2 , 350*(i+0.5), "rebel_back" );
            backdial.anchor.set(0.5);
            // adding the wheel in the middle of the canvas
            wheel[key] = game.add.sprite(game.width /2 , 350*(i+0.5), init_dials[i]+"_dial" );
            // setting wheel registration point in its center
            wheel[key].anchor.set(0.5);
            wheel[key].inputEnabled = true;
            wheel[key].__mykey = key;
            wheel[key].__movements = dial_movements[init_dials[i]];
            game.add.tween(wheel[key]).to({angle:angles[key]},500,Phaser.Easing.Quadratic.Out,true);
//            wheel[key].events.onInputDown.add(this.rotate,this);
            wheel[key].events.onDragStart.add(function(){alert(0);},this);

            dial_backs[key] = game.add.sprite( game.width/2, 350*(i+0.5), 'back' );
            dial_backs[key].anchor.set(0.5);
            dial_backs[key].visible = false;
            dial_backs[key].inputEnabled = true;
            dial_backs[key].__mykey = key;
            dial_backs[key].events.onInputDown.add(this.unlockDial,this);

        }

        // waiting for your input, then calling "spin" function
        //game.input.onDown.add(this.rotate, this);		
        // TODO rotate swipe
        this.saveState();
	},
    rotate(o,e){
        var wheelref = wheel[o.__mykey]
        var signal = e.clientX>355?+1:-1;
        var angleIncrement = 360/o.__movements * signal;
        var spinTween = game.add.tween(wheelref).to({
            angle: angleIncrement.toString()
        }, 500, Phaser.Easing.Quadratic.Out, true );
        var that = this;
        spinTween.onComplete.add(function(){
            angles[o.__mykey] = wheelref.angle
            that.saveState();
        });
    },
    lockDial(o,e){
        wheel[o.__mykey].visible = false;
        dial_backs[o.__mykey].visible = true;
    },
    unlockDial(o,e){
        wheel[o.__mykey].visible = true;
        dial_backs[o.__mykey].visible = false;
    },
    saveState(){
        var obj = {
            dials: dials,
            angles: angles,
            init_dials: init_dials
        };
        window.sessionStorage.setItem('xwingDials', JSON.stringify(obj) )
    },
    update(){
        if (game.input.activePointer.isDown ) {
            for(var w in wheel) {
                if ( wheel[w].input.checkPointerOver(game.input.activePointer)) {    
                // pointer is down and is over our sprite, so do something here
                    var delta_x = game.input.x - wheel[w].position.x; 
                    var delta_y = game.input.y - wheel[w].position.y;

                    var angle = Math.asin( delta_x / Math.sqrt( Math.pow( delta_x,2 ) + Math.pow( delta_y,2 ) ) ) * 180/3.141592

                    if ( delta_x>0 && delta_y<0 ) {
                        angle = angle;
                    } else if ( delta_x>0 && delta_y>0 ) {
                        angle = 180-angle;
                    } else if ( delta_x<0 && delta_y>0 ) {
                        angle = 180-angle;
                    } else {
                        angle = 360+angle;
                    }

                    if ( drag_event ) {
                        var delta_angle = angle - drag_event.angle;
                        while ( delta_angle > 360 ) { delta_angle-=360; }
                        while ( delta_angle < -360 ) { delta_angle+=360; }

                        wheel[w].angle += delta_angle;
                        angles[w] = wheel[w].angle;
                        this.saveState();


                    }

                    drag_event={angle:angle, mykey:w}

                }
            }
        } else if ( game.input.activePointer.isUp && drag_event ) {
            drag_event = false;
        }
    }
}




