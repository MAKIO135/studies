var colors = [
    "#004358",
    "#1F8A70",
    "#BEDB39",
    "#FFE11A",
    "#FD7400"
];

var params = {
    grey: 150,
    greyRange: [0, 255],
    x: 0,
    y: 0,
    diametre: 0,
    diametreRange: [0, 1000],
    alpha: 255
};


function setup() {
    var canvas = createCanvas( windowWidth, windowHeight );

    params.x = width / 2;
    params.y = height / 2;
    params.diametre = width / 2;

    // var ui = new ControlKit();
    // ui.addPanel()
    //     .addSlider( params, 'grey', 'greyRange' )
    //     .addSlider( params, 'diametre', 'diametreRange');

    for( var i=0; i<colors.length; i=i+1){
        colors[ i ] = color( colors[ i ] );
    }
}

function draw() {
    background( colors[ 0 ] );

    fill( red(colors[1]), green(colors[1]), blue(colors[1]), params.alpha );
    noStroke();
    ellipse( params.x, params.y, params.diametre, params.diametre );
}

function windowResized(){
    resizeCanvas( windowWidth, windowHeight );

    params.x = width / 2;
    params.y = height / 2;
    params.diametre = width / 2;
}

function keyTyped(){
    params.diametre = 0;
    params.alpha = 255;
    TweenMax.to( params, 2, { diametre : width, ease:  Power4.easeIn } );
    TweenMax.to( params, 0.1, { alpha : 0, delay: 1.9 } );
}
