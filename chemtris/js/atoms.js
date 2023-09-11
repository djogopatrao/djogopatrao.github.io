function Atom(alias) {

    this.alias = alias;
    this.points = 1;
    this.rotation = 0;
    this.allLinks = {}
    this.allLinksToAtoms = {}
    this.boardCoordinates = {}
    this.sprite = null;
    this.id = "";

    this.setLink = function( direction, type ) {
        // test
        this.allLinks[direction]=type;
        return this;
    }

    this.getX = function() {
        return this.boardCoordinates.x
    }
    this.setSprite = function(sprite) {
        this.sprite = sprite
        return this;
    }

    this.getSprite = function() {
        return this.sprite
    }

    this.getY = function() {
        return this.boardCoordinates.y
    }

    this.setLinkToAtom = function( direction, atom ) {
        this.allLinksToAtoms[direction]=atom;
        atom.allLinksToAtoms[ (direction+180)%360 ] = this;
        return this;
    }

    this.setPositionInBoard = function(x,y) {
        this.boardCoordinates.x = x
        this.boardCoordinates.y = y
    }

    this.atomLinkedOnDirection = function(direction) {
        return this.allLinksToAtoms[direction];
    }

    this.hasLink = function( direction ) {
        d = (direction - this.rotation + 360 )%360;
        console.log( this.alias + " tem link na direção "+d+": "+this.allLinks[d])
        console.log( "direction="+direction+" rotation="+this.rotation)
        console.log(this.allLinks)
        return this.allLinks[d]
    }

    this.init = function() {
        for( i in ATOM.direction ) {
            this.setLink( ATOM.direction[i], ATOM.linkType.none );
        }
        this.setAtomId();
        return this;
    }

    this.setAtomId = function() {
        this.id = ATOMCOUNTER++;
    }

    this.checkPossibleLinkage = function( anotherAtom, direction ) {
        var inverseDirection = (180+direction)%360;
        if ( !this.hasLink( direction ) ) {
            console.log("Não tem link nessa direção "+direction )
            return false;
        }
        return this.hasLink( direction ) == anotherAtom.hasLink( inverseDirection )
    }

    this.init()
}

var ATOMCOUNTER = 0;

var ATOM = {
    direction: {
        dg30: 30,
        dg90: 90,
        dg150: 150,
        dg210: 210,
        dg270: 270
    },
    linkType: {
        none: 0,
        single: 1,
        double: 2,
        triple: 3
    }
};
var ATOMS = {
    H: function(){return (new Atom('H')).setLink(ATOM.direction.dg30,ATOM.linkType.single)},
    O1: function(){return (new Atom('O1')).setLink(ATOM.direction.dg30,ATOM.linkType.double)},
    O2: function(){return (new Atom('O2')).setLink(ATOM.direction.dg30,ATOM.linkType.single).setLink(ATOM.direction.dg270,ATOM.linkType.single)}
};
