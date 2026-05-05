function pixelToHex(context, x, y) {
	var rgb = pixelToRgb(context, x, y);
	return rgbToHex(rgb);
}

function pixelToRgb(context, x, y) {
	var pixel = context.getImageData(x, y, 1, 1).data;
	return {
		'r': pixel[0],
		'g': pixel[1],
		'b': pixel[2],
		'a': pixel[3]
	};
}

function rgbToHex(color) {
	if (!color) {
		return '#000000';
	}

	var r = color.r;
	var g = color.g;
	var b = color.b;
	var a = color.a;

	if (a === 0) {
		return 'transparent';
	}

	return '#' +
		   ('0' + parseInt(r, 10).toString(16)).slice(-2) +
		   ('0' + parseInt(g, 10).toString(16)).slice(-2) +
		   ('0' + parseInt(b, 10).toString(16)).slice(-2);
}

function hexToRgb(hex) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
  
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
  }

function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
