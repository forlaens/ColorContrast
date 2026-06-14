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

function setColorPickerActive(active) {
	var button = id('colorpicker');
	var viewport = id('preview-viewport');

	if (!button) {
		return false;
	}

	active = active === true;
	button.setAttribute('aria-pressed', active ? 'true' : 'false');

	if (viewport) {
		viewport.classList.toggle('is-color-picker', active);
	}

	return true;
}

function isColorPickerActive() {
	var button = id('colorpicker');

	return !!(button && button.getAttribute('aria-pressed') === 'true');
}

function toggleColorPicker(button) {
	var value = (button.getAttribute('aria-pressed') !== 'true');

	if (value && window.setHandToolActive) {
		window.setHandToolActive(false);
	}

	setColorPickerActive(value);

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
	var testColor = normalizeColorToHex(selector('[name=color]').value);
	return hexToRgb(testColor);
}

function setTestColorFromCanvas(e, canvas) {
	if ((window.isHandToolActive && window.isHandToolActive()) || !isColorPickerActive()) {
		return false;
	}

	var position = getCanvasCursorPosition(e, canvas);
	var x = Math.floor(position.x);
	var y = Math.floor(position.y);

	moveCrosshairs(canvas, x, y);

	var color = pixelToHex(getContext(), x, y);
	setTestColor(color, true);
}

window.setColorPickerActive = setColorPickerActive;

function setTestColor(hex, shouldAnnounce) {
	if (hex == 'transparent') {
		hex = '#000000';
	}
	var colorInput = selector('[name=color]');
	var nativeInput = id('test-color-native');
	var normalized = normalizeColorToHex(hex) || '#000000';

	colorInput.value = normalized;
	syncNativeColorControl(colorInput, nativeInput);
	storeCheckerSettings();

	if (shouldAnnounce) {
		announceStatus(translate('colorSelectedStatus').replace('{color}', formatColorForStatus(normalized)));
	}
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

	var normalized = normalizeColorToHex(colorInput.value);

	if (isValidTestColor(normalized)) {
		setStoredValue(STORAGE_KEYS.testColor, normalized);
	}

	setStoredValue(STORAGE_KEYS.conformanceLevel, String(contrastSelect.selectedIndex));
	return true;
}

function initCheckerSettings() {
	var colorInput = selector('[name=color]');
	var nativeInput = id('test-color-native');
	var contrastSelect = selector('[name=contrast]');

	if (!colorInput || !contrastSelect) {
		return false;
	}

	restoreCheckerSettings();
	initHexColorField(colorInput, nativeInput, function () {
		storeCheckerSettings();
	});

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
	var maxX = Math.max(0, canvas.width - 1);
	var maxY = Math.max(0, canvas.height - 1);

	x = Math.max(x, 0);
	x = Math.min(x, maxX);

	y = Math.max(y, 0);
	y = Math.min(y, maxY);

	crosshairs.setAttribute('data-posx', x);
	crosshairs.setAttribute('data-posy', y);

	crosshairs.style.left = canvas.offsetLeft + x - (crosshairs.offsetWidth / 2) + 'px';
	crosshairs.style.top = y - (crosshairs.offsetWidth / 2) + 'px';
}

function pickColorFromCrosshairs() {
	var crosshairs = selector('#crosshairs');

	var x = parseInt(crosshairs.getAttribute('data-posx'));
	var y = parseInt(crosshairs.getAttribute('data-posy'));

	var color = pixelToHex(getContext(), x, y);
	setTestColor(color, true);
}
