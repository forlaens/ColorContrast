function pixelToHex(context, x, y) {
	var rgb = pixelToRgb(context, x, y);
	return rgbToHex(rgb);
}

function pixelToRgb(context, x, y) {
	var pixel = context.getImageData(x, y, 1, 1).data;
	return {
		'r': pixel[0],
		'g': pixel[1],
		'b': pixel[2],
		'a': pixel[3]
	};
}

function rgbToHex(color) {
	if (!color) {
		return '#000000';
	}

	var r = color.r;
	var g = color.g;
	var b = color.b;
	var a = color.a;

	if (a === 0) {
		return 'transparent';
	}

	return '#' +
		   ('0' + parseInt(r, 10).toString(16)).slice(-2) +
		   ('0' + parseInt(g, 10).toString(16)).slice(-2) +
		   ('0' + parseInt(b, 10).toString(16)).slice(-2);
}

function isUppercaseColorPreference(value) {
	var letters = String(value || '').match(/[a-f]/gi);

	return !!(letters && letters.length && letters.join('') === letters.join('').toUpperCase());
}

function applyHexCase(hex, source) {
	return isUppercaseColorPreference(source) ? hex.toUpperCase() : hex.toLowerCase();
}

function clampColorChannel(value) {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function colorChannelFromCss(value) {
	value = String(value || '').trim();

	if (value.slice(-1) === '%') {
		var percent = parseFloat(value);
		return Number.isFinite(percent) ? clampColorChannel(percent * 2.55) : null;
	}

	var channel = parseFloat(value);
	return Number.isFinite(channel) ? clampColorChannel(channel) : null;
}

function hueToRgb(p, q, t) {
	if (t < 0) {
		t += 1;
	}

	if (t > 1) {
		t -= 1;
	}

	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}

	if (t < 1 / 2) {
		return q;
	}

	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}

	return p;
}

function hslToRgb(h, s, l) {
	h = (((h % 360) + 360) % 360) / 360;
	s = Math.max(0, Math.min(100, s)) / 100;
	l = Math.max(0, Math.min(100, l)) / 100;

	if (s === 0) {
		var gray = clampColorChannel(l * 255);
		return { r: gray, g: gray, b: gray };
	}

	var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	var p = 2 * l - q;

	return {
		r: clampColorChannel(hueToRgb(p, q, h + 1 / 3) * 255),
		g: clampColorChannel(hueToRgb(p, q, h) * 255),
		b: clampColorChannel(hueToRgb(p, q, h - 1 / 3) * 255)
	};
}

function splitCssColorArguments(value) {
	value = String(value || '').trim().replace(/\s*\/\s*/g, ' / ');

	if (value.indexOf(',') !== -1) {
		return value.split(',').map(function (part) {
			return part.trim();
		});
	}

	return value.split(/\s+/).filter(function (part) {
		return part && part !== '/';
	});
}

function parseRgbColor(value) {
	var match = /^rgba?\((.*)\)$/i.exec(String(value || '').trim());

	if (!match) {
		return null;
	}

	var parts = splitCssColorArguments(match[1]);

	if (parts.length < 3) {
		return null;
	}

	var r = colorChannelFromCss(parts[0]);
	var g = colorChannelFromCss(parts[1]);
	var b = colorChannelFromCss(parts[2]);

	if (r === null || g === null || b === null) {
		return null;
	}

	return {
		r: r,
		g: g,
		b: b
	};
}

function parseHslColor(value) {
	var match = /^hsla?\((.*)\)$/i.exec(String(value || '').trim());

	if (!match) {
		return null;
	}

	var parts = splitCssColorArguments(match[1]);

	if (parts.length < 3) {
		return null;
	}

	var h = parseFloat(parts[0]);
	var s = parseFloat(parts[1]);
	var l = parseFloat(parts[2]);

	if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) {
		return null;
	}

	return hslToRgb(h, s, l);
}

