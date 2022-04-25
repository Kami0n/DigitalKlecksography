/* v katero smer naj gre moj razvoj
Amadea je dala 2 možnosti:
- komplete barv
- sivine (od črne do bele)
- sivine - oddaljenost roke    DONE
- samoprepogig po 20s          DONE
- krogci bolj v obliki kapljic
- prejšnje shranjene grafike - ce v x sekundah ne najde nobene roke, se izrisujejo stare grafike v modal 
- odstranitev gumbov - koncna verzija za razstavo
*/

// points for fingers joints
const fingerJoints = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20]
};
const fingerJointStyle = {
	0: { color: "#007fff", size: 5 }, // modra azure 007fff
	1: { color: "#00ff00", size: 2 }, // zelena 00ff00
	2: { color: "#00ff00", size: 4 },
	3: { color: "#00ff00", size: 2 },
	4: { color: "#00ff00", size: 2 },
	5: { color: "#bf00ff", size: 4 }, // vijola  bf00ff
	6: { color: "#bf00ff", size: 2 },
	7: { color: "#bf00ff", size: 2 },
	8: { color: "#bf00ff", size: 2 },
	9: { color: "#ff003f", size: 4 }, // rdeca ff003f
	10: { color: "#ff003f", size: 2 },
	11: { color: "#ff003f", size: 2 },
	12: { color: "#ff003f", size: 2 },
	13: { color: "#ed872d", size: 4 }, // oranzna ed872d
	14: { color: "#ed872d", size: 2 },
	15: { color: "#ed872d", size: 2 },
	16: { color: "#ed872d", size: 2 },
	17: { color: "#fdee00", size: 4 }, // rumena fdee00
	18: { color: "#fdee00", size: 2 },
	19: { color: "#fdee00", size: 2 },
	20: { color: "#fdee00", size: 2 }
};
const handLIneStyle = {color:"#0017d6", weight: 2};

