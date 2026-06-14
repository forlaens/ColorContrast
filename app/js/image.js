var cachedPixels = false;
var image = {};
var imageDragDepth = 0;
var imageThumbnailUrl = null;
var zoomSteps = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

window.onresize = recalcImage;

// Keep the canvas and cached pixels aligned with the rendered preview size.
function recalcImage() {
	if (!image.dimensions || !image.dimensions.width) {
		return false;
	}

	try {
		updatePreviewCanvas();

		var context = getContext();
		cachePixels(context);
	} catch (error) {
		showError(error.message);
	}
}

function loadImagePreview() {
	clearError();

	var files = id('image_file').files;
	var file = files && files[0];

	if (!file) {
		updateSelectedFileName();
		clearImageThumbnail();
		showStep(2);
		showEmptyPreviewCanvas();
		announceStatus(translate('emptyCanvasStatus'));
		return false;
	}

	return loadSelectedImageFromInput();
}

function loadImageFile(file) {
	cachedPixels = false;
	image.hasContrastHighlights = false;
	image.contrastTest = null;
	hideImagePalette();

	var reader = new FileReader();
	reader.onload = function(event) {
		var loadedImage = new Image();

		loadedImage.onload = function() {
			image.file = loadedImage;
			image.zoom = null;
			showStep(2);

			try {
				updatePreviewCanvas();
				updateImagePalette();
				if (window.setIntroVisible) {
					window.setIntroVisible(true);
				}
				announceStatus(translate('imageLoadedStatus')
					.replace('{name}', file.name)
					.replace('{width}', formatNumber(image.file.width))
					.replace('{height}', formatNumber(image.file.height)));
			} catch (error) {
				showStep(1);
				showError(error.message);
			}
		};

		loadedImage.onerror = function() {
			showStep(1);
			showError(translate('decodeImageError'));
		};

		loadedImage.src = event.target.result;
	}

	reader.onerror = function() {
		showStep(1);
		showError(translate('readImageError'));
	};

	reader.readAsDataURL(file);
	return true;
}

function loadImageFromBlob(blob, name, options) {
	options = options || {};

	if (!blob) {
		showError(translate('readImageError'));
		return false;
	}

	var file;

	try {
		file = new File([blob], name || 'image-from-url', { type: blob.type || options.type || '' });
	} catch (error) {
		showError(translate('browserFileError'));
		return false;
	}

	return setImageFile(file, true, {
		allowUnknownType: options.allowUnknownType === true,
		source: options.source
	});
}

function clearFileSelectionDisplay() {
	var fileInput = id('image_file');

	if (fileInput) {
		fileInput.value = '';
	}

	clearImageThumbnail();
	updateSelectedFileName();
}

function clearImageUrlField() {
	var input = id('image_url');

	if (input) {
		input.value = '';
	}
}

function syncActiveImageSource(source) {
	if (source === 'url') {
		clearFileSelectionDisplay();
	} else if (source === 'file') {
		clearImageUrlField();
	}
}

