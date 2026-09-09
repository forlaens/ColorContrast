function showStep(stepNumber) {
	var step1 = id('step-1');
	var step2 = id('step-2');
	var imageSummary = id('loaded-image-summary');
	var isCheckerView = stepNumber === 2;

	step1.hidden = isCheckerView;
	step2.hidden = !isCheckerView;
	imageSummary.hidden = !isCheckerView;

	if (isCheckerView) {
		step1.setAttribute('aria-hidden', 'true');
		step2.removeAttribute('aria-hidden');
		imageSummary.removeAttribute('aria-hidden');
	} else {
		step1.removeAttribute('aria-hidden');
		step2.setAttribute('aria-hidden', 'true');
		imageSummary.setAttribute('aria-hidden', 'true');
	}
}

function isAccessibilityStatementView() {
	return window.location.hash === '#accessibility-statement';
}

function isSimpleContrastView() {
	return window.location.hash === '#simple-contrast';
}

function isImageContrastView() {
	return window.location.hash === '#image-contrast';
}

function updateDocumentTitleForView() {
	if (!window.translate) {
		return false;
	}

	if (isAccessibilityStatementView()) {
		document.title = translate('accessibilityTitle') + ' - ' + translate('title');
	} else if (isSimpleContrastView()) {
		document.title = translate('simpleContrastTitle') + ' - ' + translate('title');
	} else if (isImageContrastView()) {
		document.title = translate('chooseImage') + ' - ' + translate('title');
	} else {
		document.title = translate('title');
	}

	return true;
}

function updateAppView(shouldFocus) {
	var homeView = id('home-view');
	var chooserView = id('tool-chooser');
	var simpleView = id('simple-contrast');
	var imageView = id('image-contrast-view');
	var statementView = id('accessibility-statement');
	var showStatement = isAccessibilityStatementView();
	var showSimple = isSimpleContrastView();
	var showImage = isImageContrastView();
	var showChooser = !showStatement && !showSimple && !showImage;

	if (!homeView || !chooserView || !simpleView || !imageView || !statementView) {
		return false;
	}

	homeView.hidden = showStatement;
	chooserView.hidden = !showChooser;
	simpleView.hidden = !showSimple;
	imageView.hidden = !showImage;
	statementView.hidden = !showStatement;
	document.body.dataset.view = showStatement ? 'accessibility' : showSimple ? 'simple' : showImage ? 'image' : 'home';

	if (showStatement) {
		homeView.setAttribute('aria-hidden', 'true');
		statementView.removeAttribute('aria-hidden');
	} else {
		homeView.removeAttribute('aria-hidden');
		statementView.setAttribute('aria-hidden', 'true');
	}

	chooserView.setAttribute('aria-hidden', showChooser ? 'false' : 'true');
	simpleView.setAttribute('aria-hidden', showSimple ? 'false' : 'true');
	imageView.setAttribute('aria-hidden', showImage ? 'false' : 'true');
	updateDocumentTitleForView();

	if (shouldFocus) {
		(showStatement ? statementView : showSimple ? simpleView : showImage ? (id('step-2').hidden ? id('step-1') : id('step-2')) : chooserView).focus();
	}

	return true;
}

function showFrontView() {
	if (window.location.hash) {
		window.history.pushState('', document.title, window.location.pathname + window.location.search);
	}

	updateAppView(false);
	window.scrollTo(0, 0);

	return false;
}

window.isImageContrastView = isImageContrastView;

// Hash-based routing keeps this static app deployable without server rewrites.
function initViewRouting() {
	window.updateAppView = updateAppView;
	window.showFrontView = showFrontView;
	window.addEventListener('hashchange', function () {
		updateAppView(window.location.hash !== '#main-content');
	});
	updateAppView(false);
}

function markSkipLinkTarget() {
	var main = id('main-content');

	if (!main) {
		return false;
	}

	main.setAttribute('data-skip-link-focus', 'true');
}

function initMainFocusTarget() {
	var main = id('main-content');

	if (!main) {
		return false;
	}

	main.addEventListener('blur', function () {
		main.removeAttribute('data-skip-link-focus');
	});

	return true;
}

function showError(message) {
	var errorPanel = selector('#app-error');

	if (!errorPanel) {
		return false;
	}

	errorPanel.textContent = message || translate('genericError');
	errorPanel.hidden = false;
	errorPanel.focus();
}

function clearError() {
	var errorPanel = selector('#app-error');

	if (!errorPanel) {
		return false;
	}

	errorPanel.textContent = '';
	errorPanel.hidden = true;
}

