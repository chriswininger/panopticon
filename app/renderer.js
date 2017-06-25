const FaceDetect = require('./faceDetect.js');
const MathHelpers = require('./MathHelpers.js');
const isDebugging = true;

// eye.setAttributeNS(null, 'transform', 'translate(50, 0)')
window.onload = function() {
	let lastFace = null;
	let lastFaceCount = 0;
	let searchMode = true;
	const svgns = "http://www.w3.org/2000/svg";
	const animationIncrement = 0.5;
	const cameraWdith = 320;
	const detection = new FaceDetect();
	const svgDisplay = document.getElementById('svgDisplay');
	const svgWidth = svgDisplay.getBoundingClientRect().width;
	const svgHeight = svgDisplay.getBoundingClientRect().height;
	const eyeBoundX = svgWidth * 0.25; // restrict eye to 75% of outer width
	const display = document.getElementById('debugDisplay');
	const ctx = display.getContext('2d');
	const img = new Image();
	const state = {
		faces: [],
		eyePosition: { x: 160, y: 120 }
	};

	const eyeSVG = document.getElementById('grpEyeBall');

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

		// pick first face and move toward coordinates (simplest)
		if (state.faces && state.faces.length > 0) {
			searchMode = false;
			let face = findClosestFace(state.faces);
			lastFace = face;
			lastFaceCount = 0;
			updateFromFace(face);
		} else if (lastFace && lastFaceCount < 30) {
			// use the last detected face in case this is a momentary drop
			lastFaceCount++;
			let face = lastFace;
			updateFromFace(face);
		} else {
			lastFace = null;
			// return to center
			searchMode = true;
			eyeSVG.setAttributeNS(null, 'transform', 'translate(0)');
		}
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
		let faceX = face.width/2 + face.x;
		let percentTranslate = (faceX / cameraWdith);
		if (percentTranslate < 0.5) {
			eyeSVG.setAttributeNS(null, 'transform', 'translate(' +
				MathHelpers.map((cameraWdith/2 - faceX), 0, cameraWdith, 0, eyeBoundX) + ')' );
		} else {
			eyeSVG.setAttributeNS(null, 'transform', 'translate(' +
				MathHelpers.map((cameraWdith/2 - faceX),  0, cameraWdith, 0, eyeBoundX) + ')');
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