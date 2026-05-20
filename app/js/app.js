function showStep(stepNumber) {
	var step1 = id('step-1');
	var step2 = id('step-2');
	var isCheckerView = stepNumber === 2;

	step1.hidden = false;
	step1.removeAttribute('aria-hidden');
	step2.hidden = !isCheckerView;
	document.body.classList.toggle('is-checker-view', isCheckerView);

	if (isCheckerView) {
		step2.removeAttribute('aria-hidden');
	} else {
		step2.setAttribute('aria-hidden', 'true');
	}

	setIntroVisible(false);
}

function setIntroVisible(visible) {
	var intro = id('intro-panel');

	if (!intro) {
		return false;
	}

	intro.hidden = !visible;

	if (visible) {
		intro.removeAttribute('aria-hidden');
	} else {
		intro.setAttribute('aria-hidden', 'true');
	}

	return true;
}

function isAccessibilityStatementView() {
	return window.location.hash === '#accessibility-statement';
}

function isSimpleContrastView() {
	return window.location.hash === '#simple-contrast';
}

function updateDocumentTitleForView() {
	if (!window.translate) {
		return false;
	}

	if (isAccessibilityStatementView()) {
		document.title = translate('accessibilityTitle') + ' - ' + translate('title');
	} else if (isSimpleContrastView()) {
		document.title = translate('simpleContrastTitle') + ' - ' + translate('title');
	} else {
		document.title = translate('title');
	}

	return true;
}

function updateAppView(shouldFocus) {
	var homeView = id('home-view');
	var simpleView = id('simple-contrast');
	var statementView = id('accessibility-statement');
	var showStatement = isAccessibilityStatementView();
	var showSimple = isSimpleContrastView();

	if (!homeView || !simpleView || !statementView) {
		return false;
	}

	homeView.hidden = showStatement;
	statementView.hidden = !showStatement;

	if (showStatement) {
		homeView.setAttribute('aria-hidden', 'true');
		statementView.removeAttribute('aria-hidden');
	} else {
		homeView.removeAttribute('aria-hidden');
		statementView.setAttribute('aria-hidden', 'true');
	}

	simpleView.removeAttribute('aria-hidden');
	updateDocumentTitleForView();

	if (shouldFocus) {
		(showStatement ? statementView : showSimple ? simpleView : id('main-content')).focus();
	}

	return true;
}

function showFrontView() {
	if (window.location.hash) {
		window.history.pushState('', document.title, window.location.pathname + window.location.search);
	}

	updateAppView(false);
	showStep(1);
	window.scrollTo(0, 0);

	return false;
}

