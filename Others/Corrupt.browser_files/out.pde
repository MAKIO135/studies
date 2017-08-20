var ctx;
var cnvs;

void setup(){
	size(window.innerWidth/3, window.innerHeight/3);
	background(0);
	ctx = externals.context;
	cnvs = externals.canvas;
}

void draw(){
	ctx.drawImage(bg, 0, 0, width, height);
}