function getFileNameFromUrl(url) {
	try {
		var path = new URL(url).pathname;
		var name = path.split('/').filter(Boolean).pop();
		return name ? decodeURIComponent(name).replace(/[?#].*$/, '') : 'image-from-url';
	} catch (error) {
		return 'image-from-url';
	}
}

function getValidatedImageUrl(value) {
	var url = (value || '').trim();

	if (!url) {
		showError(translate('imageUrlEmptyError'));
		return false;
	}

	try {
		var parsed = new URL(url, window.location.href);

		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			showError(translate('imageUrlInvalidError'));
			return false;
		}

		return parsed.href;
	} catch (error) {
		showError(translate('imageUrlInvalidError'));
		return false;
	}
}

function isImageUrlTypeAllowed(type) {
	return !type || type === 'application/octet-stream' || (/image/i).test(type);
}

function loadImageFromUrl(value) {
	clearError();

	var input = id('image_url');
	var url = getValidatedImageUrl(typeof value === 'string' ? value : input && input.value);

	if (!url) {
		return false;
	}

	if (typeof fetch !== 'function') {
		showError(translate('imageUrlFetchUnavailableError'));
		return false;
	}

	if (input) {
		input.value = url;
	}

	announceStatus(translate('imageUrlLoadingStatus'));

	return fetch(url, { mode: 'cors' })
		.then(function (response) {
			if (!response.ok) {
				throw new Error(translate('imageUrlHttpError').replace('{status}', response.status));
			}

			return response.blob();
		})
		.then(function (blob) {
			if (!isImageUrlTypeAllowed(blob.type)) {
				showError(translate('imageUrlTypeError'));
				return false;
			}

			return loadImageFromBlob(blob, getFileNameFromUrl(url), {
				allowUnknownType: true,
				source: 'url'
			});
		})
		.catch(function (error) {
			showStep(1);
			showError(error && error.message && error.message !== 'Failed to fetch'
				? error.message
				: translate('imageUrlFetchError'));
			return false;
		});
}

window.loadImageFromUrl = loadImageFromUrl;

// The empty canvas keeps the checker forgiving: users can enter the canvas view
// first and still upload or drag in an image later.
function showEmptyPreviewCanvas() {
	cachedPixels = false;
	image = {};
	hideResetBtn();

	var canvas = getCanvas();
	var context = getContext(canvas);

	if (!canvas || !context) {
		showError(translate('canvasError'));
		return false;
	}

	resizePreviewFrame();
	canvas.width = canvas.offsetWidth;
	canvas.height = 320;
	canvas.style.width = canvas.width + 'px';
	canvas.style.height = canvas.height + 'px';
	updateCanvasLayerSize(canvas.width, canvas.height);
	context.clearRect(0, 0, canvas.width, canvas.height);
	updatePreviewControls();
	updateCheckerResult('');
	hideImagePalette();
	if (window.setIntroVisible) {
		window.setIntroVisible(false);
	}
}

function hideImagePalette() {
	var card = id('palette-card');
	var swatches = id('palette-swatches');
	var matrix = id('palette-matrix');
	var summary = id('palette-summary');

	if (!card) {
		return false;
	}

	card.hidden = true;
	card.setAttribute('aria-hidden', 'true');

	if (swatches) {
		swatches.textContent = '';
	}

	if (matrix) {
		matrix.textContent = '';
	}

	if (summary) {
		summary.textContent = '';
	}

	return true;
}

function paletteColorDistance(color1, color2) {
	var red = color1.r - color2.r;
	var green = color1.g - color2.g;
	var blue = color1.b - color2.b;

	return Math.sqrt((red * red) + (green * green) + (blue * blue));
}

function quantizedPaletteKey(color) {
	return [
		Math.floor(color.r / 32),
		Math.floor(color.g / 32),
		Math.floor(color.b / 32)
	].join(',');
}

function extractImagePalette(maxColors) {
	if (!image.file || !image.file.width || !image.file.height) {
		return [];
	}

	var sampleCanvas = document.createElement('canvas');
	var sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
	var maxSampleSize = 140;
	var scale = Math.min(1, maxSampleSize / Math.max(image.file.width, image.file.height));
	var width = Math.max(1, Math.round(image.file.width * scale));
	var height = Math.max(1, Math.round(image.file.height * scale));
	var bins = {};
	var palette = [];

	if (!sampleContext) {
		return [];
	}

	sampleCanvas.width = width;
	sampleCanvas.height = height;
	sampleContext.drawImage(image.file, 0, 0, width, height);

	var pixels = sampleContext.getImageData(0, 0, width, height).data;

	for (var i = 0; i < pixels.length; i += 4) {
		if (pixels[i + 3] < 160) {
			continue;
		}

		var color = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
		var key = quantizedPaletteKey(color);

		if (!bins[key]) {
			bins[key] = { r: 0, g: 0, b: 0, count: 0 };
		}

		bins[key].r += color.r;
		bins[key].g += color.g;
		bins[key].b += color.b;
		bins[key].count++;
	}

	var candidates = Object.keys(bins).map(function (key) {
		var bin = bins[key];

		return {
			r: Math.round(bin.r / bin.count),
			g: Math.round(bin.g / bin.count),
			b: Math.round(bin.b / bin.count),
			count: bin.count
		};
	}).sort(function (a, b) {
		return b.count - a.count;
	});

	for (var c = 0; c < candidates.length && palette.length < maxColors; c++) {
		var candidate = candidates[c];
		var isDistinct = palette.every(function (selected) {
			return paletteColorDistance(candidate, selected) >= 44;
		});

		if (isDistinct) {
			palette.push(candidate);
		}
	}

	for (var f = 0; f < candidates.length && palette.length < maxColors; f++) {
		if (palette.indexOf(candidates[f]) === -1) {
			palette.push(candidates[f]);
		}
	}

	return palette;
}

function paletteHex(color) {
	return rgbToHex({ r: color.r, g: color.g, b: color.b, a: 255 });
}

function appendPaletteSwatches(container, colors) {
	colors.forEach(function (color) {
		var hex = paletteHex(color);
		var swatch = document.createElement('li');
		var preview = document.createElement('span');
		var code = document.createElement('span');
		var name = document.createElement('span');

		swatch.className = 'palette-swatch';
		preview.className = 'palette-swatch-preview';
		preview.style.backgroundColor = hex;
		code.className = 'palette-swatch-code';
		code.textContent = hex;
		name.textContent = describeRgbColor(color);

		swatch.appendChild(preview);
		swatch.appendChild(code);
		swatch.appendChild(name);
		container.appendChild(swatch);
	});
}

function createPaletteColorHeading(color) {
	var hex = paletteHex(color);
	var heading = document.createElement('span');
	var preview = document.createElement('span');
	var code = document.createElement('span');

	heading.className = 'palette-color-heading';
	preview.className = 'palette-swatch-preview';
	preview.style.backgroundColor = hex;
	code.className = 'palette-swatch-code';
	code.textContent = hex;

	heading.appendChild(preview);
	heading.appendChild(code);
	return heading;
}

function appendPaletteMatrix(container, colors) {
	var table = document.createElement('table');
	var caption = document.createElement('caption');
	var thead = document.createElement('thead');
	var headRow = document.createElement('tr');
	var tbody = document.createElement('tbody');
	var emptyHead = document.createElement('th');
	var threshold = 4.5;

	caption.className = 'sr-only';
	caption.textContent = translate('paletteMatrixCaption');
	table.appendChild(caption);
	emptyHead.scope = 'col';
	headRow.appendChild(emptyHead);

	colors.forEach(function (color) {
		var th = document.createElement('th');
		th.scope = 'col';
		th.appendChild(createPaletteColorHeading(color));
		headRow.appendChild(th);
	});

	thead.appendChild(headRow);
	table.appendChild(thead);

	colors.forEach(function (rowColor) {
		var row = document.createElement('tr');
		var th = document.createElement('th');
		th.scope = 'row';
		th.appendChild(createPaletteColorHeading(rowColor));
		row.appendChild(th);

		colors.forEach(function (columnColor) {
			var td = document.createElement('td');
			var ratio = contrastRatio(rowColor, columnColor);
			var passes = ratio >= threshold;

			td.className = passes ? 'palette-pass' : 'palette-fail';
			td.textContent = translate(passes ? 'palettePass' : 'paletteFail') + ' ' + formatNumber(ratio) + ':1';
			row.appendChild(td);
		});

		tbody.appendChild(row);
	});

	table.appendChild(tbody);
	container.appendChild(table);
}

function updateImagePalette() {
	var card = id('palette-card');
	var swatches = id('palette-swatches');
	var matrix = id('palette-matrix');
	var summary = id('palette-summary');

	if (!card || !swatches || !matrix || !summary) {
		return false;
	}

	try {
		var colors = extractImagePalette(6);

		if (!colors.length) {
			hideImagePalette();
			return false;
		}

		swatches.textContent = '';
		matrix.textContent = '';
		appendPaletteSwatches(swatches, colors);
		appendPaletteMatrix(matrix, colors);
		summary.textContent = translate('paletteSummary').replace('{count}', colors.length);
		card.hidden = false;
		card.removeAttribute('aria-hidden');
		return true;
	} catch (error) {
		hideImagePalette();
		return false;
	}
}

function updatePreviewCanvas(options) {
	options = options || {};

	var canvas = getCanvas();
	var context = getContext();

	if (!canvas || !context) {
		throw new Error(translate('canvasError'));
	}

	if (!image.file || !image.file.width || !image.file.height) {
		throw new Error(translate('noReadableImageError'));
	}

	var shouldPreserveHighlights = options.preserveHighlights !== false && image.hasContrastHighlights && image.contrastTest;
	image.dimensions = scaleImage(canvas);

	if (!image.dimensions.width || !image.dimensions.height) {
		throw new Error(translate('imageSizeError'));
	}

	canvas.width = image.dimensions.width;
	canvas.height = image.dimensions.height;
	canvas.style.width = image.dimensions.width + 'px';
	canvas.style.height = image.dimensions.height + 'px';
	updateCanvasLayerSize(image.dimensions.width, image.dimensions.height);
	context.clearRect(0, 0, canvas.width, canvas.height);

	renderImage(context, image.file);
	cachePixels(context);
	updatePreviewControls();
	schedulePreviewControlsUpdate();

	if (shouldPreserveHighlights && window.applyContrastHighlights) {
		applyContrastHighlights(context, image.contrastTest, false);
		showResetBtn();
	} else {
		image.hasContrastHighlights = false;
		image.contrastTest = null;
		hideResetBtn();
		updateCheckerResult('');
	}
}

function resetPreviewImage() {
	try {
		image.hasContrastHighlights = false;
		image.contrastTest = null;
		updatePreviewCanvas({ preserveHighlights: false });
		announceStatus(translate('imageResetStatus'));
	} catch (error) {
		showError(error.message);
	}
}

function scaleImage(canvas) {
	resizePreviewFrame();

	var viewport = id('preview-viewport');
	var viewportWidth = viewport ? viewport.clientWidth : canvas.offsetWidth;
	var viewportHeight = getPreviewFitHeight(viewport);
	var widthFitScale = viewportWidth / image.file.width;
	var heightFitScale = viewportHeight / image.file.height;
	var fitScale = Math.min(widthFitScale, heightFitScale);
	var scale = image.zoom || fitScale;

	var width = Math.max(1, Math.floor(image.file.width * scale));
	var height = Math.max(1, Math.floor(image.file.height * scale));

	return { width, height };
}

function getPreviewFitHeight(viewport) {
	if (!viewport) {
		return 320;
	}

	var style = window.getComputedStyle(viewport);
	var maxHeight = parseFloat(style.maxHeight);

	if (Number.isFinite(maxHeight) && maxHeight > 0) {
		return maxHeight;
	}

	var rect = viewport.getBoundingClientRect();
	var availableHeight = window.innerHeight - rect.top - 24;

	return Math.max(240, availableHeight);
}

function getCurrentZoom() {
	if (!image.file) {
		return 1;
	}

	if (image.zoom) {
		return image.zoom;
	}

	var viewport = id('preview-viewport');
	var viewportWidth = viewport ? viewport.clientWidth : 1;
	var viewportHeight = getPreviewFitHeight(viewport);
	return Math.min(viewportWidth / image.file.width, viewportHeight / image.file.height);
}

function setPreviewZoom(zoom, shouldAnnounce) {
	if (!image.file) {
		return false;
	}

	image.zoom = Math.max(zoomSteps[0], Math.min(zoomSteps[zoomSteps.length - 1], zoom));
	updatePreviewCanvas();
	schedulePreviewControlsUpdate();

	if (shouldAnnounce) {
		schedulePreviewStatusAnnouncement(function () {
			return getZoomPreviewStatus();
		});
	}

	return true;
}

function zoomPreview(direction) {
	var currentZoom = getCurrentZoom();
	var nextZoom = zoomSteps[zoomSteps.length - 1];

	for (var i = 0; i < zoomSteps.length; i++) {
		if (direction < 0 && zoomSteps[i] < currentZoom) {
			nextZoom = zoomSteps[i];
		} else if (direction > 0 && zoomSteps[i] > currentZoom) {
			nextZoom = zoomSteps[i];
			break;
		}
	}

	return setPreviewZoom(nextZoom, true);
}

function resetPreviewZoom() {
	return setPreviewZoom(1, true);
}

function panPreview(xDirection, yDirection) {
	var viewport = id('preview-viewport');

	if (!viewport) {
		return false;
	}

	viewport.scrollBy({
		left: xDirection * Math.max(80, viewport.clientWidth * 0.25),
		top: yDirection * Math.max(80, viewport.clientHeight * 0.25),
		behavior: 'smooth'
	});
	updatePanDirectionButtons();
	schedulePreviewStatusAnnouncement(function () {
		return getPanPreviewStatus();
	});

	return true;
}

function isPreviewDraggable() {
	var viewport = id('preview-viewport');

	return !!(viewport && viewport.classList.contains('can-pan'));
}

function hasPreviewImage() {
	return !!(image.file && image.dimensions);
}

function isHandToolActive() {
	var button = id('hand-tool');
	var viewport = id('preview-viewport');

	return !!(button && viewport && button.getAttribute('aria-pressed') === 'true' && hasPreviewImage());
}

function setHandToolActive(active) {
	var button = id('hand-tool');
	var viewport = id('preview-viewport');

	if (!button || !viewport) {
		return false;
	}

	active = active === true && hasPreviewImage();

	if (active && window.setColorPickerActive) {
		window.setColorPickerActive(false);
	}

	button.setAttribute('aria-pressed', active ? 'true' : 'false');
	viewport.classList.toggle('is-hand-tool', active);
	viewport.classList.remove('is-dragging-preview');
	return true;
}

function toggleHandTool(button) {
	return setHandToolActive(button && button.getAttribute('aria-pressed') !== 'true');
}

window.isHandToolActive = isHandToolActive;
window.setHandToolActive = setHandToolActive;

function updatePanDirectionButtons() {
	var viewport = id('preview-viewport');
	var controls = id('pan-controls');

	if (!viewport || !controls) {
		return false;
	}

	var maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
	var maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
	var canMove = {
		left: viewport.scrollLeft > 1,
		right: viewport.scrollLeft < maxScrollLeft - 1,
		up: viewport.scrollTop > 1,
		down: viewport.scrollTop < maxScrollTop - 1
	};
	var buttons = controls.querySelectorAll('[data-pan-direction]');

	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		var direction = button.getAttribute('data-pan-direction');
		button.hidden = !canMove[direction];
	}

	return true;
}

