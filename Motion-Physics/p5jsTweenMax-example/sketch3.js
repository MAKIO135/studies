var colors = [
    "#1F8A70",
    "#BEDB39",
    "#FFE11A",
    "#FD7400"
];

var params = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    alpha: 0,
    epaisseur:0
};

function setup(){
    createCanvas( windowWidth, windowHeight );

    for( var i=0; i<colors.length; i=i+1){
        colors[ i ] = color( colors[ i ] );
    }
}

function draw(){
    background( "#004358" );

    strokeWeight( params.epaisseur );
    console.log( colors[2] );
    stroke(
        colors[2].levels[0],
        colors[2].levels[1],
        colors[2].levels[2],
        params.alpha
    );
    line( params.x1, params.y1, params.x2,
    params.y2 );
}

function windowResized(){
    resizeCanvas( windowWidth, windowHeight );
}

function keyTyped(){
    //initial state
    params.x1 = width/2;
    params.y1 = height/2;
    params.x2 = width/2;
    params.y2 = height/2;
    params.alpha = 255;
    params.epaisseur = 1;

    // TweenMax.to( params, 1, { x1:100, y1:100, x2:width-100, y2:height-100 } );
    // TweenMax.to( params, 0.3, { alpha:0, delay:1.2 });
    step1();
}

function step1(){
    var tx = random( -width/2, width/2 ),
        ty = random( -height/2, height/2 );
    TweenMax.to( params, 0.2, {
        x1:width/2 + tx,
        y1:height/2 + ty,
        x2:width/2 - tx,
        y2:height/2 - ty,
        epaisseur: 50,
        onComplete: step2
    } );
}

function step2(){
    TweenMax.to( params, 0.2, { alpha:0, delay:0.2 });
}
