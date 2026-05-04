var cachedPixels = false;
var image = {};

window.onresize = recalcImage;

function recalcImage() {
	if (!image.dimensions || !image.dimensions.width) {
		return false;
	}

	updatePreviewCanvas();

	var context = getContext();
	cachePixels(context);
}

function loadImagePreview() {
	var files = id('image_file').files;
	var file = imageValidation(files[0]);

	if (!file) {
		showStep(1);
		return false;
	}

	cachedPixels = false;

	reader = new FileReader();
	reader.onload = function(event) {
		image.file = new Image;
		image.file.onload = updatePreviewCanvas;
		image.file.src = event.target.result;
	}
	reader.readAsDataURL(file);

	showStep(2);
}

function updatePreviewCanvas() {
	hideResetBtn();

	var canvas = getCanvas();
	var context = getContext();

	image.dimensions = scaleImage(canvas);
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

	if (!previewArea || !toolbar || !scrollArea || !image.file) {
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
	var preferredWidth = Math.min(image.file.width, availableWidth);
	var width = Math.max(preferredWidth, minimumWidth);

	previewArea.style.setProperty('--checker-min-width', minimumWidth + 'px');
	previewArea.style.width = width + 'px';
}

function cachePixels(context) {
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
		alert('The File APIs are not fully supported in this browser.');
		return false;
	}

	if (typeof FileReader === 'undefined') {
		alert('Your browser does not support this.');
		return false;
	}

	if (!file) {
		return false;
	}

	if( !(/image/i).test(file.type) ) {
		alert('File is not an image.');
		return false;
	}

	return file;
}