// gesture definition
const fistGesture = new fp.GestureDescription('fist');
/*
fistGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
fistGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
fistGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
fistGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
fistGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
*/
for(let finger of [fp.Finger.Thumb, fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
	fistGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
	fistGesture.addDirection(finger, fp.FingerDirection.VerticalUp, 1.0);
	fistGesture.addDirection(finger, fp.FingerDirection.DiagonalUpLeft, 0.9);
	fistGesture.addDirection(finger, fp.FingerDirection.DiagonalUpRight, 0.9);
	fistGesture.addDirection(finger, fp.FingerDirection.HorizontalLeft, 0.9);
	fistGesture.addDirection(finger, fp.FingerDirection.HorizontalRight, 0.9);
}

const GE = new fp.GestureEstimator([
	//fp.Gestures.ThumbsUpGesture,
	fp.Gestures.VictoryGesture,
	fistGesture,
]);

let drip = true;
let showWebcam = true;

let tabelaPack = [];
const maxPack = 800;
const radius = 10;
const vrednostPacke = 0.1;

let odstevalnik;
let timerStare;
const casSlideshow = 3;
const sekundeDoPrikazaGrafik = 15;
const sekundeDoPrepogiba = 15;
const sekundeNovoPlatno = 15;

const fadeSpeed = 400;

let razdalja;
// izmerjeno: max: 250  min: 60
const minVelRoke = 60;
const maxVelRoke = 190;
const velikostRoke = maxVelRoke - minVelRoke;

//$('nav').hide();

/*
Pastelni mix:
Almond, Ash grey, Asparagus, Beau blue, Buff, Canaray, Champagne, Eton blue, Green yellow, Icterine, Wild blue yonder

Vivid mix:
Yellow, Zaffre, Vivid violet, Venetian red, Tangelo, Shocking pink, Islamic green

Dark tones:
Crimson red, Onyx, Black, Cafe noir, Bulgarian rose, Cardovan, Medium jungle green, Seal Brown, Zinwaldite brown

Natural tones:
Golden brown, Golden rod, Otter brown, Orange yellow, Vegas gold, Trolley grey, Straw, Tan, Saddle brown
*/
const colorPaletteGreyscale = ['#787878', '#696969', '#606060', '#505050', '#404040', '#303030', '#202020', '#101010', '#000000'];
const colorPalettePastel = ['#efdecd', '#b2beb5', '#87a96b', '#bcd4e6', '#f0dc82', '#ffff99', '#fad6a5', '#96c8a2', '#adff2f', '#fcf75e', '#a2add0'];
const colorPaletteVivid = ['#ffff00', '#0014a8', '#9f00ff', '#c80815', '#f94d00', '#fc0fc0', '#009000'];
const colorPaletteDark = ['#990000', '#0f0f0f', '#000000', '#4b3621', '#480607', '#893f45', '#1c352d', '#321414', '#2c1608'];
const colorPaletteNatural = ['#996515', '#daa520', '#654321', '#f8d568', '#c5b358', '#808080', '#e4d96f', '#d2b48c', '#8b4513'];

const colorPalettes = [colorPaletteGreyscale, colorPalettePastel, colorPaletteVivid, colorPaletteDark, colorPaletteNatural];
let colorPalette;
let paletaSt = -1;
barvnaPaleta();
let barvaSt = 0;

const mesanjeModes = [ 'darken', 'multiply', 'screen', 'soft-light', 'average' ];
/*
'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge',
'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation',
'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation',
'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over',
'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker',
'copy', 'xor'
*/
// multiply je dobra, ampak pride vse crno
// lighten  je dobra, pride na vrh vse svetlo
// darken  je dobra, pride na vrh vse temno
// luminosity je obratno od normal
// average je dober rezultat, ampak rabi veliko casa da ga izracuna in se sliko obrne narobe

let restart= false;

navigator.mediaDevices.getUserMedia({video: true})
const video = document.getElementById("webcamVideoFeed");
const canvasWebcam = document.getElementById("webcamCanvas");
canvasWebcam.width  = $("#wrapperWebcam").width();
canvasWebcam.height = $("#wrapperWebcam").width() * 0.75;
let ctxWebcam = canvasWebcam.getContext('2d');
let videoWidth = video.width;
let videoHeight = video.height;

const windowHeight = $(window).height() - 40 - 50;
const razmerjeVelikosti = 0.742;
const visinaPlatna = windowHeight*0.742;

const canvas = document.getElementById("canvasDraw");
canvas.width  = visinaPlatna;
canvas.height = windowHeight;
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let ctx = canvas.getContext('2d');
let paperScope1 = new paper.PaperScope();
paperScope1.setup(canvas); // paper js setup on canvas

const canvasMirror = document.getElementById("canvasDrawMirror");
const sirinaPolovice = visinaPlatna;
const sirinaPolPolovice = sirinaPolovice/2;
canvasMirror.width  = sirinaPolovice*2;
canvasMirror.height = windowHeight;
let ctxMirror = canvasMirror.getContext('2d');
let paperScope2 = new paper.PaperScope();
paperScope2.setup(canvasMirror);

paperScope1.activate();

let pointerCircle, pointerX, pointerY, pointerXOld, PointerYOld;
let stevecNaMiru = 0;
const naMiru = 50;
const deviacijaNaMiru = 10;

let model; //Holds the Handpose model object

async function main() {
	//Load the Handpose model
	model = await handpose.load();
	//Start the video stream, assign it to the video element and play it
	if(navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({video: true})
			.then(stream => {
				//assign the video stream to the video element
				video.srcObject = stream;
				//start playing the video
				video.play();
			})
			.catch(e => {
				$('#loadingCircle').css('background-image','url(media/error.png)')
				$('#errorText').text('Ni dostopa do spletne kamere ali napaka na spletni kameri!').show();
				console.log("Error Occurred in getting the video stream!");
			});
	}
	video.onloadedmetadata = () => {
		if(showWebcam){
			$('#webcamCanvas').show(); 
		}
		$('#colorPalette').css('display', 'flex'); 
		$('#colorPaletteText').show();
		
		//Reset the point (0,0) to a given point
		ctx.translate(canvas.width, 0);
		//Flip the context horizontally
		ctx.scale(-1, 1);
		
		ctxWebcam.translate(canvasWebcam.width, 0);
		//Flip the context horizontally
		ctxWebcam.scale(-1, 1);
		
		pointerCircle = new paper.Path.Circle(new paper.Point(canvasWidth/2-5, canvasHeight/2-5), 10);
		pointerCircle.fillColor = 'red';
		$('#loadingCircle').hide();
		hideBttns();
		//Start the prediction indefinitely on the video stream
		requestAnimationFrame(predict);
	};
}
main();

async function predict() {
	if(showWebcam){
		ctxWebcam.clearRect(0, 0, canvasWebcam.widt, canvasWebcam.height);
		//Draw the frames obtained from video stream on a canvas
		ctxWebcam.drawImage(video, 0, 0, canvasWebcam.width, canvasWebcam.height);
	}
	//Predict landmarks in hand (3D coordinates) in the frame of a video
	if(drip){
		const hand = await model.estimateHands(video); //hand.landmarks is an array of 3D coordinates predicted by the Handpose model
		if(hand.length > 0 && tabelaPack.length < maxPack) {
			if(showWebcam){
				drawHandLines(hand[0].landmarks)
				drawHandPoints(hand[0].landmarks)
			}
			pointerX = resizeX(hand[0].landmarks[9][0])
			pointerY = resizeY(hand[0].landmarks[9][1])
			pointerCircle.position = new paper.Point(pointerX, pointerY);
			
			let kretnja = await gesturesDetection(hand, pointerX, pointerY);
			// Ce je roka primiru
			if( kretnja != "fist" && Math.abs(pointerXOld-pointerX) < deviacijaNaMiru && Math.abs(pointerYOld-pointerY) < deviacijaNaMiru){
				odstevanje("Novo platno in naslednja barvna paleta", 5, rokaNaMiru);
			}else{
				stopOdstevanje(); // ko detektiras roko, odstrani timer
			}
			pointerXOld = pointerX
			pointerYOld = pointerY
		}
		else{// ce ni roke zaznane
			if(tabelaPack.length == 0){ // ce ni kapljica na papirju
				odstevanje("Sistem ni zaznal nobene roke, odštevanje do prikaza grafik", sekundeDoPrikazaGrafik, prikaziStareUmetnine);
			}
			else if(tabelaPack.length > 0 && tabelaPack.length < maxPack){ // ce je vsaj ena kapljica in jih ni prevec
				odstevanje("Odštevanje do prepogiba", sekundeDoPrepogiba, startPrepogib);
				
			}else if(tabelaPack.length >= maxPack){ // ce je dosezena meja kapljic
				startPrepogib();
			}
		}
		paperScope1.view.draw();
		requestAnimationFrame(predict);
	}
	else if(restart){
		restart = false;
		cancelAnimationFrame(predict);
		restartRisanja();
	}
	else{
		//$('#loadingCircle').hide();
		drawMirror();
	}
}

async function gesturesDetection(hand, packaX, packaY){
	let kretnja;
	const gesture = await GE.estimate(hand[0].landmarks, 8); // minimalno toliko more bit gotovo da zazna pest -> 90%
	if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
		const confidence = gesture.gestures.map( (prediction) => prediction.confidence );
		const maxConfidence = confidence.indexOf( Math.max.apply(null, confidence) );
		//console.log(gesture.gestures[maxConfidence].name, confidence[maxConfidence]);
		if(gesture.gestures[maxConfidence].name == "fist"){
			//packaX = resizeX(hand[0].landmarks[9][0])
			//packaY = resizeY(hand[0].landmarks[9][1])
			
			razdalja = Math.hypot(hand[0].landmarks[0][0]-hand[0].landmarks[9][0], hand[0].landmarks[0][1]-hand[0].landmarks[9][1]);
			barvaSt = mapDistancePaleta(razdalja);
			
			paperCircleColor(packaX,packaY, 9, colorPalette[barvaSt]);
			tabelaPack.push([packaX,packaY, colorPalette[barvaSt]]);
		}
		else if(gesture.gestures[maxConfidence].name == "victory"){
			startPrepogib();
		}
		kretnja = gesture.gestures[maxConfidence].name;
	}
	return kretnja;
}