function schedulePreviewStatusAnnouncement(getMessage) {
	var delay = 260;

	if (typeof window.setTimeout !== 'function') {
		announceStatus(getMessage());
		return true;
	}

	window.setTimeout(function () {
		announceStatus(getMessage());
	}, delay);
	return true;
}

function getZoomPreviewStatus() {
	var zoom = Math.round(getCurrentZoom() * 100);
	var status = getPreviewVisibilityStatus();

	return translate('zoomStatus')
		.replace('{zoom}', zoom)
		.replace('{visible}', status.visiblePercent)
		.replace('{directions}', status.directionText);
}

function getPanPreviewStatus() {
	return translate('panStatus').replace('{directions}', getPreviewVisibilityStatus().directionText);
}

function getPreviewVisibilityStatus() {
	var viewport = id('preview-viewport');

	if (!viewport) {
		return {
			visiblePercent: 100,
			directionText: 'No scrolling available.'
		};
	}

	var visibleArea = viewport.clientWidth * viewport.clientHeight;
	var totalArea = Math.max(1, viewport.scrollWidth * viewport.scrollHeight);
	var visiblePercent = Math.min(100, Math.max(1, Math.round((visibleArea / totalArea) * 100)));
	var directions = getAvailableScrollDirections(viewport);

	return {
		visiblePercent: visiblePercent,
		directionText: formatScrollDirections(directions)
	};
}

