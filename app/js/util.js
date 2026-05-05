function id(id) {
	return document.getElementById(id);
}

function selector(selector) {
	return document.querySelector(selector);
}

function announceStatus(message) {
	var status = id('settings-status');

	if (!status || !message) {
		return false;
	}

	status.textContent = '';
	window.setTimeout(function () {
		status.textContent = message;
	}, 10);
	return true;
}

function round(value, precision) {
	var multiplier = Math.pow(10, precision || 0);
	return Math.floor(value * multiplier) / multiplier;
}

var measureStart = measureEnd = null;
function measureStartTime() {
	measureStart = new Date();
};
function measureEndTime() {
	measureEnd = new Date();

	var timeDiffMs = measureEnd - measureStart; //in ms

	// strip the ms
	var timeDiffS = timeDiffMs / 1000;
	// get seconds 
	timeDiffS = round(timeDiffS, 3);

	console.log(timeDiffS + ' seconds', 'Time elapsed');
}