function drawHandLines(landmarks){
	// Loop through fingers
	for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
		let finger = Object.keys(fingerJoints)[j];
		//  Loop through pairs of joints
		for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
			// Get pairs of joints
			const firstJointIndex = fingerJoints[finger][k];
			const secondJointIndex = fingerJoints[finger][k + 1];
			
			// Draw path
			ctxWebcam.beginPath();
			ctxWebcam.moveTo(
				resizeXwebcam(landmarks[firstJointIndex][0]),
				resizeYwebcam(landmarks[firstJointIndex][1])
			);
			ctxWebcam.lineTo(
				resizeXwebcam(landmarks[secondJointIndex][0]),
				resizeYwebcam(landmarks[secondJointIndex][1])
			);
			ctxWebcam.strokeStyle = handLIneStyle.color;
			ctxWebcam.lineWidth = handLIneStyle.weight;
			ctxWebcam.stroke();
			
		}
	}
}

function drawHandPoints(landmarks) {
	for (let i = 0; i < landmarks.length; i++) {
		const x = resizeXwebcam(landmarks[i][0]);
		const y = resizeYwebcam(landmarks[i][1]);
		
		ctxWebcam.fillStyle = fingerJointStyle[i]["color"];
		
		ctxWebcam.beginPath();
		ctxWebcam.arc(x, y, fingerJointStyle[i]["size"], 0, 2 * Math.PI);
		ctxWebcam.fill();
		ctxWebcam.closePath();
		
		//paperCircle(x, y, style[i]["size"], style[i]["color"]);
	}
}