function getAvailableScrollDirections(viewport) {
	var maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
	var maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
	var directions = [];

	if (viewport.scrollLeft > 1) {
		directions.push('left');
	}

	if (viewport.scrollLeft < maxScrollLeft - 1) {
		directions.push('right');
	}

	if (viewport.scrollTop > 1) {
		directions.push('up');
	}

	if (viewport.scrollTop < maxScrollTop - 1) {
		directions.push('down');
	}

	return directions;
}

function formatScrollDirections(directions) {
	if (!directions.length) {
		return translate('scrollNoDirections');
	}

	return translate('scrollDirections').replace('{directions}', formatDirectionList(directions));
}

function formatDirectionList(directions) {
	var names = [];

	for (var i = 0; i < directions.length; i++) {
		names.push(translate('direction' + directions[i].charAt(0).toUpperCase() + directions[i].slice(1)));
	}

	if (names.length === 1) {
		return names[0];
	}

	if (names.length === 2) {
		return names[0] + ' and ' + names[1];
	}

	return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
}

function schedulePreviewControlsUpdate() {
	if (typeof window.requestAnimationFrame !== 'function') {
		return updatePreviewControls();
	}

	window.requestAnimationFrame(function () {
		updatePreviewControls();
	});
	return true;
}

function updatePreviewControls() {
	var viewport = id('preview-viewport');
	var panControls = id('pan-controls');
	var handTool = id('hand-tool');
	var zoomOutput = id('zoom-output');
	var zoomOut = id('zoom-out');
	var zoomIn = id('zoom-in');
	var zoomReset = id('zoom-reset');
	var hasImage = !!(image.file && image.dimensions);
	var currentZoom = getCurrentZoom();

	if (zoomOutput) {
		zoomOutput.value = Math.round(currentZoom * 100) + '%';
		zoomOutput.textContent = Math.round(currentZoom * 100) + '%';
	}

	if (zoomOut) {
		zoomOut.disabled = !hasImage || currentZoom <= zoomSteps[0];
	}

	if (zoomIn) {
		zoomIn.disabled = !hasImage || currentZoom >= zoomSteps[zoomSteps.length - 1];
	}

	if (zoomReset) {
		zoomReset.disabled = !hasImage;
	}

	if (!viewport || !panControls) {
		return false;
	}

	var canPan = hasImage && (
		viewport.scrollWidth > viewport.clientWidth + 1 ||
		viewport.scrollHeight > viewport.clientHeight + 1
	);

	panControls.hidden = !canPan;
	viewport.classList.toggle('can-pan', canPan);
	updatePanDirectionButtons();

	if (handTool) {
		handTool.disabled = !canPan;
		handTool.style.visibility = canPan ? '' : 'hidden';
	}

	if (!canPan) {
		setHandToolActive(false);
	}

	return true;
}

