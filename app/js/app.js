function showStep(stepNumber) {
	var step1 = id('step-1');
	var step2 = id('step-2');
	var newStep = id('step-' + stepNumber);

	step1.hidden = true;
	step1.setAttribute('aria-hidden', 'true');
	step2.hidden = true;
	step2.setAttribute('aria-hidden', 'true');
	newStep.hidden = false;
	newStep.removeAttribute('aria-hidden');
}

function markSkipLinkTarget() {
	var main = id('main-content');

	if (!main) {
		return false;
	}

	main.setAttribute('data-skip-link-focus', 'true');
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

function initIntroPanel() {
	var introPanel = id('intro-panel');
	var introToggle = id('intro-toggle');
	var introSteps = id('intro-steps');
	var storageKey = 'colorcontrast-intro-open';

	if (!introPanel || !introToggle || !introSteps) {
		return false;
	}

	try {
		function setIntroOpen(isOpen) {
			introToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			introSteps.hidden = !isOpen;
			window.localStorage.setItem(storageKey, isOpen ? 'true' : 'false');
		}

		var savedState = window.localStorage.getItem(storageKey);

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
	try {
		var theme = window.localStorage.getItem('colorcontrast-theme');
		return theme === 'dark' || theme === 'light' ? theme : null;
	} catch (error) {
		return null;
	}
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

function setThemePreference(theme) {
	try {
		window.localStorage.setItem('colorcontrast-theme', theme);
	} catch (error) {}

	document.documentElement.setAttribute('data-theme', theme);
	updateThemeToggle();
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
		setThemePreference(getActiveTheme() === 'dark' ? 'light' : 'dark');
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

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () {
		initIntroPanel();
		initThemeToggle();
	});
} else {
	initIntroPanel();
	initThemeToggle();
}