function paperCircleColor(x, y, size, color) {
	let myCircle = new paper.Path.Circle(new paper.Point(x, y), size);
	myCircle.fillColor = color;
}
function paperCircleWB(x, y, size, sivina) {
	let myCircle = new paper.Path.Circle(new paper.Point(x, y), size);
	myCircle.fillColor = new paper.Color(sivina);
}

function mapDistanceWhiteBlack(razdalja){
	return 1-razdalja/velikostRoke;
}
function mapDistancePaleta(razdalja){
	
	const stVsehBarv = colorPalette.length-1;
	let novaVrednost = ((razdalja - minVelRoke) * stVsehBarv) / velikostRoke;
	
	if(novaVrednost > stVsehBarv)
		return stVsehBarv
	
	else if(novaVrednost <= 0)
		return 0;
		
	return Math.floor(novaVrednost);
}

/*  NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
ali 
OldRange = (OldMax - OldMin)
NewRange = (NewMax - NewMin)
NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin  */
function resizeX(x){
	x = x+100;
	const OldRange = (videoWidth-50) - 50
	const NewRange = canvasWidth 
	let NewValue = (((x-0) * NewRange) / OldRange) + 0
	return NewValue-140;
	
}
function resizeY(y){
	y = y+120;
	const OldRange = (videoHeight-60) - 60
	const NewRange = canvasHeight + 0
	let NewValue = (((y-0) * NewRange) / OldRange) + 0
	return NewValue-350;
}
function resizeXwebcam(x){
	return (x * canvasWebcam.width) / (videoWidth);
}
function resizeYwebcam(y){
	return (y * canvasWebcam.height) / (videoHeight);
}


// PREPOGIB
function startPrepogib(){
	skrijStareUmetnineDesno()
	drip = false;
	$('#errorText').text('Prepogibam, počakaj na rezultat ...').show();
}


function drawMirror(){
	
	stopOdstevanje();
	
	$("#hideWebcamBtn").prop( "disabled", true );
	$("#exportBtn").prop( "disabled", false );
	$("#vzrokiBtn").prop( "disabled", true );
	
	$('#webcamCanvas').hide();
	$('#colorPalette').hide();
	$('#colorPaletteText').hide();
	$('#canvasDraw').hide();
	
	$('#errorText').hide();
	$('#infoText').hide();
	
	paperScope1.project.activeLayer.removeChildren();
	paperScope1.project.clear();
	paperScope2.activate();
	
	// zaznaj koliko tock je blizu trenutni in glede na to ji dodeli velikost
	for(let i = 0; i<tabelaPack.length; i++){
		tabelaPack[i]["velikost"] = 1;
		const packaX1 = tabelaPack[i][0];
		const packaY1 = tabelaPack[i][1];
		// vec kot je pik na kupu vecji je radij, manj kot je pik manjsi mora biti radij
		for(let j = 0; j<tabelaPack.length; j++){
			if(i != j){
				const packaX2 = tabelaPack[j][0];
				const packaY2 = tabelaPack[j][1];
				// tocki moreta bit blizje od radiusa 10
				if( (Math.abs((packaX2 - packaX1)^2 + (packaY2 - packaY1)^2)) < (radius^2)){
					tabelaPack[i]["velikost"]+=vrednostPacke;
				}
			}
		}
	}
	
	// za vsako packo posebej gre skozi zanko in klice risanje packe
	for(let i = 0; i<tabelaPack.length; i++){
		const packaX = tabelaPack[i][0];
		const packaY = tabelaPack[i][1];
		// x, y, minRadius, maxRadius,  minPoints, maxPoints, size
		paperSmudgeOneCanvas(packaX, packaY, 70*tabelaPack[i]["velikost"], 150*tabelaPack[i]["velikost"], 20, 80, 0.2, tabelaPack[i][2]);
	}
	paperScope2.view.draw();
	console.log("Koncano generiranje kleksografije");
	$('#canvasDrawMirror').show();
	
	odstevanje("Čas do reseta platna", sekundeNovoPlatno, restartRisanja );
	
	izvoziNaServerPng();
	
}
function paperSmudgeOneCanvas(x, y, radMin, radMax, poitMin, pointMax, size, color){
	
	let radiusDelta = radMax - radMin;
	let pointsDelta = pointMax - poitMin;
	let radius = radMin + Math.random() * radiusDelta;
	let points = poitMin + Math.floor(Math.random() * pointsDelta);

	let randomValues = [];
	for (let i = 0; i < points; i++) {
		randomValues.push(Math.random()); // bodice packe
	}
	for(let i = 0; i<2; i++){
		let xCorr;
		if(i == 0) { // leva polovica platna
			if(x > sirinaPolPolovice){
				xCorr = x - (x-sirinaPolPolovice)*2;
			}else{
				xCorr = x + (sirinaPolPolovice-x)*2;
			}
		}else{ // desna polovica platna
			xCorr = x + sirinaPolovice
		}
		let point = new paper.Point(xCorr,y);
		let path = new paper.Path();
		path.closed = true;
		path.fillColor = color;
		//path.strokeColor = color;
		
		if(i == 0) { // leva polovica platna
			for (let j = points-1; j > -1; j--) {
				let delta = new paper.Point({
					length: (points * size) + (randomValues[j] * radius * size),
					angle: ((360 / points) * j)*-1
				});
				path.add(point.subtract(delta));
			}
		}
		else{ // desna polovica platna
			for (let j = 0; j < points; j++) {
				let delta = new paper.Point({
					length: (points * size) + (randomValues[j] * radius * size),
					angle: (360 / points) * j
				});
				path.add(point.add(delta));
			}
		}
		
		path.smooth();
		path.blendMode = mesanjeModes[paletaSt];
	}
}

