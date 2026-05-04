function initRenderContrast() {
	if (!cachedPixels) {
		setLoadingState(true, 'Caching image and highlighting conflicting contrasts.');
	} else {
		setLoadingState(true, 'Highlighting conflicting contrasts.');
	}

	var context = getContext();

	setTimeout(renderContrastIssues.bind(null, context), 250);
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

	for (var x = 0; x < width; x++) {
		for (y = 0; y < height; y++) {
			renderContrastIssue(context, testContrast, testColor, x, y);
		}
	}

	showResetBtn();
	setLoadingState(false);
}

function renderContrastIssue(context, contrast, color1, x, y) {
	var color2 = getCachedPixel(x, y);

	if (!color2) {
		return false;
	}

	var color1Luminance = luminance(color1.r, color1.g, color1.b);
	var color2Luminance = luminance(color2.r, color2.g, color2.b);

	var ratio = color1Luminance > color2Luminance
		? ((color2Luminance + 0.05) / (color1Luminance + 0.05))
		: ((color1Luminance + 0.05) / (color2Luminance + 0.05));

	ratio = round(1 / ratio, 2);

	if (ratio < contrast) {
		drawPixel(context, color1, x, y);
	}
}