var CSS_NAMED_COLORS = {
	aliceblue: '#f0f8ff',
	antiquewhite: '#faebd7',
	aqua: '#00ffff',
	aquamarine: '#7fffd4',
	azure: '#f0ffff',
	beige: '#f5f5dc',
	bisque: '#ffe4c4',
	black: '#000000',
	blanchedalmond: '#ffebcd',
	blue: '#0000ff',
	blueviolet: '#8a2be2',
	brown: '#a52a2a',
	burlywood: '#deb887',
	cadetblue: '#5f9ea0',
	chartreuse: '#7fff00',
	chocolate: '#d2691e',
	coral: '#ff7f50',
	cornflowerblue: '#6495ed',
	cornsilk: '#fff8dc',
	crimson: '#dc143c',
	cyan: '#00ffff',
	darkblue: '#00008b',
	darkcyan: '#008b8b',
	darkgoldenrod: '#b8860b',
	darkgray: '#a9a9a9',
	darkgreen: '#006400',
	darkgrey: '#a9a9a9',
	darkkhaki: '#bdb76b',
	darkmagenta: '#8b008b',
	darkolivegreen: '#556b2f',
	darkorange: '#ff8c00',
	darkorchid: '#9932cc',
	darkred: '#8b0000',
	darksalmon: '#e9967a',
	darkseagreen: '#8fbc8f',
	darkslateblue: '#483d8b',
	darkslategray: '#2f4f4f',
	darkslategrey: '#2f4f4f',
	darkturquoise: '#00ced1',
	darkviolet: '#9400d3',
	deeppink: '#ff1493',
	deepskyblue: '#00bfff',
	dimgray: '#696969',
	dimgrey: '#696969',
	dodgerblue: '#1e90ff',
	firebrick: '#b22222',
	floralwhite: '#fffaf0',
	forestgreen: '#228b22',
	fuchsia: '#ff00ff',
	gainsboro: '#dcdcdc',
	ghostwhite: '#f8f8ff',
	gold: '#ffd700',
	goldenrod: '#daa520',
	gray: '#808080',
	green: '#008000',
	greenyellow: '#adff2f',
	grey: '#808080',
	honeydew: '#f0fff0',
	hotpink: '#ff69b4',
	indianred: '#cd5c5c',
	indigo: '#4b0082',
	ivory: '#fffff0',
	khaki: '#f0e68c',
	lavender: '#e6e6fa',
	lavenderblush: '#fff0f5',
	lawngreen: '#7cfc00',
	lemonchiffon: '#fffacd',
	lightblue: '#add8e6',
	lightcoral: '#f08080',
	lightcyan: '#e0ffff',
	lightgoldenrodyellow: '#fafad2',
	lightgray: '#d3d3d3',
	lightgreen: '#90ee90',
	lightgrey: '#d3d3d3',
	lightpink: '#ffb6c1',
	lightsalmon: '#ffa07a',
	lightseagreen: '#20b2aa',
	lightskyblue: '#87cefa',
	lightslategray: '#778899',
	lightslategrey: '#778899',
	lightsteelblue: '#b0c4de',
	lightyellow: '#ffffe0',
	lime: '#00ff00',
	limegreen: '#32cd32',
	linen: '#faf0e6',
	magenta: '#ff00ff',
	maroon: '#800000',
	mediumaquamarine: '#66cdaa',
	mediumblue: '#0000cd',
	mediumorchid: '#ba55d3',
	mediumpurple: '#9370db',
	mediumseagreen: '#3cb371',
	mediumslateblue: '#7b68ee',
	mediumspringgreen: '#00fa9a',
	mediumturquoise: '#48d1cc',
	mediumvioletred: '#c71585',
	midnightblue: '#191970',
	mintcream: '#f5fffa',
	mistyrose: '#ffe4e1',
	moccasin: '#ffe4b5',
	navajowhite: '#ffdead',
	navy: '#000080',
	oldlace: '#fdf5e6',
	olive: '#808000',
	olivedrab: '#6b8e23',
	orange: '#ffa500',
	orangered: '#ff4500',
	orchid: '#da70d6',
	palegoldenrod: '#eee8aa',
	palegreen: '#98fb98',
	paleturquoise: '#afeeee',
	palevioletred: '#db7093',
	papayawhip: '#ffefd5',
	peachpuff: '#ffdab9',
	peru: '#cd853f',
	pink: '#ffc0cb',
	plum: '#dda0dd',
	powderblue: '#b0e0e6',
	purple: '#800080',
	rebeccapurple: '#663399',
	red: '#ff0000',
	rosybrown: '#bc8f8f',
	royalblue: '#4169e1',
	saddlebrown: '#8b4513',
	salmon: '#fa8072',
	sandybrown: '#f4a460',
	seagreen: '#2e8b57',
	seashell: '#fff5ee',
	sienna: '#a0522d',
	silver: '#c0c0c0',
	skyblue: '#87ceeb',
	slateblue: '#6a5acd',
	slategray: '#708090',
	slategrey: '#708090',
	snow: '#fffafa',
	springgreen: '#00ff7f',
	steelblue: '#4682b4',
	tan: '#d2b48c',
	teal: '#008080',
	thistle: '#d8bfd8',
	tomato: '#ff6347',
	turquoise: '#40e0d0',
	violet: '#ee82ee',
	wheat: '#f5deb3',
	white: '#ffffff',
	whitesmoke: '#f5f5f5',
	yellow: '#ffff00',
	yellowgreen: '#9acd32'
};

function namedColorToRgb(value) {
	var name = String(value || '').trim().toLowerCase();
	var hex = CSS_NAMED_COLORS[name];

	return hex ? hexToRgb(hex) : null;
}

function browserColorToRgb(value) {
	if (typeof document === 'undefined') {
		return null;
	}

	var option = new Option();
	option.style.color = '';
	option.style.color = String(value || '').trim();

	if (!option.style.color) {
		return null;
	}

	return parseRgbColor(option.style.color) || parseHslColor(option.style.color);
}

function normalizeColorToHex(value) {
	var raw = String(value || '').trim();
	var compact = raw.replace(/\s+/g, '');
	var shortHex = /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
	var longHex = /^#?([0-9a-fA-F]{6})$/;
	var match = shortHex.exec(compact);

	if (match) {
		return applyHexCase('#' + match[1] + match[1] + match[2] + match[2] + match[3] + match[3], compact);
	}

	match = longHex.exec(compact);

	if (match) {
		return applyHexCase('#' + match[1], compact);
	}

	var rgb = parseRgbColor(raw) || parseHslColor(raw) || namedColorToRgb(raw) || browserColorToRgb(raw);

	return rgb ? rgbToHex(rgb) : '#000000';
}

