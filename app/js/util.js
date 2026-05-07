var STORAGE_KEYS = {
	conformanceLevel: 'colorcontrast-conformance-level',
	introOpen: 'colorcontrast-intro-open',
	language: 'colorcontrast-language',
	testColor: 'colorcontrast-test-color',
	theme: 'colorcontrast-theme'
};

function id(id) {
	return document.getElementById(id);
}

function selector(selector) {
	return document.querySelector(selector);
}

function announceStatus(message) {
	var statusId = 'settings-status';
	var status = id(statusId);

	if (!status || !message) {
		return false;
	}

	status.textContent = '';
	window.setTimeout(function () {
		status.textContent = message;
	}, 10);
	return true;
}

function getStoredValue(key) {
	try {
		return window.localStorage.getItem(key);
	} catch (error) {
		return null;
	}
}

function setStoredValue(key, value) {
	try {
		window.localStorage.setItem(key, value);
		return true;
	} catch (error) {
		return false;
	}
}

function round(value, precision) {
	var multiplier = Math.pow(10, precision || 0);
	return Math.floor(value * multiplier) / multiplier;
}
