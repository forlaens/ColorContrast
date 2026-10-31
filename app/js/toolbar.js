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

function getTestContrast() {
	var contrastValue = selector('[name=contrast]').value;
	return parseFloat(contrastValue);
}

function getTestColor() {
	var testColor = normalizeColorToHex(selector('[name=color]').value);
	return hexToRgb(testColor);
}

function setTestColor(hex, shouldAnnounce) {
	if (hex == 'transparent') {
		hex = '#000000';
	}
	var colorInput = selector('[name=color]');
	var nativeInput = id('test-color-native');
	var normalized = normalizeColorToHex(hex) || '#000000';

	colorInput.value = normalized;
	syncNativeColorControl(colorInput, nativeInput);
	colorInput.setAttribute('aria-invalid', 'false');
	id('test-color-error').hidden = true;
	updateSelectedTestColor(colorInput.value);
	if (window.markImageResultDirty) {
		window.markImageResultDirty();
	}
	storeCheckerSettings();

	if (shouldAnnounce) {
		announceStatus(translate('colorSelectedStatus').replace('{color}', formatColorForStatus(normalized)));
	}
}

function updateSelectedTestColor(color) {
	var selected = id('selected-test-color');

	if (!selected) {
		return false;
	}

	selected.textContent = color || '';
	selected.style.setProperty('--selected-color', color || 'transparent');
	return true;
}

function updateTestColorState() {
	var colorInput = selector('[name=color]');
	var error = id('test-color-error');
	var normalized = normalizeColorToHex(colorInput.value);
	var invalid = !normalized;

	colorInput.setAttribute('aria-invalid', invalid ? 'true' : 'false');
	error.hidden = !invalid;
	updateSelectedTestColor(normalized);

	if (window.markImageResultDirty) {
		window.markImageResultDirty();
	}

	return !invalid;
}

window.updateTestColorState = updateTestColorState;

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
		updateTestColorState();
		storeCheckerSettings();
	});

	contrastSelect.addEventListener('change', function () {
		storeCheckerSettings();
		if (window.markImageResultDirty) {
			window.markImageResultDirty();
		}
	});
	colorInput.setAttribute('aria-invalid', 'false');
	id('test-color-error').hidden = true;
	updateSelectedTestColor(colorInput.value);

	return true;
}

function showResetBtn() {
	selector('#reset-image').hidden = false;
}

function hideResetBtn() {
	selector('#reset-image').hidden = true;
}