function resizePreviewFrame() {
	var previewArea = selector('#preview_area');
	var toolbar = selector('[role=toolbar]');
	var scrollArea = selector('.checker-scroll');

	if (!previewArea || !toolbar || !scrollArea) {
		return false;
	}

	previewArea.style.setProperty('--checker-min-width', '0px');
	previewArea.style.width = '100%';
}

// Cache the original image pixels before we draw contrast highlights over them.
function cachePixels(context) {
	if (!context || !image.dimensions) {
		throw new Error(translate('imagePreviewNotReady'));
	}

	cachedPixels = context.getImageData(0, 0, image.dimensions.width, image.dimensions.height).data;
}

function getCachedPixel(x, y) {
	var index = (x + y * image.dimensions.width) * 4;
	return {
		'r': cachedPixels[index+0],
		'g': cachedPixels[index+1],
		'b': cachedPixels[index+2],
		'a': cachedPixels[index+3]
	};
}

function imageValidation(file, options) {
	options = options || {};

	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		showError(translate('browserFileError'));
		return false;
	}

	if (typeof FileReader === 'undefined') {
		showError(translate('browserPreviewError'));
		return false;
	}

	if (!file) {
		return false;
	}

	if( !(/image/i).test(file.type) && !(options.allowUnknownType && isImageUrlTypeAllowed(file.type)) ) {
		showError(translate('imageTypeError'));
		return false;
	}

	return file;
}

