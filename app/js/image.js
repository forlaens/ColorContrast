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

	var reader = new FileReader();
	reader.onload = function(event) {
		var loadedImage = new Image();

		loadedImage.onload = function() {
			image.file = loadedImage;
			image.zoom = null;
			showStep(2);

			try {
				updatePreviewCanvas();
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

	if (shouldAnnounce) {
		announceStatus(translate('zoomStatus').replace('{zoom}', Math.round(image.zoom * 100)));
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

	return true;
}

function updatePreviewControls() {
	var viewport = id('preview-viewport');
	var panControls = id('pan-controls');
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

function imageValidation(file) {
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

	if( !(/image/i).test(file.type) ) {
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

function setImageFile(file, shouldLoadPreview) {
	var fileInput = id('image_file');

	if (!fileInput || !imageValidation(file)) {
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
	clearError();
	return loadImageFile(file);
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

function initImageChooser() {
	var fileInput = id('image_file');

	if (fileInput) {
		fileInput.addEventListener('change', loadSelectedImageFromInput);
	}

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
	document.addEventListener('DOMContentLoaded', initImageChooser);
} else {
	initImageChooser();
}
