function getCanvasCursorPosition(e, canvas) {
	var rect = canvas.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	return {
		x,
		y
	};
}

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

var shiftPressed = false;
function canvasKeyDown(canvas, e) {
	if (e.code == 'Enter' || e.code == 'Space') {
		e.preventDefault();
		pickColorFromCrosshairs();
		return;
	}

	if (e.key == 'Shift') {
		shiftPressed = true;
		return;
	}

	var crosshairs = selector('#crosshairs');

	var change = false;
	var x = parseInt(crosshairs.getAttribute('data-posx'));
	var y = parseInt(crosshairs.getAttribute('data-posy'));

	var speed = (shiftPressed ? 10 : 1);

	if (e.key == 'ArrowUp') {
		y -= 1 * speed;
		change = true;
	} else if (e.key == 'ArrowRight') {
		x += 1 * speed;
		change = true;
	} else if (e.key == 'ArrowDown') {
		y += 1 * speed;
		change = true;
	} else if (e.key == 'ArrowLeft') {
		x -= 1 * speed;
		change = true;
	}

	if (change) {
		e.preventDefault();
		moveCrosshairs(canvas, x, y);
	}
}

function canvasKeyUp(e) {
	if (e.key == 'Shift') {
		return (shiftPressed = false);
	}
}

function canvasBlur() {
	shiftPressed = false;
	selector('#colorpicker').setAttribute('aria-pressed', 'false');
}
