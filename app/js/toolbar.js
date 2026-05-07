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
	storeCheckerSettings();
}

function isValidTestColor(value) {
	return /^#[0-9a-f]{6}$/i.test(value);
}

function restoreCheckerSettings() {
	var colorInput = selector('[name=color]');
	var contrastSelect = selector('[name=contrast]');

	if (!colorInput || !contrastSelect) {
		return false;
	}

	var savedColor = getStoredValue(STORAGE_KEYS.testColor);
	var savedLevel = parseInt(getStoredValue(STORAGE_KEYS.conformanceLevel), 10);

	if (isValidTestColor(savedColor)) {
		colorInput.value = savedColor;
	}

	if (!Number.isNaN(savedLevel) && savedLevel >= 0 && savedLevel < contrastSelect.options.length) {
		contrastSelect.selectedIndex = savedLevel;
	}

	return true;
}

function storeCheckerSettings() {
	var colorInput = selector('[name=color]');
	var contrastSelect = selector('[name=contrast]');

	if (!colorInput || !contrastSelect) {
		return false;
	}

	if (isValidTestColor(colorInput.value)) {
		setStoredValue(STORAGE_KEYS.testColor, colorInput.value);
	}

	setStoredValue(STORAGE_KEYS.conformanceLevel, String(contrastSelect.selectedIndex));
	return true;
}

function initCheckerSettings() {
	var colorInput = selector('[name=color]');
	var contrastSelect = selector('[name=contrast]');

	if (!colorInput || !contrastSelect) {
		return false;
	}

	restoreCheckerSettings();

	colorInput.addEventListener('input', storeCheckerSettings);
	colorInput.addEventListener('change', storeCheckerSettings);
	contrastSelect.addEventListener('change', storeCheckerSettings);

	return true;
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
	var maxX = Math.max(0, canvas.offsetWidth - 1);
	var maxY = Math.max(0, canvas.offsetHeight - 1);

	x = Math.max(x, 0);
	x = Math.min(x, maxX);

	y = Math.max(y, 0);
	y = Math.min(y, maxY);

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