function setLoadingState(state, message) {
	var loadingText = selector('[role=status].loading');
	var previewArea = selector('#preview_area');
	var toolbar = selector('[role=toolbar]');

	if (!loadingText || !previewArea || !toolbar) {
		return false;
	}

	var toolbarButtons = toolbar.querySelectorAll('button, input, select');

	state = (state === true);

	for (var i = 0; i < toolbarButtons.length; i++) {
		var button = toolbarButtons[i];
		button.disabled = state;
	}

	if (state === false) {
		message = '';
	} else if (!message) {
		message = translate('pleaseWait');
	}

	previewArea.setAttribute('aria-busy', state)
	loadingText.hidden = !state;
	loadingText.textContent = message;
}

function getSystemTheme() {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}

	return 'light';
}

function getStoredTheme() {
	var theme = getStoredValue(STORAGE_KEYS.theme);
	return theme === 'dark' || theme === 'light' ? theme : null;
}

function getActiveTheme() {
	return getStoredTheme() || getSystemTheme();
}

function updateThemeToggle() {
	var toggle = id('theme-toggle');

	if (!toggle) {
		return false;
	}

	var activeTheme = getActiveTheme();

	toggle.setAttribute('aria-pressed', activeTheme === 'dark' ? 'true' : 'false');

	return true;
}

function setThemePreference(theme, shouldAnnounce) {
	setStoredValue(STORAGE_KEYS.theme, theme);
	document.documentElement.setAttribute('data-theme', theme);
	updateThemeToggle();

	if (shouldAnnounce) {
		announceStatus(translate('themeChanged').replace('{theme}', translate(theme === 'dark' ? 'themeDark' : 'themeLight')));
	}
}

function initThemeToggle() {
	var toggle = id('theme-toggle');

	if (!toggle) {
		return false;
	}

	if (getStoredTheme()) {
		document.documentElement.setAttribute('data-theme', getStoredTheme());
	}

	toggle.addEventListener('click', function () {
		setThemePreference(getActiveTheme() === 'dark' ? 'light' : 'dark', true);
	});

	if (window.matchMedia) {
		var themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
		var systemThemeChanged = function () {
			if (!getStoredTheme()) {
				updateThemeToggle();
			}
		};

		if (themeQuery.addEventListener) {
			themeQuery.addEventListener('change', systemThemeChanged);
		} else if (themeQuery.addListener) {
			themeQuery.addListener(systemThemeChanged);
		}
	}

	updateThemeToggle();
	return true;
}

function getSimpleContrastMessage(ratio) {
	if (ratio >= 7) {
		return translate('simpleContrastPassAAA');
	}

	if (ratio >= 4.5) {
		return translate('simpleContrastPassAA');
	}

	if (ratio >= 3) {
		return translate('simpleContrastPassLarge');
	}

	return translate('simpleContrastFail');
}

function renderSimpleContrastResult(result, ratio, message) {
	function shortRequirementLabel(key) {
		return translate(key)
			.replace(/\s*\([^)]*\)/, '')
			.replace(/\s*,?\s*AA{1,2}\s*$/, '');
	}

	function createOutcomeIcon(passed) {
		var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		icon.classList.add('simple-contrast-outcome-icon');
		icon.setAttribute('aria-hidden', 'true');
		icon.setAttribute('focusable', 'false');
		icon.setAttribute('viewBox', '0 0 24 24');
		icon.setAttribute('fill', 'none');
		icon.setAttribute('stroke', 'currentColor');
		icon.setAttribute('stroke-linecap', 'round');
		icon.setAttribute('stroke-linejoin', 'round');
		icon.setAttribute('stroke-width', '2.5');
		path.setAttribute('d', passed ? 'M5 12.5L9.5 17L19 7.5' : 'M7 7L17 17M17 7L7 17');
		icon.appendChild(path);

		return icon;
	}

	function outcomeCard(item) {
		var passed = ratio >= item.requiredRatio;
		var enhanced = item.enhancedRatio && ratio >= item.enhancedRatio;
		var level = enhanced ? 'AAA' : 'AA';
		var requiredRatio = enhanced ? item.enhancedRatio : item.requiredRatio;
		var card = document.createElement('li');
		var label = document.createElement('span');
		var status = document.createElement('strong');
		var detail = document.createElement('span');

		card.className = 'simple-contrast-outcome';
		card.setAttribute('data-state', passed ? 'pass' : 'fail');
		label.className = 'simple-contrast-outcome-label';
		label.textContent = item.label;

		status.className = 'simple-contrast-outcome-status';
		status.append(
			createOutcomeIcon(passed),
			document.createTextNode(translate(passed ? 'simpleContrastMeetsLevel' : 'simpleContrastDoesNotMeetLevel').replace('{level}', level))
		);

		detail.className = 'simple-contrast-outcome-detail';
		detail.textContent = translate('simpleContrastRequirement').replace('{ratio}', formatNumber(requiredRatio));

		card.append(label, status, detail);
		return card;
	}

	var ratioText = formatNumber(ratio) + ':1';
	var items = [
		{ label: shortRequirementLabel('smallTextAA'), requiredRatio: 4.5, enhancedRatio: 7 },
		{ label: shortRequirementLabel('largeTextAA'), requiredRatio: 3, enhancedRatio: 4.5 },
		{ label: shortRequirementLabel('nonText'), requiredRatio: 3 }
	];
	var resultMessage = getSimpleContrastMessage(ratio);
	var summary = document.createElement('div');
	var ratioGroup = document.createElement('div');
	var ratioElement = document.createElement('strong');
	var messageElement = document.createElement('span');
	var outcomeList = document.createElement('ul');

	summary.className = 'simple-contrast-summary';
	ratioGroup.className = 'simple-contrast-ratio-group';

	ratioElement.className = 'simple-contrast-ratio';
	ratioElement.textContent = ratioText;
	ratioElement.setAttribute('aria-hidden', 'true');

	messageElement.className = 'simple-contrast-message';
	messageElement.textContent = resultMessage;

	outcomeList.className = 'simple-contrast-outcomes';
	for (var i = 0; i < items.length; i++) {
		outcomeList.append(outcomeCard(items[i]));
	}

	result.textContent = '';
	result.setAttribute('aria-label', message);
	result.title = message;
	ratioGroup.append(ratioElement);
	summary.append(ratioGroup, messageElement);
	result.append(summary, outcomeList);
}

