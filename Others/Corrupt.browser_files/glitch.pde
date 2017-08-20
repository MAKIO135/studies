var ctx;
var cnvs;

int[] glitchModes;
int glitchMode;

boolean getFrame = false,
		addFrame = false;
int count=0;
Gui gui;

void setup(){
	size(window.innerWidth, window.innerHeight);
	ctx = externals.context;
	cnvs = externals.canvas;
	background(0);

	glitchModes=new int[4];
	glitchModes={35,602,354,308}

	gui = new Gui();
	textAlign(CENTER);
}

void draw(){
	ctx.drawImage(bg, 0, 0, width, height);

	if(getFrame){
		var frame = cnvs.toDataURL("image/png");
		window.open(frame, '_newtab');
		getFrame=false;
	}

	if(addFrame){
		dataUrl[count] = document.getElementById("glitch").toDataURL("image/jpeg");
		imgs[count].src=dataUrl[count];
		count = (count+1)%10;
		addFrame=false;
	}

	gui.draw();
}

void mousePressed(){
	gui.mousePressed();
}

class Gui{
	float posX=-30,tarPosX=-250;
	boolean open = true,
			overGlitchMode=false,
			overGetPic=false,
			overCreateGif=false,
			overCredit=false;

	int imgSize;

	Gui(){
		imgSize=(height-145)/10;
	}
	
	void draw(){
		if((!open && mouseX<30)||(open && mouseX<230)){
			open=true;
			tarPosX=-30;
		}
		else{
			open=false;
			tarPosX=-250;
		}

		posX=ease(posX, tarPosX, .1);

		///// gui background
			noStroke();
			fill(0,open?230:180);
			rect(posX+0,0,270,height,15,15);
			fill(255);
			text(">>",posX+260,height/2);

		/////change GlicthMode button
			stroke(0);
			fill(overGlitchMode?80:10);
			rect(posX+55,10,185,20,3,3);
			fill(255);
			text("Change GlitchMode".toUpperCase(),posX+147,25);

		/////get Frame button
			fill(overGetPic?80:10);
			rect(posX+55,35,185,20,3,3);
			fill(255);
			text("Get Frame".toUpperCase(),posX+147,50);

		/////draw pics
			for (int i = 0; dataUrl[i]; i++){
				ctx.drawImage(imgs[i],posX+55,85+i*imgSize,185,imgSize-5);
			}
			fill(overCreateGif?80:10);
			rect(posX+55,85+dataUrl.length*imgSize,185,20,3,3);
			fill(255);
			text("Generate Gif".toUpperCase(),posX+147,100+dataUrl.length*imgSize);
			if(dataUrl.length<3) text("Click canvas to add frame to gif",posX+147,125+dataUrl.length*imgSize);

		///// credits
			fill(overCredit?80:10);
			rect(posX+55,height-30,185,20,3,3);
			fill(255);
			text("Corrupt.browser by MAKIO135",posX+147,height-15);


		overGlitchMode = (mouseX>posX+55 && mouseX<posX+230 && mouseY>10 && mouseY<35);
		overGetPic = (mouseX>posX+55 && mouseX<posX+230 && mouseY>35 && mouseY<55);
		overCreateGif = (mouseX>posX+55 && mouseX<posX+230 && mouseY>85+dataUrl.length*imgSize && mouseY<105+dataUrl.length*imgSize && dataUrl.length>1);
		overCredit = (mouseX>posX+45 && mouseX<posX+230 && mouseY>height-25 && mouseY<height-10);
	}

	float ease(float variable,float target,float easingVal) {
		float d = target - variable;
		if(abs(d)>1) variable+= d*easingVal;
		return variable;
	}

	void mousePressed(){
		if(open){
			if(overGlitchMode){
				glitchMode=(glitchMode+1)%glitchModes.length;
				spot=glitchModes[glitchMode];
			}
			else if(overGetPic){
				getFrame=true;
			}
			else if (overCreateGif) {
				generateGif();
			}
			else if (overCredit) {
				window.open('http://makio135.com', '_newtab');
			}
		}
		else{
			addFrame=true;
		}
	}
}