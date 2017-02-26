const cv = require('opencv');

cv.readImage('./MeAndMcAffee.jpeg', function(err, img) {
	if (err) {
		console.error('error: ' + error);
	}

/*	const width = img.width();
	const height = img.height();

	if (width < 1 || height < 1) {
		conole.error('image has no size?!');
	}

	img.convertGrayscale();
   cv.imgShow('img', img);

	const face_cascade = cv.CascadeClassifier('haarcascade_frontalface_default.xml');
	const eye_cascade = cv.CascadeClassifier('haarcascade_eye.xml');
	const faces = face_cascade.detectMultiScale(img, 1.3, 5);

*/
	img.convertGrayscale();
	img.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
		if (err)
			return console.log('Error: ' + err);

		console.log('found %s face(s)', faces.length);
		for (let i = 0; i < faces.length; i++) {
			let x = faces[i];
			img.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
		}

		img.save('./newImage_' + Date.now() + '.jpg');
	});
});