// Hash-based routing keeps this static app deployable without server rewrites.
function initViewRouting() {
	window.updateAppView = updateAppView;
	window.showFrontView = showFrontView;
	window.addEventListener('hashchange', function () {
		updateAppView(true);
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

// The intro panel can be collapsed, but its heading remains in the document
// outline so assistive technology users keep a stable page structure.
function initIntroPanel() {
	var introPanel = id('intro-panel');
	var introToggle = id('intro-toggle');
	var introSteps = id('intro-steps');

	if (!introPanel || !introToggle || !introSteps) {
		return false;
	}

	try {
		function setIntroOpen(isOpen) {
			introToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			introSteps.hidden = !isOpen;
			setStoredValue(STORAGE_KEYS.introOpen, isOpen ? 'true' : 'false');
		}

		var savedState = getStoredValue(STORAGE_KEYS.introOpen);

		if (savedState === 'false') {
			setIntroOpen(false);
		} else if (savedState === 'true') {
			setIntroOpen(true);
		}

		introToggle.addEventListener('click', function () {
			setIntroOpen(introToggle.getAttribute('aria-expanded') !== 'true');
		});
	} catch (error) {
		return false;
	}

	return true;
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
		return translate(key).replace(/\s*\([^)]*\)/, '');
	}

	function conformanceCell(requiredRatio) {
		var passed = ratio >= requiredRatio;
		var cell = document.createElement('td');
		var status = document.createElement('span');
		var mark = document.createElement('span');
		var text = document.createElement('span');
		var requirement = document.createElement('span');

		cell.className = 'simple-contrast-check-cell';
		cell.setAttribute('data-state', passed ? 'pass' : 'fail');

		status.className = 'simple-contrast-check';
		mark.className = 'simple-contrast-check-mark';
		mark.textContent = passed ? '✓' : '×';
		mark.setAttribute('aria-hidden', 'true');
		text.textContent = translate(passed ? 'palettePass' : 'paletteFail');

		requirement.className = 'simple-contrast-check-required';
		requirement.textContent = '≥ ' + formatNumber(requiredRatio) + ':1';

		status.append(mark, text);
		cell.append(status, requirement);
		return cell;
	}

	function unavailableCell() {
		var cell = document.createElement('td');

		cell.className = 'simple-contrast-check-cell simple-contrast-check-cell-unavailable';
		cell.textContent = '—';
		return cell;
	}

	var ratioText = formatNumber(ratio) + ':1';
	var rows = [
		{ label: shortRequirementLabel('smallTextAA'), aa: 4.5, aaa: 7 },
		{ label: shortRequirementLabel('largeTextAA'), aa: 3, aaa: 4.5 },
		{ label: shortRequirementLabel('nonText'), aa: 3, aaa: null }
	];
	var resultMessage = getSimpleContrastMessage(ratio);
	var summary = document.createElement('div');
	var ratioGroup = document.createElement('div');
	var ratioLabel = document.createElement('span');
	var ratioElement = document.createElement('strong');
	var messageElement = document.createElement('span');
	var table = document.createElement('table');
	var tableHead = document.createElement('thead');
	var tableHeadRow = document.createElement('tr');
	var emptyHead = document.createElement('th');
	var aaHead = document.createElement('th');
	var aaaHead = document.createElement('th');
	var tableBody = document.createElement('tbody');

	summary.className = 'simple-contrast-summary';
	ratioGroup.className = 'simple-contrast-ratio-group';
	ratioLabel.className = 'simple-contrast-ratio-label';
	ratioLabel.textContent = 'WCAG';

	ratioElement.className = 'simple-contrast-ratio';
	ratioElement.textContent = ratioText;
	ratioElement.setAttribute('aria-hidden', 'true');

	messageElement.className = 'simple-contrast-message';
	messageElement.textContent = resultMessage;

	table.className = 'simple-contrast-table';
	emptyHead.scope = 'col';
	emptyHead.textContent = 'Type';
	aaHead.scope = 'col';
	aaHead.textContent = 'AA';
	aaaHead.scope = 'col';
	aaaHead.textContent = 'AAA';
	tableHeadRow.append(emptyHead, aaHead, aaaHead);
	tableHead.append(tableHeadRow);

	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var tableRow = document.createElement('tr');
		var rowHead = document.createElement('th');

		rowHead.scope = 'row';
		rowHead.textContent = row.label;
		tableRow.append(rowHead, conformanceCell(row.aa), row.aaa === null ? unavailableCell() : conformanceCell(row.aaa));
		tableBody.append(tableRow);
	}

	table.append(tableHead, tableBody);
	result.textContent = '';
	result.setAttribute('aria-label', message);
	result.title = message;
	ratioGroup.append(ratioLabel, ratioElement);
	summary.append(ratioGroup, messageElement);
	result.append(summary, table);
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

	if (!foregroundColor || !backgroundColor) {
		return false;
	}

	var ratio = contrastRatio(hexToRgb(foregroundColor), hexToRgb(backgroundColor));
	var message = translate('simpleContrastResult')
		.replace('{ratio}', formatNumber(ratio))
		.replace('{message}', getSimpleContrastMessage(ratio));

	renderSimpleContrastResult(result, ratio, message);

	if (sample) {
		sample.style.color = foregroundColor;
		sample.style.backgroundColor = backgroundColor;
	}

	if (shouldAnnounce) {
		announceStatus(message);
	}

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
window.setIntroVisible = setIntroVisible;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initViewRouting();
		initMainFocusTarget();
		initIntroPanel();
		initThemeToggle();
		initSimpleContrast();
		initCheckerSettings();
	});
} else {
	initViewRouting();
	initMainFocusTarget();
	initIntroPanel();
	initThemeToggle();
	initSimpleContrast();
	initCheckerSettings();
}