function getImageFileFromTransfer(dataTransfer) {
	if (!dataTransfer || !dataTransfer.files) {
		return false;
	}

	for (var i = 0; i < dataTransfer.files.length; i++) {
		var file = dataTransfer.files[i];

		if (file && (/image/i).test(file.type)) {
			return file;
		}
	}

	return false;
}

function hasImageDrag(dataTransfer) {
	if (!dataTransfer) {
		return false;
	}

	if (dataTransfer.items) {
		for (var i = 0; i < dataTransfer.items.length; i++) {
			var item = dataTransfer.items[i];

			if (item.kind === 'file' && (/image/i).test(item.type)) {
				return true;
			}
		}
	}

	return dataTransfer.types && Array.prototype.indexOf.call(dataTransfer.types, 'Files') !== -1;
}

function setImageFile(file, shouldLoadPreview, options) {
	options = options || {};

	var fileInput = id('image_file');

	if (!fileInput || !imageValidation(file, options)) {
		return false;
	}

	try {
		var transfer = new DataTransfer();
		transfer.items.add(file);
		fileInput.files = transfer.files;
	} catch (error) {
		showError(translate('droppedFilePickerError'));
		return false;
	}

	showImageThumbnail(file);
	updateSelectedFileName();
	syncActiveImageSource(options.source === 'url' ? 'url' : 'file');
	clearError();

	if (shouldLoadPreview) {
		return loadImageFile(file);
	}

	showStep(1);
	return true;
}

