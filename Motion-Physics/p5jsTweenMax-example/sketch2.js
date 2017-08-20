var colors = [
    "#1F8A70",
    "#BEDB39",
    "#FFE11A",
    "#FD7400"
];

var params = {
    x: 0,
    y: 0,
    colorNb: 0
};


function setup() {
    createCanvas( windowWidth, windowHeight );

    for( var i=0; i<colors.length; i=i+1){
        colors[ i ] = color( colors[ i ] );
    }

    params.x = -width;
    params.y = -height;
}

function draw() {
    background( "#004358" );

    noStroke();
    fill( colors[ params.colorNb ] );
    rect( params.x, params.y, width, height );
}

function windowResized(){
    resizeCanvas( windowWidth, windowHeight );
}

function keyTyped(){
    params.colorNb = floor(random(colors.length));

    var choice = random(4);
    if( choice < 1 ){//haut en bas
        // initial state
        params.x = 0;
        params.y = -height;

        // anims
        TweenMax.to( params, 0.3, { y: 0 } );
        TweenMax.to( params, 0.3, { y: height, delay: 0.5 } );
    }
    else if(choice < 2){//gauche à droite
        //initial state
        params.x = -width;
        params.y = 0;

        // anims
        TweenMax.to( params, 0.3, { x: 0 } );
        TweenMax.to( params, 0.3, { x: width, delay: 0.5 } );
    }
    else if(choice < 3){//bas en haut
        // initial state
        params.x = 0;
        params.y = -height;

        // anims
        TweenMax.to( params, 0.3, { y: 0 } );
        TweenMax.to( params, 0.3, { y: height, delay: 0.5 } );
    }
    else{ //droite à gauche
        //initial state
        params.x = -width;
        params.y = 0;

        // anims
        TweenMax.to( params, 0.3, { x: 0 } );
        TweenMax.to( params, 0.3, { x: width, delay: 0.5 } );
    }
}

//polygon ( width/2, height/2, 200, 6, 90)
function polygon( x, y, rayon, nbCote, angleDegrees ){
    beginShape();
    for( var i=0; i<nbCote; i++ ){
        var angle = radians( angleDegrees ) + TWO_PI / nbCote * i;
        var _x = x + cos( angle ) * rayon;
        var _y = y + sin( angle ) * rayon;
        vertex( _x, _y );
    }
    endShape(CLOSE);
}
