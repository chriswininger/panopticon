const FaceDetect = require('./faceDetect.js');

window.onload = function() {
	var detection = new FaceDetect();
	const display = document.getElementById('display');
	const ctx = display.getContext('2d');
	const img = new Image();

	detection.events.on('detected', function(data) {
		// console.log('found %s face(s)', data.faces.length);
		const base64String = btoa(String.fromCharCode.apply(null, data.img));

		img.onload = function () {
			ctx.drawImage(this, 0, 0, display.width, display.height);
		};

		img.src = 'data:image/png;base64,' + base64String;
	});
};
