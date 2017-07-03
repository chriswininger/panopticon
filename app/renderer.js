const FaceDetect = require('./faceDetect.js');
const MathHelpers = require('./MathHelpers.js');
const isDebugging = false;

// eye.setAttributeNS(null, 'transform', 'translate(50, 0)')
window.onload = function() {
	let lastFace = null;
	let lastFaceCount = 0;
	let searchMode = true;
	let animationPhase = 1;
	let eyeOffset = 0;

	const svgns = "http://www.w3.org/2000/svg";
	const animationIncrement = 0.5;
	const cameraWdith = 320;
	const detection = new FaceDetect();
	const svgDisplay = document.getElementById('svgDisplay');
	const svgWidth = svgDisplay.getBoundingClientRect().width;
	const eyeBoundMode3 = svgWidth * 0.75;
	const svgHeight = svgDisplay.getBoundingClientRect().height;
	const eyeBoundCenter = svgWidth / 2;
	const eyeBoundX = svgWidth * 0.07; // restrict eye to 75% of outer width

	const display = document.getElementById('debugDisplay');
	const ctx = display.getContext('2d');
	const img = new Image();
	const state = {
		faces: [],
		eyePosition: { x: 160, y: 120 }
	};

	const eyeSVG = document.getElementById('grpEyeBall');
	const eyeBoundLeft = eyeSVG.getBBox().x - (svgWidth * 0.065);
	const eyeBoundRight =eyeSVG.getBBox().x + (svgWidth * 0.062);


	detection.events.on('frameAvailable', function(data) {
		if (data.faces) {
			state.faces = data.faces;
		}

		if (isDebugging)
			_renderImg(data, img);
	});

	_draw();

	function _draw() {
		requestAnimationFrame(_draw);
		// let eyeWidth = eyeSVG.getBBox().width;
		let eyeX = eyeSVG.getBBox().x + eyeOffset;
		let faceBasedOffset;
		let currentFace = null;

		// pick first face and move toward coordinates (simplest)
		if (state.faces && state.faces.length > 0) {
			// searchMode = false;
			let face = findClosestFace(state.faces);
			lastFace = face;
			currentFace = face;
			faceBasedOffset = computeOffsetFromFace(currentFace);

			if (eyeOffset === faceBasedOffset || (eyeOffset >= faceBasedOffset - 2 && eyeOffset <= faceBasedOffset + 2)) {
				// lock on follow the phase, we have intersected with it
				animationPhase = 3;
			} else if (eyeOffset < faceBasedOffset && animationPhase === 1) {
				// switch direction, scan back toward face to left
				animationPhase = 2;
			} else if (eyeOffset < faceBasedOffset && animationPhase === 2) {
				// track back right, eye is less than detected face
				animationPhase = 1;
			}

			lastFaceCount = 0;
			// updateFromFace(face);
		} else if (lastFace && lastFaceCount < 30) {
			// use the last detected face in case this is a momentary drop
			lastFaceCount++;
			currentFace = lastFace;

			faceBasedOffset = computeOffsetFromFace(currentFace);

			if (eyeOffset === faceBasedOffset || eyeOffset >= faceBasedOffset - 5 || eyeOffset <= faceBasedOffset + 5) {
				animationPhase = 3;
			}

			// updateFromFace(face);
		} else {
			lastFace = null;
			// return to center
			if (animationPhase === 3)
				animationPhase = 1;
			// eyeSVG.setAttributeNS(null, 'transform', 'translate(0)');
		}


		if (animationPhase === 1 && eyeX <= eyeBoundRight) {
			eyeOffset += animationIncrement;
		} else if (animationPhase === 1 && eyeX > eyeBoundRight) {
			animationPhase = 2;
		} else if (animationPhase === 2 && eyeX >= eyeBoundLeft) {
			eyeOffset -=animationIncrement;
		} else if (animationPhase === 2 && eyeX < eyeBoundLeft) {
			animationPhase = 1;

		} else if (animationPhase === 3 && currentFace) {
		 eyeOffset = faceBasedOffset;
		}

		eyeSVG.setAttributeNS(null, 'transform', 'translate(' + eyeOffset + ')' );
	}

	function findClosestFace(faces) {
		let largestIndex = 0;
		let largestArea = 0;
		let area;
		let i = faces.length - 1;
		do {
			area = faces[i].width * faces[i].height;
			if (area > largestArea) {
				largestArea = area;
				largestIndex = i;
			}
		} while (i--);

		return faces[largestIndex];
	}

	function updateFromFace(face) {
		eyeSVG.setAttributeNS(null, 'transform', 'translate(' + computeOffsetFromFace(face) + ')' );
	}

	function computeOffsetFromFace(face) {
		let faceX = face.width/2 + face.x;
		let percentTranslate = (faceX / cameraWdith);
		if (percentTranslate < 0.5) {
			return MathHelpers.map((cameraWdith/2 - faceX), 0, cameraWdith, 0, eyeBoundX);
		} else {
			return MathHelpers.map((cameraWdith/2 - faceX),  0, cameraWdith, 0, eyeBoundX);
		}
	}
	function _renderImg(data, img) {
		// console.log('found %s face(s)', data.faces.length);
		const base64String = btoa(String.fromCharCode.apply(null, data.img));

		img.onload = function () {
			ctx.drawImage(this, 0, 0, display.width, display.height);
		};

		img.src = 'data:image/png;base64,' + base64String;
	}
};


/*
	Stray back and fourth until crossing the largest face, then lock there until the face
		is not detected for more than a few frames
 */