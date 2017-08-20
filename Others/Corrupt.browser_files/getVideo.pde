var ctx;
PImage img;

void setup(){
	size(600,450);
	ctx = externals.context;
}

void draw(){
	pushMatrix();
	translate(width,0);
	scale(-1,1);//mirror the video
	ctx.drawImage(video, 0, 0, width, height); //video is defined inside getUserMedia.js
	popMatrix();
}