function showImageThumbnail(file) {
	var thumbnail = id('image-thumbnail');

	if (!thumbnail) {
		return false;
	}

	clearImageThumbnail();
	imageThumbnailUrl = URL.createObjectURL(file);
	thumbnail.src = imageThumbnailUrl;
	thumbnail.hidden = false;
	return true;
}

function updateImageSelectionPreview() {
	var fileInput = id('image_file');
	updateSelectedFileName();

	if (!fileInput || !fileInput.files || !fileInput.files[0]) {
		clearImageThumbnail();
		return false;
	}

	var file = imageValidation(fileInput.files[0]);

	if (!file) {
		clearImageThumbnail();
		return false;
	}

	return showImageThumbnail(file);
}

function loadSelectedImageFromInput() {
	var fileInput = id('image_file');
	updateSelectedFileName();

	if (!fileInput || !fileInput.files || !fileInput.files[0]) {
		clearImageThumbnail();
		return false;
	}

	var file = imageValidation(fileInput.files[0]);

	if (!file) {
		clearImageThumbnail();
		return false;
	}

	showImageThumbnail(file);
	syncActiveImageSource('file');
	clearError();
	return loadImageFile(file);
}

function getImageFileFromClipboard(clipboardData) {
	if (!clipboardData) {
		return false;
	}

	if (clipboardData.files && clipboardData.files.length) {
		return getImageFileFromTransfer(clipboardData);
	}

	if (clipboardData.items) {
		for (var i = 0; i < clipboardData.items.length; i++) {
			var item = clipboardData.items[i];

			if (item.kind === 'file' && (/image/i).test(item.type)) {
				return item.getAsFile();
			}
		}
	}

	return false;
}

function getUrlFromClipboard(clipboardData) {
	if (!clipboardData || typeof clipboardData.getData !== 'function') {
		return false;
	}

	return clipboardData.getData('text/uri-list') || clipboardData.getData('text/plain') || false;
}

function isEditablePasteTarget(target) {
	return !!(target && (
		target.matches('input, textarea, select') ||
		target.isContentEditable
	));
}

function updateSelectedFileName() {
	var fileInput = id('image_file');
	var fileName = id('selected-file-name');

	if (!fileName) {
		return false;
	}

	if (fileInput && fileInput.files && fileInput.files[0]) {
		fileName.textContent = fileInput.files[0].name;
	} else {
		fileName.textContent = translate('noFileChosen');
	}

	return true;
}

function clearImageThumbnail() {
	var thumbnail = id('image-thumbnail');

	if (imageThumbnailUrl) {
		URL.revokeObjectURL(imageThumbnailUrl);
		imageThumbnailUrl = null;
	}

	if (thumbnail) {
		thumbnail.hidden = true;
		thumbnail.removeAttribute('src');
	}
}

function updateCheckerResult(message) {
	var result = id('checker-result');

	if (!result) {
		return false;
	}

	result.textContent = message || '';
	return true;
}

