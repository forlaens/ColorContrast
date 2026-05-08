function initRenderContrast() {
	clearError();
	storeCheckerSettings();

	if (!image.file || !image.dimensions) {
		showError(translate('loadBeforeTest'));
		return false;
	}

	if (!cachedPixels) {
		setLoadingState(true, translate('caching'));
	} else {
		setLoadingState(true, translate('highlighting'));
	}

	var context = getContext();

	if (!context) {
		setLoadingState(false);
		showError(translate('canvasError'));
		return false;
	}

	setTimeout(function() {
		try {
			renderContrastIssues(context);
		} catch (error) {
			setLoadingState(false);
			showError(error.message);
		}
	}, 250);
}

function renderContrastIssues(context) {
	updatePreviewCanvas({ preserveHighlights: false });

	image.contrastTest = {
		contrast: getTestContrast(),
		color: getTestColor()
	};
	image.hasContrastHighlights = true;

	var failedPixels = applyContrastHighlights(context, image.contrastTest, true);
	showResetBtn();
	setLoadingState(false);
	announceContrastResult(failedPixels, image.dimensions.width * image.dimensions.height, image.contrastTest.contrast);
}

function applyContrastHighlights(context, test, shouldAnnounce) {
	var width = image.dimensions.width;
	var height = image.dimensions.height;
	var failedPixels = 0;

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			if (renderContrastIssue(context, test.contrast, test.color, x, y)) {
				failedPixels++;
			}
		}
	}

	return failedPixels;
}

function renderContrastIssue(context, contrast, color1, x, y) {
	var color2 = getCachedPixel(x, y);

	if (!color2) {
		return false;
	}

	var ratio = contrastRatio(color1, color2);

	if (ratio < contrast) {
		drawPixel(context, color1, x, y);
		return true;
	}

	return false;
}

window.applyContrastHighlights = applyContrastHighlights;

function announceContrastResult(failedPixels, totalPixels, testContrast) {
	var color = formatColorForStatus(selector('[name=color]').value);
	var level = formatLevelForStatus(selector('[name=contrast]').selectedOptions[0].textContent.trim());
	var percentage = totalPixels ? round((failedPixels / totalPixels) * 100, 1) : 0;
	var key = failedPixels > 0 ? 'testCompleteStatus' : 'testCompleteNoIssuesStatus';
	var message = translate(key)
		.replace('{percent}', formatNumber(percentage))
		.replace('{color}', color)
		.replace('{ratio}', testContrast)
		.replace('{level}', level);

	updateCheckerResult(message);
	announceStatus(message);
}

function formatLevelForStatus(level) {
	return level ? level.charAt(0).toLocaleLowerCase() + level.slice(1) : level;
}
