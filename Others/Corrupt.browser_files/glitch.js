/* 
 jquery.glitch.js ~ v0.0 ~ Copyright (c) 2011, AkihikoTaaniguchi(http://okikata.org/)
 Liscensed under the MIT License

 Modified by Lionel RADISSON/MAKIO135 to work with getUserMedia API and ProcessingJS
 */
var bg = new Image();
var spot=344;
var glitched;
function glitch(){
	imgdata = document.getElementById("getVideo").toDataURL("image/jpeg");//source canvas id
	glitched = new Image();
	glitched.src = imgdata;

	random_img = new Array();
	var last = "";
	var slice = imgdata.replace("data:image/jpeg;base64,", "");

	var _spot = spot;//level of glitching
	
	for (var i in slice) {
		if (i == _spot) {
			var r = Math.floor(Math.random() * 9);
			last += r;
		}
		else {
			last += slice[i];
		}
	}

	output = "data:image/jpeg;base64," + last;
	bg.src = output;
	setTimeout(glitch, 100);
}