async function izvoziNaServer(){
	const datoteka = paperScope2.project.exportSVG({asString:true})
	$.post("saveSVG.php", {svgFile: datoteka}, function(data, status){
		console.log("Izvoz na server:\nData: " + data + "\nStatus: " + status);
	});
}
async function izvoziNaServerPng(){
	const datoteka = canvasMirror.toDataURL("image/png")
	$.post("savePNG.php", {pngFile: datoteka}, function(data, status){
		console.log("Izvoz na server:\nData: " + data + "\nStatus: " + status);
	});
}

function rokaNaMiru(){
	drip = false;
	restart = true;
}

function restartRisanja(){
	
	hideBttns();
	stopOdstevanje();
	
	$("#hideWebcamBtn").prop( "disabled", false );
	$('#canvasDrawMirror').hide();
	$('#canvasDraw').show();
	$("#stareGrafikeModal").hide();
	$("#errorText").hide();
	
	$("#exportBtn").prop( "disabled", true );
	$("#vzrokiBtn").prop( "disabled", false );
	
	barvnaPaleta();
	
	paperScope1.project.activeLayer.removeChildren();
	paperScope1.project.clear()
	paperScope2.project.activeLayer.removeChildren();
	paperScope2.project.clear()
	
	paperScope1.activate();
	drip = true;
	pointerCircle = new paper.Path.Circle(new paper.Point(canvasWidth/2-5, canvasHeight/2-5), 10);
	pointerCircle.fillColor = 'red';
	
	if(showWebcam){
		$('#webcamCanvas').show();
	}
	$('#colorPalette').css('display', 'flex'); 
	$('#colorPaletteText').show();
	requestAnimationFrame(predict);
	tabelaPack = [];
}

function barvnaPaleta(){
	paletaSt++;
	if(paletaSt > colorPalettes.length-1)
		paletaSt = 0;
	colorPalette = colorPalettes[paletaSt]
	
	//colorPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)]
	
	$( "#colorPalette" ).empty()
	for(let i=0;i<colorPalette.length; i++){
		$( "#colorPalette" ).append( '<div class="colorOnPalette" style="background:'+colorPalette[i]+'"></div>' );
	}
}
// PRIKAZ STARIH UMETNIN
function prikaziStareUmetnine(){
	let steviloShranjenih = 1;
	$.get( "highestFile.php", function( data ) {
		steviloShranjenih = parseInt(data);
		console.log("Stevilo shranjenih slik: "+steviloShranjenih);
		let stSlike = Math.floor(Math.random() * steviloShranjenih) + 1;
		$("#staraGrafika").attr("src","results/"+stSlike+".png");
		$("#stareGrafikeModal").fadeIn(fadeSpeed).css('display','flex');
		if(steviloShranjenih>1){
			let novStSlike;
			timerStare = setInterval(function (){
				do{
					novStSlike = Math.floor(Math.random() * steviloShranjenih) + 1;
				}while(stSlike == novStSlike)
				stSlike = novStSlike;
				$("#staraGrafika").attr("src","results/"+stSlike+".png");
				
			},casSlideshow*1000);
		}
	});
}

