var cachedPixels = false;
var image = {};

window.onresize = recalcImage;

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
	var file = imageValidation(files[0]);

	if (!file) {
		showStep(2);
		showEmptyPreviewCanvas();
		return false;
	}

	cachedPixels = false;

	var reader = new FileReader();
	reader.onload = function(event) {
		var loadedImage = new Image();

		loadedImage.onload = function() {
			image.file = loadedImage;
			showStep(2);

			try {
				updatePreviewCanvas();
			} catch (error) {
				showStep(1);
				showError(error.message);
			}
		};

		loadedImage.onerror = function() {
			showStep(1);
			showError('The selected file could not be decoded as an image.');
		};

		loadedImage.src = event.target.result;
	}

	reader.onerror = function() {
		showStep(1);
		showError('The selected file could not be read. Please choose another image.');
	};

	reader.readAsDataURL(file);
}

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
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePreviewCanvas() {
	hideResetBtn();

	var canvas = getCanvas();
	var context = getContext();

	if (!canvas || !context) {
		throw new Error('Your browser could not initialize the image preview canvas.');
	}

	if (!image.file || !image.file.width || !image.file.height) {
		throw new Error('No readable image is loaded yet.');
	}

	image.dimensions = scaleImage(canvas);

	if (!image.dimensions.width || !image.dimensions.height) {
		throw new Error('The selected image could not be sized for preview.');
	}

	canvas.width = canvas.offsetWidth;
	canvas.height = image.dimensions.height;
	context.clearRect(0, 0, canvas.width, canvas.height);

	renderImage(context, image.file);
	cachePixels(context);
}

function scaleImage(canvas) {
	resizePreviewFrame();

	var canvasWidth = canvas.offsetWidth;
	var scale = Math.min(1, canvasWidth / image.file.width);

	var width = Math.floor(image.file.width * scale);
	var height = Math.floor(image.file.height * scale);

	return { width, height };
}

function resizePreviewFrame() {
	var previewArea = selector('#preview_area');
	var toolbar = selector('[role=toolbar]');
	var scrollArea = selector('.checker-scroll');

	if (!previewArea || !toolbar || !scrollArea) {
		return false;
	}

	var areaStyles = window.getComputedStyle(previewArea);
	var horizontalSpacing =
		parseFloat(areaStyles.paddingLeft) +
		parseFloat(areaStyles.paddingRight) +
		parseFloat(areaStyles.borderLeftWidth) +
		parseFloat(areaStyles.borderRightWidth);
	var minimumWidth = Math.ceil(toolbar.scrollWidth + horizontalSpacing);
	var availableWidth = scrollArea.clientWidth;
	var preferredWidth = image.file ? Math.min(image.file.width, availableWidth) : availableWidth;
	var width = Math.max(preferredWidth, minimumWidth);

	previewArea.style.setProperty('--checker-min-width', minimumWidth + 'px');
	previewArea.style.width = width + 'px';
}

function cachePixels(context) {
	if (!context || !image.dimensions) {
		throw new Error('The image preview is not ready yet.');
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

function imageValidation(file) {
	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		showError('This browser cannot read local image files.');
		return false;
	}

	if (typeof FileReader === 'undefined') {
		showError('This browser does not support image previews.');
		return false;
	}

	if (!file) {
		return false;
	}

	if( !(/image/i).test(file.type) ) {
		showError('Please choose an image file.');
		return false;
	}

	return file;
}
