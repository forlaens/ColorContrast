function resetFileInput() {
	var files = id('image_file');
	files.value = '';

	if (window.clearImageThumbnail) {
		window.clearImageThumbnail();
	}

	if (window.updateSelectedFileName) {
		window.updateSelectedFileName();
	}
}

function toggleColorPicker(button) {
	var value = (button.getAttribute('aria-pressed') !== 'true');
	button.setAttribute('aria-pressed', value);
	if (value) {
		activateColorPicker(button);
	}
}

function activateColorPicker(button) {
	var preview = selector('#image_preview');
	preview.focus();
}

function getTestContrast() {
	var contrastValue = selector('[name=contrast]').value;
	return parseFloat(contrastValue);
}

function getTestColor() {
	var testColor = selector('[name=color]').value;
	return hexToRgb(testColor);
}

function setTestColorFromCanvas(e, canvas) {
	var position = getCanvasCursorPosition(e, canvas);
	var x = Math.floor(position.x);
	var y = Math.floor(position.y);

	moveCrosshairs(canvas, x, y);

	var color = pixelToHex(getContext(), x, y);
	setTestColor(color);
}

function setTestColor(hex) {
	if (hex == 'transparent') {
		hex = '#000000';
	}
	selector('[name=color]').value = hex;
}

function showResetBtn() {
	selector('#reset-image').hidden = false;
}

function hideResetBtn() {
	selector('#reset-image').hidden = true;
}

function placeCrosshairs(canvas) {
	var crosshairs = selector('#crosshairs');
	if (crosshairs.getAttribute('data-posx') === null) {
		moveCrosshairs(canvas, 20, 20);
		crosshairs.setAttribute('data-positioned', 'true');
	}
}

function moveCrosshairs(canvas, x, y) {
	var crosshairs = selector('#crosshairs');

	x = Math.max(x, 0);
	x = Math.min(x, canvas.offsetWidth);

	y = Math.max(y, 0);
	y = Math.min(y, canvas.offsetHeight);

	crosshairs.setAttribute('data-posx', x);
	crosshairs.setAttribute('data-posy', y);

	crosshairs.style.left = canvas.offsetLeft + x - (crosshairs.offsetWidth / 2) + 'px';
	crosshairs.style.top = canvas.offsetTop + y - (crosshairs.offsetWidth / 2) + 'px';
}

function pickColorFromCrosshairs() {
	var crosshairs = selector('#crosshairs');

	var x = parseInt(crosshairs.getAttribute('data-posx'));
	var y = parseInt(crosshairs.getAttribute('data-posy'));

	var color = pixelToHex(getContext(), x, y);
	setTestColor(color);
}
