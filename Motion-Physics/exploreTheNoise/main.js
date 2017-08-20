var num;
var agents = [];
var col = [];
var fieldIntensity = 10,
noiseScale = 500,
radius = 250,
stepSize = 2;
var showText = true;
var a = .15,
bg = 20,
c = 0;

function setup() {
    createCanvas(windowWidth, windowHeight-4);
    background(bg);
    num = 1000;
    createStuff();
    initColors(a);
}

function draw() {
    for (var i = 0; i < agents.length; i++) {
        agents[i].update();
        agents[i].paint();
    }
    if (frameCount % 100 === 0) c++;
    noStroke();
    fill(255, 200);
    textAlign(RIGHT);
    if (showText) {
        text("up arrow : fieldIntensity * 2", width - 20, 20);
        text("down arrow : fieldIntensity / 2", width - 20, 40);
        text("left arrow : noiseScale - 100", width - 20, 60);
        text("right arrow : noiseScale + 100", width - 20, 80);
        text("r : reset with current settings", width - 20, 100);
        text("current fieldIntensity: " + floor(fieldIntensity), width - 20, 120);
        text("current noiseScale: " + floor(noiseScale), width - 20, 140);
        text("www.jeromeherr.space", width - 20, height - 20);
        showText = false;
    }
}

function createStuff() {
    agents = [];
    var step = 15;
    for (var x = width / 2 - radius; x < width / 2 + radius; x += step) {
        for (var y = height / 2 - radius; y < height / 2 + radius; y += step) {
            var distance = dist(x, y, width / 2, height / 2);
            if (distance < radius) {
                agents.push(new Agent(createVector(x, y)));
            }
        }
    }
}

function Agent(position) {
    this.angle = random(TWO_PI);
    this.stepSize = stepSize;
    this.position = position;
    this.outside = false;

    this.update = function() {
        this.angle = noise( this.position.x / noiseScale, this.position.y / noiseScale) * fieldIntensity;
        this.position.x += cos( this.angle ) * this.stepSize;
        this.position.y += sin( this.angle ) * this.stepSize;
    }

    this.paint = function() {
        fill(col[c % col.length]);
        noStroke();
        ellipse(this.position.x, this.position.y, this.stepSize, this.stepSize);
    }
}

function keyTyped() {
    //if (key === 's') save("pics/image-" + floor(random(9999)) + ".png");
    if (key == 'r') init();
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        fieldIntensity *= 2;
        if (fieldIntensity > 3000) fieldIntensity = 3000;
        init();
    }
    if (keyCode === DOWN_ARROW) {
        fieldIntensity /= 2;
        if (fieldIntensity < 5) fieldIntensity = 5;
        init();
    }
    if (keyCode === RIGHT_ARROW) {
        noiseScale += 100;
        if (noiseScale > 1000) fieldIntensity = 1000;
        init();
    }
    if (keyCode === LEFT_ARROW) {
        noiseScale -= 100;
        if (noiseScale < 100) fieldIntensity = 100;
        init();
    }
}

function init() {
    background( bg );
    noiseSeed( random( 9999 ) );
    c = 0;
    showText = true;
    initColors( a );
    createStuff( col );
}

function initColors(alphaValue) {
    col = [color('rgba(84,121,128,' + alphaValue + ')'), color('rgba(69,173,168,' + alphaValue + ')'), color('rgba(157,224,173,' + alphaValue + ')'), color('rgba(229,252,194,' + alphaValue + ')')];
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-4);
    background(bg);
}