function updateSimpleContrast(shouldAnnounce) {
	var foreground = id('simple-foreground');
	var background = id('simple-background');
	var result = id('simple-contrast-result');
	var sample = id('simple-contrast-sample');

	if (!foreground || !background || !result || !window.hexToRgb || !window.contrastRatio || !window.normalizeColorToHex) {
		return false;
	}

	var foregroundColor = normalizeColorToHex(foreground.value);
	var backgroundColor = normalizeColorToHex(background.value);
	var foregroundError = id('simple-foreground-error');
	var backgroundError = id('simple-background-error');
	var foregroundInvalid = !foregroundColor;
	var backgroundInvalid = !backgroundColor;

	foreground.setAttribute('aria-invalid', foregroundInvalid ? 'true' : 'false');
	background.setAttribute('aria-invalid', backgroundInvalid ? 'true' : 'false');
	foregroundError.hidden = !foregroundInvalid;
	backgroundError.hidden = !backgroundInvalid;

	if (foregroundInvalid || backgroundInvalid) {
		result.textContent = '';
		result.hidden = true;
		result.removeAttribute('aria-label');
		result.removeAttribute('title');

		if (sample) {
			sample.style.color = '';
			sample.style.backgroundColor = '';
			sample.hidden = true;
		}

		return false;
	}

	var ratio = contrastRatio(hexToRgb(foregroundColor), hexToRgb(backgroundColor));
	var message = translate('simpleContrastResult')
		.replace('{ratio}', formatNumber(ratio))
		.replace('{message}', getSimpleContrastMessage(ratio));

	renderSimpleContrastResult(result, ratio, message);
	result.hidden = false;

	if (sample) {
		sample.hidden = false;
		sample.style.color = foregroundColor;
		sample.style.backgroundColor = backgroundColor;
	}

	if (shouldAnnounce) {
		announceStatus(message);
	}

	return true;
}

function swapSimpleColors() {
	var foreground = id('simple-foreground');
	var background = id('simple-background');
	var foregroundPicker = id('simple-foreground-native');
	var backgroundPicker = id('simple-background-native');
	var foregroundValue = foreground.value;

	foreground.value = background.value;
	background.value = foregroundValue;
	syncNativeColorControl(foreground, foregroundPicker);
	syncNativeColorControl(background, backgroundPicker);
	updateSimpleContrast(true);
	return true;
}

function initSimpleContrast() {
	var foreground = id('simple-foreground');
	var background = id('simple-background');
	var foregroundPicker = id('simple-foreground-native');
	var backgroundPicker = id('simple-background-native');

	if (!foreground || !background) {
		return false;
	}

	initHexColorField(foreground, foregroundPicker, updateSimpleContrast);
	initHexColorField(background, backgroundPicker, updateSimpleContrast);
	foreground.addEventListener('input', function () {
		updateSimpleContrast(false);
	});
	background.addEventListener('input', function () {
		updateSimpleContrast(false);
	});
	foreground.addEventListener('change', function () {
		updateSimpleContrast(true);
	});
	background.addEventListener('change', function () {
		updateSimpleContrast(true);
	});

	updateSimpleContrast(false);
	return true;
}

window.updateSimpleContrast = updateSimpleContrast;
window.swapSimpleColors = swapSimpleColors;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initViewRouting();
		initMainFocusTarget();
		initThemeToggle();
		initSimpleContrast();
		initCheckerSettings();
	});
} else {
	initViewRouting();
	initMainFocusTarget();
	initThemeToggle();
	initSimpleContrast();
	initCheckerSettings();
}
