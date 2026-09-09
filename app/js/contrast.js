function initRenderContrast() {
	clearError();
	if (window.updateTestColorState && !window.updateTestColorState()) {
		selector('[name=color]').focus();
		return false;
	}
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
	setImageWorkflowState('analyzing');

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

	var overlay = id('contrast_overlay');
	var overlayContext = getContext(overlay);
	var failedPixels = applyContrastHighlights(overlayContext, image.contrastTest, true);
	overlay.hidden = false;
	id('show-problems').setAttribute('aria-pressed', 'true');
	id('show-original').setAttribute('aria-pressed', 'false');
	showResetBtn();
	setLoadingState(false);
	setImageWorkflowState('result');
	id('run-test').textContent = translate('findProblemAreas');
	announceContrastResult(failedPixels, image.dimensions.width * image.dimensions.height, image.contrastTest.contrast);
}

function applyContrastHighlights(context, test, shouldAnnounce) {
	var width = image.dimensions.width;
	var height = image.dimensions.height;
	var failedPixels = 0;
	var mask = context.createImageData(width, height);

	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			if (renderContrastIssue(context, test.contrast, test.color, x, y)) {
				var index = (x + y * width) * 4;
				var stripe = Math.floor((x + y) / 4) % 2 === 0 ? 0 : 255;
				mask.data[index] = stripe;
				mask.data[index + 1] = stripe;
				mask.data[index + 2] = stripe;
				mask.data[index + 3] = 215;
				failedPixels++;
			}
		}
	}

	context.clearRect(0, 0, width, height);
	context.putImageData(mask, 0, 0);

	return failedPixels;
}

function renderContrastIssue(context, contrast, color1, x, y) {
	var color2 = getCachedPixel(x, y);

	if (!color2) {
		return false;
	}

	var ratio = contrastRatio(color1, color2);

	if (ratio < contrast) {
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

	updateCheckerResult(message, {
		percentage: formatNumber(percentage),
		color: color,
		level: level
	});
	announceStatus(message);
}

function markImageResultDirty() {
	if (!image.file || !image.hasContrastHighlights) {
		return false;
	}

	var overlay = id('contrast_overlay');
	var overlayContext = getContext(overlay);

	image.hasContrastHighlights = false;
	image.contrastTest = null;
	overlayContext.clearRect(0, 0, overlay.width, overlay.height);
	overlay.hidden = false;
	updateCheckerResult('');
	hideResetBtn();
	setImageWorkflowState('dirty');
	id('run-test').textContent = translate('updateResults');
	announceStatus(translate('resultOutdatedStatus'));
	return true;
}

window.markImageResultDirty = markImageResultDirty;

function formatLevelForStatus(level) {
	return level ? level.charAt(0).toLocaleLowerCase() + level.slice(1) : level;
}
