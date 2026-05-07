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
	if (!cachedPixels) {
		cachePixels(context);
	}

	updatePreviewCanvas();

	var width = image.dimensions.width;
	var height = image.dimensions.height;

	var testContrast = getTestContrast();
	var testColor = getTestColor();
	var failedPixels = 0;

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			if (renderContrastIssue(context, testContrast, testColor, x, y)) {
				failedPixels++;
			}
		}
	}

	showResetBtn();
	setLoadingState(false);
	announceContrastResult(failedPixels, width * height, testContrast);
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

function announceContrastResult(failedPixels, totalPixels, testContrast) {
	var color = selector('[name=color]').value;
	var level = selector('[name=contrast]').selectedOptions[0].textContent.trim();
	var percentage = totalPixels ? round((failedPixels / totalPixels) * 100, 1) : 0;
	var key = failedPixels > 0 ? 'testCompleteStatus' : 'testCompleteNoIssuesStatus';
	var message = translate(key)
		.replace('{failed}', formatNumber(failedPixels))
		.replace('{total}', formatNumber(totalPixels))
		.replace('{percent}', formatNumber(percentage))
		.replace('{color}', color)
		.replace('{ratio}', testContrast)
		.replace('{level}', level);

	updateCheckerResult(message);
	announceStatus(message);
}