function skrijStareUmetnine(){
	clearInterval(timerStare);
	$("#stareGrafikeModal").fadeOut();
}


// ODSTEVALNIK
let executedOdstevanje = false;
const odstevanje = (function() {
	executedOdstevanje = false;
	return function(text, seconds, funkcija ) {
		if (!executedOdstevanje) {
			executedOdstevanje = true;
			executedStopOdstevanje = false;
			
			let sekundeOdstevalnik = seconds;
			odstevalnik = setInterval(function() {
				//console.log(text+': '+i);
				$('#infoText').text(text+': '+sekundeOdstevalnik+' s ').fadeIn();
				sekundeOdstevalnik = sekundeOdstevalnik - 1;
				if (sekundeOdstevalnik < 0) {
					clearInterval(odstevalnik);
					funkcija();
					$('#infoText').text('').fadeOut(fadeSpeed);
				}
			}, 1000);
			
		}
	};
})();

let executedStopOdstevanje = false;
const stopOdstevanje = (function() {
	executedStopOdstevanje = false;
	return function(funkcija) {
		if (!executedStopOdstevanje) {
			executedStopOdstevanje = true;
			executedOdstevanje = false;
			clearInterval(odstevalnik);
			$('#infoText').fadeOut(fadeSpeed);
			
			skrijStareUmetnine();
		}
	};
})();


// BUTTONS below:
$("#exportBtn").click(function (){
	const fileName = "kleksografijaPlatno.svg"
	let url = "data:image/svg+xml;utf8," + encodeURIComponent(paperScope2.project.exportSVG({asString:true}));
	let link = document.createElement("a");
	link.download = fileName;
	link.href = url;
	link.click();
});

$("#restartBtn").click(function() {
	if(drip){
		restart = true;
		drip = false;
	}else{
		restartRisanja();
	}
});

$("#hideWebcamBtn").click(function() {
	
	if(showWebcam){
		showWebcam = false;
		$('#webcamCanvas').hide();
		$('#hideWebcamBtn').text("Vklopi prikaz kamere");
	}
	else{
		showWebcam = true;
		$('#webcamCanvas').fadeIn(); //show
		$('#hideWebcamBtn').text("Izklopi prikaz kamere");
		
	}
});

let timerStareDesno;
const casSlideshowDesno = 3;
const fadeSpeedDesno = 400;

// PRIKAZ desno STARIH UMETNIN (zadnjih 5)
function prikaziStareUmetnineDesno(){
	
	let steviloShranjenih = 1;
	const prikaziZadnjih = 5;
	
	$.get( "highestFile.php", function( data ) {
		steviloShranjenih = parseInt(data);
		let stSlike = steviloShranjenih;
		if(steviloShranjenih>1){
			$('#desnoPlatna').show();
			$("#staraGrafikaDesno1").attr("src","results/"+stSlike+".png");
			$("#staraGrafikaDesno2").attr("src","results/"+(stSlike-1)+".png");
			$("#staraGrafikaDesno3").attr("src","results/"+(stSlike-2)+".png");
		}
	});
}

function skrijStareUmetnineDesno(){
	
	$('#desnoPlatna').hide();
}

let justHidden = false;
$(document).ready(function() {
	let j;
	$(document).mousemove(function() {
		if (!justHidden) {
			justHidden = false;
			
			clearTimeout(j);
			$('nav').show();
			$('body').css("cursor","unset");
			$('#okolicaPlatna').css("cursor","unset");
			$('#desnoPlatna').hide();
			
			if(drip){
				skrijStareUmetnine();
				stopOdstevanje();
				j = setTimeout('hideBttns();', 10000);
			}
		}
	});
});

function hideBttns() {
	$('nav').hide();
	$('body').css("cursor","none");
	$('#okolicaPlatna').css("cursor","none");
	$('#desnoPlatna').show();
	prikaziStareUmetnineDesno();
}
