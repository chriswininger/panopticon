module.exports = {
	map: function(val, x1, x2, y1, y2) {
		return (val -x1)/(Math.abs(x2-x1)) * Math.abs(y2 -y1) + y1;
	}
};