function syncNativeColorControl(textInput, nativeInput) {
	if (!textInput || !nativeInput) {
		return false;
	}

	var normalized = normalizeColorToHex(textInput.value);

	if (!normalized) {
		return false;
	}

	nativeInput.value = normalized.toLowerCase();
	return true;
}

function normalizeHexColorInput(textInput, nativeInput, callback, shouldAnnounce) {
	var normalized = textInput && normalizeColorToHex(textInput.value);

	if (!textInput || !normalized) {
		return false;
	}

	textInput.value = normalized;
	syncNativeColorControl(textInput, nativeInput);

	if (typeof callback === 'function') {
		callback(shouldAnnounce === true);
	}

	return true;
}

function initHexColorField(textInput, nativeInput, callback) {
	if (!textInput) {
		return false;
	}

	syncNativeColorControl(textInput, nativeInput);

	textInput.addEventListener('input', function () {
		syncNativeColorControl(textInput, nativeInput);

		if (typeof callback === 'function') {
			callback(false);
		}
	});

	textInput.addEventListener('change', function () {
		normalizeHexColorInput(textInput, nativeInput, callback, true);
	});

	textInput.addEventListener('paste', function () {
		window.setTimeout(function () {
			normalizeHexColorInput(textInput, nativeInput, callback, true);
		}, 0);
	});

	if (nativeInput) {
		nativeInput.addEventListener('input', function () {
			textInput.value = nativeInput.value;

			if (typeof callback === 'function') {
				callback(false);
			}
		});

		nativeInput.addEventListener('change', function () {
			textInput.value = nativeInput.value;

			if (typeof callback === 'function') {
				callback(true);
			}
		});
	}

	return true;
}

window.normalizeColorToHex = normalizeColorToHex;
window.initHexColorField = initHexColorField;

