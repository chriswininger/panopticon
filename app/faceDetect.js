module.exports = FaceDetect;

const cv = require('opencv');
const camWidth = 640;
const camHeigt = 480;
const camFps = 10;
const camInterval = 1000 /camFps;
const identifierColor = [0, 255, 0];
const EventEmitter = require('events');
const _ = require('lodash');

function FaceDetect () {
	this.events = new EventEmitter();
	this.startDetectionLoop();
}

_.extend(FaceDetect.prototype, {
	startDetectionLoop() {
		const _self = this;
		const camera = new cv.VideoCapture(1)

		camera.setWidth(camWidth);
		camera.setHeight(camHeigt);
		console.log('setup camera');
		setInterval(function() {
			camera.read(function(err, img) {
				if (img.width() <= 0)
					return;

				if (err)
					return console.error('error reading camera: ' + err);
				_processImage(img, _self.events);
			});
		}, camInterval);
	}
});

function _processImage(img, events) {
	img.convertGrayscale();
	img.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
		if (err)
			return console.error('Error: ' + err);

		for (let i = 0; i < faces.length; i++) {
			let x = faces[i];
			img.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
		}

		events.emit('frameAvailable', { img: img.toBuffer(), faces: faces });
		/*if (faces.length > 0) {
			events.emit('detected', { img: img.toBuffer(), faces: faces });
		}*/
	});
}
