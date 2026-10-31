function getCanvas() {
	var canvas = selector('#image_preview');
	if (!canvas || typeof canvas.getContext === 'undefined') {
		return false;
	}
	return canvas;
}

function getContext(canvas) {
	if (!canvas) {
		canvas = getCanvas();
	}

	if (!canvas) {
		return false;
	}

	return canvas.getContext('2d', { willReadFrequently: true });
}

function renderImage(context, img) {
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = 'high';
	context.drawImage(img, 0, 0, image.file.width, image.file.height, 0, 0, image.dimensions.width, image.dimensions.height);
}

function updateCanvasLayerSize(width, height) {
	var layer = id('preview-canvas-layer');

	if (!layer) {
		return false;
	}

	layer.style.width = width + 'px';
	layer.style.height = height + 'px';
	return true;
}

function drawPixel(context, color, x, y) {
	color = rgbToHex(color);
	if (color == 'transparent') {
		context.clearRect(x, y, 1, 1);
	} else {
		context.fillStyle = color;
		context.fillRect(x, y, 1, 1);
	}
}