function hexToRgb(hex) {
	var normalized = normalizeColorToHex(hex);

	if (normalized) {
		hex = normalized;
	}

	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
  
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

var COLOR_NAME_RANGES = [
	{ max: 10, name: 'red' },
	{ max: 35, name: 'orange' },
	{ max: 48, name: 'amber' },
	{ max: 62, name: 'yellow' },
	{ max: 82, name: 'lime' },
	{ max: 150, name: 'green' },
	{ max: 176, name: 'teal' },
	{ max: 190, name: 'turquoise' },
	{ max: 205, name: 'cyan' },
	{ max: 218, name: 'skyBlue' },
	{ max: 246, name: 'blue' },
	{ max: 264, name: 'indigo' },
	{ max: 282, name: 'violet' },
	{ max: 304, name: 'purple' },
	{ max: 326, name: 'magenta' },
	{ max: 340, name: 'pink' },
	{ max: 352, name: 'rose' },
	{ max: 360, name: 'red' }
];

var COLOR_NAME_TRANSLATIONS = {
	en: {
		black: 'black', white: 'white', gray: 'gray', silver: 'silver', brown: 'brown',
		charcoal: 'charcoal', slate: 'slate', ivory: 'ivory', cream: 'cream',
		beige: 'beige', sand: 'sand', tan: 'tan', camel: 'camel', peach: 'peach',
		copper: 'copper', bronze: 'bronze', caramel: 'caramel', chocolate: 'chocolate',
		burgundy: 'burgundy', maroon: 'maroon', wine: 'wine', crimson: 'crimson',
		coral: 'coral', salmon: 'salmon', terracotta: 'terracotta', rust: 'rust', brick: 'brick',
		gold: 'gold', mustard: 'mustard', ochre: 'ochre', olive: 'olive',
		red: 'red', rose: 'rose', orange: 'orange', amber: 'amber', yellow: 'yellow',
		lime: 'lime', mint: 'mint', green: 'green', forestGreen: 'forest green',
		seaGreen: 'sea green', teal: 'teal', turquoise: 'turquoise', cyan: 'cyan',
		skyBlue: 'sky blue', blue: 'blue', indigo: 'indigo', violet: 'violet',
		navy: 'navy', lavender: 'lavender', lilac: 'lilac', mauve: 'mauve',
		plum: 'plum', purple: 'purple', magenta: 'magenta', pink: 'pink',
		veryDark: 'very dark', dark: 'dark', light: 'light', veryLight: 'very light'
	},
	da: {
		black: 'sort', white: 'hvid', gray: 'grå', silver: 'sølv', brown: 'brun',
		charcoal: 'koksgrå', slate: 'skifergrå', ivory: 'elfenben', cream: 'creme',
		beige: 'beige', sand: 'sand', tan: 'tan', camel: 'camel', peach: 'fersken',
		copper: 'kobber', bronze: 'bronze', caramel: 'karamel', chocolate: 'chokoladebrun',
		burgundy: 'bordeaux', maroon: 'mørkerød', wine: 'vinrød', crimson: 'karmosinrød',
		coral: 'koral', salmon: 'laks', terracotta: 'terracotta', rust: 'rust', brick: 'tegl',
		gold: 'guld', mustard: 'sennepsgul', ochre: 'okker', olive: 'oliven',
		red: 'rød', rose: 'rosa', orange: 'orange', amber: 'ravgul', yellow: 'gul',
		lime: 'limegrøn', mint: 'mintgrøn', green: 'grøn', forestGreen: 'skovgrøn',
		seaGreen: 'havgrøn', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmelblå', blue: 'blå', indigo: 'indigo', violet: 'violet',
		navy: 'marineblå', lavender: 'lavendel', lilac: 'syren', mauve: 'mauve',
		plum: 'blomme', purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'meget mørk', dark: 'mørk', light: 'lys', veryLight: 'meget lys'
	},
	no: {
		black: 'svart', white: 'hvit', gray: 'grå', silver: 'sølv', brown: 'brun',
		charcoal: 'koksgrå', slate: 'skifergrå', ivory: 'elfenben', cream: 'krem',
		beige: 'beige', sand: 'sand', tan: 'tan', camel: 'camel', peach: 'fersken',
		copper: 'kobber', bronze: 'bronse', caramel: 'karamell', chocolate: 'sjokoladebrun',
		burgundy: 'burgunder', maroon: 'mørkerød', wine: 'vinrød', crimson: 'karmosinrød',
		coral: 'korall', salmon: 'laks', terracotta: 'terrakotta', rust: 'rust', brick: 'tegl',
		gold: 'gull', mustard: 'sennepsgul', ochre: 'oker', olive: 'oliven',
		red: 'rød', rose: 'rosa', orange: 'oransje', amber: 'ravgul', yellow: 'gul',
		lime: 'limegrønn', mint: 'mintgrønn', green: 'grønn', forestGreen: 'skoggrønn',
		seaGreen: 'sjøgrønn', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmelblå', blue: 'blå', indigo: 'indigo', violet: 'fiolett',
		navy: 'marineblå', lavender: 'lavendel', lilac: 'syrin', mauve: 'mauve',
		plum: 'plomme', purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'veldig mørk', dark: 'mørk', light: 'lys', veryLight: 'veldig lys'
	},
	sv: {
		black: 'svart', white: 'vit', gray: 'grå', silver: 'silver', brown: 'brun',
		charcoal: 'kolgrå', slate: 'skiffergrå', ivory: 'elfenben', cream: 'kräm',
		beige: 'beige', sand: 'sand', tan: 'tan', camel: 'camel', peach: 'persika',
		copper: 'koppar', bronze: 'brons', caramel: 'karamell', chocolate: 'chokladbrun',
		burgundy: 'bordeaux', maroon: 'mörkröd', wine: 'vinröd', crimson: 'karmosinröd',
		coral: 'korall', salmon: 'lax', terracotta: 'terrakotta', rust: 'rost', brick: 'tegel',
		gold: 'guld', mustard: 'senapsgul', ochre: 'ockra', olive: 'oliv',
		red: 'röd', rose: 'rosa', orange: 'orange', amber: 'bärnsten', yellow: 'gul',
		lime: 'limegrön', mint: 'mintgrön', green: 'grön', forestGreen: 'skogsgrön',
		seaGreen: 'sjögrön', teal: 'teal', turquoise: 'turkos', cyan: 'cyan',
		skyBlue: 'himmelsblå', blue: 'blå', indigo: 'indigo', violet: 'violett',
		navy: 'marinblå', lavender: 'lavendel', lilac: 'syren', mauve: 'mauve',
		plum: 'plommon', purple: 'lila', magenta: 'magenta', pink: 'pink',
		veryDark: 'mycket mörk', dark: 'mörk', light: 'ljus', veryLight: 'mycket ljus'
	},
	fi: {
		black: 'musta', white: 'valkoinen', gray: 'harmaa', silver: 'hopea', brown: 'ruskea',
		charcoal: 'hiilenharmaa', slate: 'liuskekivenharmaa', ivory: 'norsunluu', cream: 'kerma',
		beige: 'beige', sand: 'hiekka', tan: 'tan', camel: 'kameli', peach: 'persikka',
		copper: 'kupari', bronze: 'pronssi', caramel: 'karamelli', chocolate: 'suklaanruskea',
		burgundy: 'burgundi', maroon: 'tummanpunainen', wine: 'viininpunainen', crimson: 'karmiininpunainen',
		coral: 'koralli', salmon: 'lohi', terracotta: 'terrakotta', rust: 'ruoste', brick: 'tiili',
		gold: 'kulta', mustard: 'sinapinkeltainen', ochre: 'okra', olive: 'oliivi',
		red: 'punainen', rose: 'roosa', orange: 'oranssi', amber: 'meripihka', yellow: 'keltainen',
		lime: 'limenvihreä', mint: 'mintunvihreä', green: 'vihreä', forestGreen: 'metsänvihreä',
		seaGreen: 'meren vihreä', teal: 'sinivihreä', turquoise: 'turkoosi', cyan: 'syaani',
		skyBlue: 'taivaansininen', blue: 'sininen', indigo: 'indigo', violet: 'violetti',
		navy: 'laivastonsininen', lavender: 'laventeli', lilac: 'syreeni', mauve: 'mauve',
		plum: 'luumu', purple: 'purppura', magenta: 'magenta', pink: 'pinkki',
		veryDark: 'hyvin tumma', dark: 'tumma', light: 'vaalea', veryLight: 'hyvin vaalea'
	},
	kl: {
		black: 'qernertoq', white: 'qaqortoq', gray: 'qasersoq', silver: 'sølv', brown: 'kajortoq',
		charcoal: 'koksgrå', slate: 'skifergrå', ivory: 'elfenben', cream: 'creme',
		beige: 'beige', sand: 'sioqqat', tan: 'tan', camel: 'camel', peach: 'fersken',
		copper: 'kobber', bronze: 'bronze', caramel: 'karamel', chocolate: 'chokoladebrun',
		burgundy: 'bordeaux', maroon: 'mørkerød', wine: 'vinrød', crimson: 'karmosinrød',
		coral: 'koral', salmon: 'laks', terracotta: 'terracotta', rust: 'rust', brick: 'tegl',
		gold: 'kuulti', mustard: 'sennepsgul', ochre: 'okker', olive: 'oliven',
		red: 'aappaluttoq', rose: 'rose', orange: 'orange', amber: 'amber', yellow: 'sungaartoq',
		lime: 'lime', mint: 'mintgrøn', green: 'qorsuk', forestGreen: 'skovgrøn',
		seaGreen: 'havgrøn', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'tungujortoq qaamasoq', blue: 'tungujortoq', indigo: 'indigo', violet: 'violet',
		navy: 'marineblå', lavender: 'lavendel', lilac: 'syren', mauve: 'mauve',
		plum: 'blomme', purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'taartorujussuaq', dark: 'taartoq', light: 'qaamasoq', veryLight: 'qaamasorujussuaq'
	},
	is: {
		black: 'svartur', white: 'hvítur', gray: 'grár', silver: 'silfur', brown: 'brúnn',
		charcoal: 'kolgrár', slate: 'steingrár', ivory: 'fílabein', cream: 'rjómi',
		beige: 'beige', sand: 'sandur', tan: 'tan', camel: 'camel', peach: 'ferskja',
		copper: 'kopar', bronze: 'brons', caramel: 'karamella', chocolate: 'súkkulaðibrúnn',
		burgundy: 'vínrauður', maroon: 'dökkrauður', wine: 'vínrauður', crimson: 'karmínrauður',
		coral: 'kórall', salmon: 'lax', terracotta: 'terracotta', rust: 'ryð', brick: 'múrsteinn',
		gold: 'gull', mustard: 'sinapsgulur', ochre: 'okkra', olive: 'ólífu',
		red: 'rauður', rose: 'rósrauður', orange: 'appelsínugulur', amber: 'rafgulur', yellow: 'gulur',
		lime: 'limegrænn', mint: 'myntugrænn', green: 'grænn', forestGreen: 'skógargrænn',
		seaGreen: 'sjávargrænn', teal: 'teal', turquoise: 'túrkís', cyan: 'cyan',
		skyBlue: 'himinblár', blue: 'blár', indigo: 'indigo', violet: 'fjólublár',
		navy: 'dökkblár', lavender: 'lavender', lilac: 'lilac', mauve: 'mauve',
		plum: 'plóma', purple: 'purpuri', magenta: 'magenta', pink: 'bleikur',
		veryDark: 'mjög dökkur', dark: 'dökkur', light: 'ljós', veryLight: 'mjög ljós'
	},
	fo: {
		black: 'svartur', white: 'hvítur', gray: 'gráur', silver: 'silvur', brown: 'brúnur',
		charcoal: 'kolgráur', slate: 'skifergráur', ivory: 'elfenbein', cream: 'krem',
		beige: 'beige', sand: 'sandur', tan: 'tan', camel: 'camel', peach: 'fersken',
		copper: 'kopar', bronze: 'bronsa', caramel: 'karamell', chocolate: 'sjokolátabrúnur',
		burgundy: 'bordeaux', maroon: 'myrkareyður', wine: 'vínreyður', crimson: 'karmosinreyður',
		coral: 'korall', salmon: 'laksur', terracotta: 'terracotta', rust: 'rust', brick: 'tegl',
		gold: 'gull', mustard: 'sinopsgulur', ochre: 'okkra', olive: 'oliven',
		red: 'reyður', rose: 'rosa', orange: 'appilsingulur', amber: 'ravlittur', yellow: 'gulur',
		lime: 'limegrønur', mint: 'mintgrønur', green: 'grønur', forestGreen: 'skógargrønur',
		seaGreen: 'sjógrønur', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmalbláur', blue: 'bláur', indigo: 'indigo', violet: 'violettur',
		navy: 'marinebláur', lavender: 'lavendel', lilac: 'syrin', mauve: 'mauve',
		plum: 'plomma', purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'sera myrkur', dark: 'myrkur', light: 'ljósur', veryLight: 'sera ljósur'
	},
	es: {
		black: 'negro', white: 'blanco', gray: 'gris', silver: 'plateado', brown: 'marrón',
		charcoal: 'gris carbón', slate: 'gris pizarra', ivory: 'marfil', cream: 'crema',
		beige: 'beige', sand: 'arena', tan: 'tostado', camel: 'camel', peach: 'melocotón',
		copper: 'cobre', bronze: 'bronce', caramel: 'caramelo', chocolate: 'marrón chocolate',
		burgundy: 'burdeos', maroon: 'granate', wine: 'vino', crimson: 'carmesí',
		coral: 'coral', salmon: 'salmón', terracotta: 'terracota', rust: 'óxido', brick: 'ladrillo',
		gold: 'dorado', mustard: 'mostaza', ochre: 'ocre', olive: 'oliva',
		red: 'rojo', rose: 'rosa', orange: 'naranja', amber: 'ámbar', yellow: 'amarillo',
		lime: 'verde lima', mint: 'verde menta', green: 'verde', forestGreen: 'verde bosque',
		seaGreen: 'verde mar', teal: 'verde azulado', turquoise: 'turquesa', cyan: 'cian',
		skyBlue: 'azul cielo', blue: 'azul', indigo: 'índigo', violet: 'violeta',
		navy: 'azul marino', lavender: 'lavanda', lilac: 'lila', mauve: 'malva',
		plum: 'ciruela', purple: 'morado', magenta: 'magenta', pink: 'rosa',
		veryDark: 'muy oscuro', dark: 'oscuro', light: 'claro', veryLight: 'muy claro'
	},
	de: {
		black: 'schwarz', white: 'weiß', gray: 'grau', silver: 'silber', brown: 'braun',
		charcoal: 'anthrazit', slate: 'schiefergrau', ivory: 'elfenbein', cream: 'creme',
		beige: 'beige', sand: 'sand', tan: 'hellbraun', camel: 'camel', peach: 'pfirsich',
		copper: 'kupfer', bronze: 'bronze', caramel: 'karamell', chocolate: 'schokoladenbraun',
		burgundy: 'bordeaux', maroon: 'kastanienbraun', wine: 'weinrot', crimson: 'karminrot',
		coral: 'koralle', salmon: 'lachs', terracotta: 'terrakotta', rust: 'rost', brick: 'ziegel',
		gold: 'gold', mustard: 'senfgelb', ochre: 'ocker', olive: 'oliv',
		red: 'rot', rose: 'rosé', orange: 'orange', amber: 'bernstein', yellow: 'gelb',
		lime: 'limettengrün', mint: 'mintgrün', green: 'grün', forestGreen: 'waldgrün',
		seaGreen: 'seegrün', teal: 'blaugrün', turquoise: 'türkis', cyan: 'cyan',
		skyBlue: 'himmelblau', blue: 'blau', indigo: 'indigo', violet: 'violett',
		navy: 'marineblau', lavender: 'lavendel', lilac: 'flieder', mauve: 'mauve',
		plum: 'pflaume', purple: 'lila', magenta: 'magenta', pink: 'pink',
		veryDark: 'sehr dunkel', dark: 'dunkel', light: 'hell', veryLight: 'sehr hell'
	},
	fr: {
		black: 'noir', white: 'blanc', gray: 'gris', silver: 'argent', brown: 'brun',
		charcoal: 'gris anthracite', slate: 'gris ardoise', ivory: 'ivoire', cream: 'crème',
		beige: 'beige', sand: 'sable', tan: 'fauve', camel: 'camel', peach: 'pêche',
		copper: 'cuivre', bronze: 'bronze', caramel: 'caramel', chocolate: 'brun chocolat',
		burgundy: 'bordeaux', maroon: 'marron foncé', wine: 'lie-de-vin', crimson: 'cramoisi',
		coral: 'corail', salmon: 'saumon', terracotta: 'terre cuite', rust: 'rouille', brick: 'brique',
		gold: 'or', mustard: 'moutarde', ochre: 'ocre', olive: 'olive',
		red: 'rouge', rose: 'rose', orange: 'orange', amber: 'ambre', yellow: 'jaune',
		lime: 'vert citron', mint: 'vert menthe', green: 'vert', forestGreen: 'vert forêt',
		seaGreen: 'vert d’eau', teal: 'bleu sarcelle', turquoise: 'turquoise', cyan: 'cyan',
		skyBlue: 'bleu ciel', blue: 'bleu', indigo: 'indigo', violet: 'violet',
		navy: 'bleu marine', lavender: 'lavande', lilac: 'lilas', mauve: 'mauve',
		plum: 'prune', purple: 'pourpre', magenta: 'magenta', pink: 'rose',
		veryDark: 'très foncé', dark: 'foncé', light: 'clair', veryLight: 'très clair'
	},
	pt: {
		black: 'preto', white: 'branco', gray: 'cinzento', silver: 'prateado', brown: 'castanho',
		charcoal: 'cinzento carvão', slate: 'cinzento ardósia', ivory: 'marfim', cream: 'creme',
		beige: 'bege', sand: 'areia', tan: 'tan', camel: 'camel', peach: 'pêssego',
		copper: 'cobre', bronze: 'bronze', caramel: 'caramelo', chocolate: 'castanho chocolate',
		burgundy: 'bordô', maroon: 'castanho-avermelhado', wine: 'vinho', crimson: 'carmesim',
		coral: 'coral', salmon: 'salmão', terracotta: 'terracota', rust: 'ferrugem', brick: 'tijolo',
		gold: 'dourado', mustard: 'mostarda', ochre: 'ocre', olive: 'oliva',
		red: 'vermelho', rose: 'rosa', orange: 'laranja', amber: 'âmbar', yellow: 'amarelo',
		lime: 'verde lima', mint: 'verde menta', green: 'verde', forestGreen: 'verde floresta',
		seaGreen: 'verde mar', teal: 'azul-petróleo', turquoise: 'turquesa', cyan: 'ciano',
		skyBlue: 'azul-céu', blue: 'azul', indigo: 'índigo', violet: 'violeta',
		navy: 'azul-marinho', lavender: 'lavanda', lilac: 'lilás', mauve: 'malva',
		plum: 'ameixa', purple: 'roxo', magenta: 'magenta', pink: 'cor-de-rosa',
		veryDark: 'muito escuro', dark: 'escuro', light: 'claro', veryLight: 'muito claro'
	},
	it: {
		black: 'nero', white: 'bianco', gray: 'grigio', silver: 'argento', brown: 'marrone',
		charcoal: 'grigio antracite', slate: 'grigio ardesia', ivory: 'avorio', cream: 'crema',
		beige: 'beige', sand: 'sabbia', tan: 'tan', camel: 'cammello', peach: 'pesca',
		copper: 'rame', bronze: 'bronzo', caramel: 'caramello', chocolate: 'marrone cioccolato',
		burgundy: 'bordeaux', maroon: 'granata', wine: 'vinaccia', crimson: 'cremisi',
		coral: 'corallo', salmon: 'salmone', terracotta: 'terracotta', rust: 'ruggine', brick: 'mattone',
		gold: 'oro', mustard: 'senape', ochre: 'ocra', olive: 'oliva',
		red: 'rosso', rose: 'rosa', orange: 'arancione', amber: 'ambra', yellow: 'giallo',
		lime: 'verde lime', mint: 'verde menta', green: 'verde', forestGreen: 'verde bosco',
		seaGreen: 'verde mare', teal: 'verde petrolio', turquoise: 'turchese', cyan: 'ciano',
		skyBlue: 'azzurro cielo', blue: 'blu', indigo: 'indaco', violet: 'viola',
		navy: 'blu navy', lavender: 'lavanda', lilac: 'lilla', mauve: 'malva',
		plum: 'prugna', purple: 'porpora', magenta: 'magenta', pink: 'rosa',
		veryDark: 'molto scuro', dark: 'scuro', light: 'chiaro', veryLight: 'molto chiaro'
	}
};

function colorNameLanguage() {
	var language = document.documentElement.lang || 'en';
	return COLOR_NAME_TRANSLATIONS[language] ? language : 'en';
}

function hslFromRgb(color) {
	var r = color.r / 255;
	var g = color.g / 255;
	var b = color.b / 255;
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h = 0;
	var s = 0;
	var l = (max + min) / 2;
	var delta = max - min;

	if (delta !== 0) {
		s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else {
			h = (r - g) / delta + 4;
		}

		h *= 60;
	}

	return { h: h, s: s, l: l };
}

function baseColorName(hue) {
	for (var i = 0; i < COLOR_NAME_RANGES.length; i++) {
		if (hue <= COLOR_NAME_RANGES[i].max) {
			return COLOR_NAME_RANGES[i].name;
		}
	}

	return 'red';
}

function colorModifier(lightness) {
	if (lightness < 0.18) {
		return 'veryDark';
	}

	if (lightness < 0.34) {
		return 'dark';
	}

	if (lightness > 0.9) {
		return 'veryLight';
	}

	if (lightness > 0.64) {
		return 'light';
	}

	return '';
}

function localizedColorName(name) {
	var language = colorNameLanguage();
	return COLOR_NAME_TRANSLATIONS[language][name] || COLOR_NAME_TRANSLATIONS.en[name] || name;
}

function coolNeutralName(hsl) {
	if (hsl.s > 0.42 || hsl.l > 0.34) {
		return '';
	}

	if (hsl.h >= 190 && hsl.h <= 250) {
		return hsl.l < 0.2 ? 'charcoal' : 'slate';
	}

	return 'charcoal';
}

function paleNeutralName(hsl) {
	if (hsl.l < 0.88) {
		return '';
	}

	if (hsl.h >= 38 && hsl.h <= 72) {
		return hsl.l >= 0.94 ? 'ivory' : 'cream';
	}

	if (hsl.h >= 18 && hsl.h < 38) {
		return 'cream';
	}

	return '';
}

function warmNeutralName(hsl) {
	if (hsl.h < 16 || hsl.h > 55) {
		return '';
	}

	var paleName = paleNeutralName(hsl);

	if (paleName) {
		return paleName;
	}

	if (hsl.l >= 0.88 && hsl.s <= 0.78) {
		return 'cream';
	}

	if (hsl.l >= 0.78 && hsl.s <= 0.78) {
		if (hsl.h <= 32 && hsl.s >= 0.42) {
			return 'peach';
		}

		return hsl.s <= 0.35 || hsl.s >= 0.62 ? 'beige' : 'sand';
	}

	if (hsl.l >= 0.58 && hsl.s <= 0.68) {
		if (hsl.h <= 28 && hsl.s >= 0.36) {
			return 'peach';
		}

		return hsl.s <= 0.52 ? 'tan' : 'camel';
	}

	if (hsl.l >= 0.42 && hsl.s <= 0.78) {
		if (hsl.h <= 30 && hsl.s >= 0.45) {
			return 'copper';
		}

		if (hsl.h >= 38 && hsl.s >= 0.45) {
			return 'bronze';
		}

		return hsl.s >= 0.38 ? 'caramel' : 'tan';
	}

	if (hsl.l < 0.52 && hsl.s >= 0.18) {
		return hsl.l < 0.24 ? 'chocolate' : 'brown';
	}

	return '';
}

function deepRedName(hsl) {
	if (hsl.h > 12 && hsl.h < 344) {
		return '';
	}

	if (hsl.s < 0.28 || hsl.l > 0.48) {
		return '';
	}

	if (hsl.h <= 12) {
		return hsl.h <= 4 && hsl.l < 0.26 && hsl.s < 0.75 ? 'maroon' : '';
	}

	if (hsl.l < 0.22) {
		return hsl.s > 0.56 ? 'wine' : 'maroon';
	}

	if (hsl.h >= 344 && hsl.h <= 356) {
		if (hsl.l >= 0.38 && hsl.s >= 0.62) {
			return 'crimson';
		}

		return 'burgundy';
	}

	return hsl.s > 0.62 ? 'crimson' : 'maroon';
}

function warmRedOrangeName(hsl) {
	if (hsl.h < 6 || hsl.h > 22 || hsl.s < 0.42) {
		return '';
	}

	if (hsl.l >= 0.68) {
		return hsl.h <= 12 ? 'salmon' : 'coral';
	}

	if (hsl.l >= 0.55) {
		return 'coral';
	}

	if (hsl.l >= 0.43) {
		return hsl.h <= 12 ? 'brick' : 'terracotta';
	}

	return hsl.h <= 12 ? 'rust' : 'terracotta';
}

function yellowEarthName(hsl) {
	if (hsl.h < 35 || hsl.h > 72 || hsl.s < 0.22) {
		return '';
	}

	if (hsl.l < 0.42 && hsl.s < 0.58) {
		return 'olive';
	}

	if (hsl.h >= 35 && hsl.h <= 48 && hsl.s >= 0.55 && hsl.l >= 0.48 && hsl.l <= 0.72) {
		return 'gold';
	}

	if (hsl.h >= 45 && hsl.l < 0.62) {
		return 'mustard';
	}

	if (hsl.h >= 35 && hsl.l < 0.62) {
		return 'ochre';
	}

	return '';
}

function greenSpecificName(hsl) {
	if (hsl.h < 82 || hsl.h > 176 || hsl.s < 0.18) {
		return '';
	}

	if (hsl.h < 104 && hsl.l < 0.42) {
		return 'olive';
	}

	if (hsl.h >= 130 && hsl.h <= 165 && hsl.l > 0.72 && hsl.s <= 0.62) {
		return 'mint';
	}

	if (hsl.h >= 96 && hsl.h <= 150 && hsl.l < 0.34) {
		return 'forestGreen';
	}

	if (hsl.h >= 145 && hsl.h <= 176 && hsl.s < 0.62 && hsl.l >= 0.34 && hsl.l <= 0.62) {
		return 'seaGreen';
	}

	return '';
}

function bluePurpleSpecificName(hsl) {
	if (hsl.h >= 205 && hsl.h <= 246 && hsl.l < 0.28 && hsl.s >= 0.28) {
		return 'navy';
	}

	if (hsl.h >= 246 && hsl.h <= 304 && hsl.l >= 0.72) {
		return hsl.h < 268 ? 'lavender' : 'lilac';
	}

	if (hsl.h >= 286 && hsl.h <= 326 && hsl.s <= 0.46 && hsl.l >= 0.42 && hsl.l <= 0.74) {
		return 'mauve';
	}

	if (hsl.h >= 286 && hsl.h <= 326 && hsl.l < 0.42 && hsl.s >= 0.28) {
		return 'plum';
	}

	return '';
}

function shouldModifyColorName(name) {
	return ![
		'black', 'white', 'silver', 'charcoal', 'slate', 'ivory', 'cream',
		'beige', 'sand', 'tan', 'camel', 'peach', 'copper', 'bronze',
		'caramel', 'chocolate', 'burgundy', 'maroon', 'wine', 'crimson',
		'coral', 'salmon', 'terracotta', 'rust', 'brick', 'gold', 'mustard',
		'ochre', 'olive', 'mint', 'forestGreen', 'seaGreen', 'navy',
		'lavender', 'lilac', 'mauve', 'plum'
	].includes(name);
}

function describeRgbColor(color) {
	var hsl = hslFromRgb(color);
	var name = '';
	var modifier = colorModifier(hsl.l);

	if (hsl.l <= 0.04) {
		return localizedColorName('black');
	}

	if (hsl.l >= 0.97 && hsl.s <= 0.08) {
		return localizedColorName('white');
	}

	if (hsl.s <= 0.08) {
		if (hsl.l > 0.72) {
			name = 'silver';
		} else if (hsl.l < 0.24) {
			name = coolNeutralName(hsl) || 'gray';
		} else {
			name = 'gray';
		}
	} else {
		name = paleNeutralName(hsl) ||
			deepRedName(hsl) ||
			yellowEarthName(hsl) ||
			warmNeutralName(hsl) ||
			warmRedOrangeName(hsl) ||
			greenSpecificName(hsl) ||
			bluePurpleSpecificName(hsl) ||
			coolNeutralName(hsl) ||
			baseColorName(hsl.h);
	}

	if (!modifier || !shouldModifyColorName(name)) {
		return localizedColorName(name);
	}

	return localizedColorName(modifier) + ' ' + localizedColorName(name);
}

function describeHexColor(hex) {
	var rgb = hexToRgb(hex);

	if (!rgb) {
		return '';
	}

	return describeRgbColor(rgb);
}

function formatColorForStatus(hex) {
	var description = describeHexColor(hex);
	return description ? hex + ' (' + description + ')' : hex;
}

function contrastRatio(color1, color2) {
	var color1Luminance = luminance(color1.r, color1.g, color1.b);
	var color2Luminance = luminance(color2.r, color2.g, color2.b);
	var lighter = Math.max(color1Luminance, color2Luminance);
	var darker = Math.min(color1Luminance, color2Luminance);

	return round((lighter + 0.05) / (darker + 0.05), 2);
}

function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
