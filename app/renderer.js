const FaceDetect = require('./faceDetect.js');
const isDebugging = true;

window.onload = function() {
	const svgns = "http://www.w3.org/2000/svg";
	const animationIncrement = 0.5;
	const detection = new FaceDetect();
	const svgDisplay = document.getElementById('svgDisplay');
	const svgWidth = svgDisplay.getBoundingClientRect().width;
	const svgHeight = svgDisplay.getBoundingClientRect().height;
	const display = document.getElementById('debugDisplay');
	const ctx = display.getContext('2d');
	const img = new Image();
	const state = {
		faces: [],
		eyePosition: { x: 160, y: 120 }
	};

	const eyeSVG = document.createElementNS(svgns, 'circle');
	eyeSVG.setAttributeNS(null, 'fill', '#1a7ae4');
	svgDisplay.appendChild(eyeSVG);

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
			let face = state.faces[0];
			if (face.x > state.eyePosition.x) {
				state.eyePosition.x = svgWidth - face.x; // + svgWidth/2; //state.eyePosition.x - animationIncrement;
			} else if (face.x < state.eyePosition.x) {
				state.eyePosition.x = svgWidth - face.x; //state.eyePosition.x + animationIncrement;
			} else {
				// equal, blink
			}
		}

		eyeSVG.setAttributeNS(null, 'r', '45');
		eyeSVG.setAttributeNS(null, 'cx', state.eyePosition.x.toString());
		eyeSVG.setAttributeNS(null, 'cy', state.eyePosition.y.toString());
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