window.updateSelectedFileName = updateSelectedFileName;
window.clearImageThumbnail = clearImageThumbnail;

function setImageDragState(active) {
	var dropzone = selector('.upload-dropzone');
	document.body.classList.toggle('is-dragging-image', active);

	if (dropzone) {
		dropzone.classList.toggle('is-drag-target', active);
	}
}

function initPreviewDragging() {
	var viewport = id('preview-viewport');
	var dragState = null;

	if (!viewport) {
		return false;
	}

	viewport.addEventListener('pointerdown', function (event) {
		if (!isHandToolActive() || event.button !== 0 || event.target.closest('button')) {
			return;
		}

		event.preventDefault();
		dragState = {
			pointerId: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			scrollLeft: viewport.scrollLeft,
			scrollTop: viewport.scrollTop
		};
		viewport.classList.add('is-dragging-preview');

		if (viewport.setPointerCapture) {
			viewport.setPointerCapture(event.pointerId);
		}
	});

	viewport.addEventListener('pointermove', function (event) {
		if (!dragState || event.pointerId !== dragState.pointerId) {
			return;
		}

		event.preventDefault();
		viewport.scrollLeft = dragState.scrollLeft + (dragState.x - event.clientX);
		viewport.scrollTop = dragState.scrollTop + (dragState.y - event.clientY);
		updatePanDirectionButtons();
	});

	function stopDragging(event) {
		if (!dragState || event.pointerId !== dragState.pointerId) {
			return;
		}

		if (viewport.releasePointerCapture) {
			viewport.releasePointerCapture(event.pointerId);
		}

		dragState = null;
		viewport.classList.remove('is-dragging-preview');
	}

	viewport.addEventListener('pointerup', stopDragging);
	viewport.addEventListener('pointercancel', stopDragging);
	viewport.addEventListener('scroll', updatePanDirectionButtons);
	window.addEventListener('scroll', updatePanDirectionButtons);
	window.addEventListener('resize', updatePanDirectionButtons);
	viewport.addEventListener('lostpointercapture', function () {
		dragState = null;
		viewport.classList.remove('is-dragging-preview');
	});

	return true;
}

function initImageChooser() {
	var fileInput = id('image_file');
	var urlInput = id('image_url');

	if (fileInput) {
		fileInput.addEventListener('change', loadSelectedImageFromInput);
	}

	if (urlInput) {
		urlInput.addEventListener('input', function () {
			if (urlInput.value.trim()) {
				clearFileSelectionDisplay();
			}
		});

		urlInput.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				loadImageFromUrl();
			}
		});
	}

	document.addEventListener('paste', function (event) {
		var file = getImageFileFromClipboard(event.clipboardData);

		if (file) {
			event.preventDefault();
			setImageFile(file, true);
			announceStatus(translate('pasteImageStatus'));
			return;
		}

		if (isEditablePasteTarget(event.target)) {
			return;
		}

		var url = getUrlFromClipboard(event.clipboardData);

		if (url) {
			event.preventDefault();
			loadImageFromUrl(url);
		}
	});

	document.addEventListener('dragenter', function (event) {
		if (!hasImageDrag(event.dataTransfer)) {
			return;
		}

		event.preventDefault();
		imageDragDepth++;
		setImageDragState(true);
	});

	document.addEventListener('dragover', function (event) {
		if (!hasImageDrag(event.dataTransfer)) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
		setImageDragState(true);
	});

	document.addEventListener('dragleave', function (event) {
		if (!hasImageDrag(event.dataTransfer)) {
			return;
		}

		imageDragDepth = Math.max(0, imageDragDepth - 1);

		if (imageDragDepth === 0) {
			setImageDragState(false);
		}
	});

	document.addEventListener('drop', function (event) {
		if (!hasImageDrag(event.dataTransfer)) {
			return;
		}

		event.preventDefault();
		imageDragDepth = 0;
		setImageDragState(false);

		var file = getImageFileFromTransfer(event.dataTransfer);
		if (file) {
			setImageFile(file, true);
		}
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initImageChooser();
		initPreviewDragging();
	});
} else {
	initImageChooser();
	initPreviewDragging();
}
