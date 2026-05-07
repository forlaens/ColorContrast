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

function hexToRgb(hex) {
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
		red: 'red', rose: 'rose', orange: 'orange', amber: 'amber', yellow: 'yellow',
		lime: 'lime', green: 'green', teal: 'teal', turquoise: 'turquoise', cyan: 'cyan',
		skyBlue: 'sky blue', blue: 'blue', indigo: 'indigo', violet: 'violet',
		purple: 'purple', magenta: 'magenta', pink: 'pink',
		veryDark: 'very dark', dark: 'dark', light: 'light', veryLight: 'very light'
	},
	da: {
		black: 'sort', white: 'hvid', gray: 'grå', silver: 'sølv', brown: 'brun',
		red: 'rød', rose: 'rosa', orange: 'orange', amber: 'ravgul', yellow: 'gul',
		lime: 'limegrøn', green: 'grøn', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmelblå', blue: 'blå', indigo: 'indigo', violet: 'violet',
		purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'meget mørk', dark: 'mørk', light: 'lys', veryLight: 'meget lys'
	},
	no: {
		black: 'svart', white: 'hvit', gray: 'grå', silver: 'sølv', brown: 'brun',
		red: 'rød', rose: 'rosa', orange: 'oransje', amber: 'ravgul', yellow: 'gul',
		lime: 'limegrønn', green: 'grønn', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmelblå', blue: 'blå', indigo: 'indigo', violet: 'fiolett',
		purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'veldig mørk', dark: 'mørk', light: 'lys', veryLight: 'veldig lys'
	},
	sv: {
		black: 'svart', white: 'vit', gray: 'grå', silver: 'silver', brown: 'brun',
		red: 'röd', rose: 'rosa', orange: 'orange', amber: 'bärnsten', yellow: 'gul',
		lime: 'limegrön', green: 'grön', teal: 'teal', turquoise: 'turkos', cyan: 'cyan',
		skyBlue: 'himmelsblå', blue: 'blå', indigo: 'indigo', violet: 'violett',
		purple: 'lila', magenta: 'magenta', pink: 'pink',
		veryDark: 'mycket mörk', dark: 'mörk', light: 'ljus', veryLight: 'mycket ljus'
	},
	fi: {
		black: 'musta', white: 'valkoinen', gray: 'harmaa', silver: 'hopea', brown: 'ruskea',
		red: 'punainen', rose: 'roosa', orange: 'oranssi', amber: 'meripihka', yellow: 'keltainen',
		lime: 'limenvihreä', green: 'vihreä', teal: 'sinivihreä', turquoise: 'turkoosi', cyan: 'syaani',
		skyBlue: 'taivaansininen', blue: 'sininen', indigo: 'indigo', violet: 'violetti',
		purple: 'purppura', magenta: 'magenta', pink: 'pinkki',
		veryDark: 'hyvin tumma', dark: 'tumma', light: 'vaalea', veryLight: 'hyvin vaalea'
	},
	kl: {
		black: 'qernertoq', white: 'qaqortoq', gray: 'qasersoq', silver: 'sølv', brown: 'kajortoq',
		red: 'aappaluttoq', rose: 'rose', orange: 'orange', amber: 'amber', yellow: 'sungaartoq',
		lime: 'lime', green: 'qorsuk', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'tungujortoq qaamasoq', blue: 'tungujortoq', indigo: 'indigo', violet: 'violet',
		purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'taartorujussuaq', dark: 'taartoq', light: 'qaamasoq', veryLight: 'qaamasorujussuaq'
	},
	is: {
		black: 'svartur', white: 'hvítur', gray: 'grár', silver: 'silfur', brown: 'brúnn',
		red: 'rauður', rose: 'rósrauður', orange: 'appelsínugulur', amber: 'rafgulur', yellow: 'gulur',
		lime: 'limegrænn', green: 'grænn', teal: 'teal', turquoise: 'túrkís', cyan: 'cyan',
		skyBlue: 'himinblár', blue: 'blár', indigo: 'indigo', violet: 'fjólublár',
		purple: 'purpuri', magenta: 'magenta', pink: 'bleikur',
		veryDark: 'mjög dökkur', dark: 'dökkur', light: 'ljós', veryLight: 'mjög ljós'
	},
	fo: {
		black: 'svartur', white: 'hvítur', gray: 'gráur', silver: 'silvur', brown: 'brúnur',
		red: 'reyður', rose: 'rosa', orange: 'appilsingulur', amber: 'ravlittur', yellow: 'gulur',
		lime: 'limegrønur', green: 'grønur', teal: 'teal', turquoise: 'turkis', cyan: 'cyan',
		skyBlue: 'himmalbláur', blue: 'bláur', indigo: 'indigo', violet: 'violettur',
		purple: 'lilla', magenta: 'magenta', pink: 'pink',
		veryDark: 'sera myrkur', dark: 'myrkur', light: 'ljósur', veryLight: 'sera ljósur'
	},
	es: {
		black: 'negro', white: 'blanco', gray: 'gris', silver: 'plateado', brown: 'marrón',
		red: 'rojo', rose: 'rosa', orange: 'naranja', amber: 'ámbar', yellow: 'amarillo',
		lime: 'verde lima', green: 'verde', teal: 'verde azulado', turquoise: 'turquesa', cyan: 'cian',
		skyBlue: 'azul cielo', blue: 'azul', indigo: 'índigo', violet: 'violeta',
		purple: 'morado', magenta: 'magenta', pink: 'rosa',
		veryDark: 'muy oscuro', dark: 'oscuro', light: 'claro', veryLight: 'muy claro'
	},
	de: {
		black: 'schwarz', white: 'weiß', gray: 'grau', silver: 'silber', brown: 'braun',
		red: 'rot', rose: 'rosé', orange: 'orange', amber: 'bernstein', yellow: 'gelb',
		lime: 'limettengrün', green: 'grün', teal: 'blaugrün', turquoise: 'türkis', cyan: 'cyan',
		skyBlue: 'himmelblau', blue: 'blau', indigo: 'indigo', violet: 'violett',
		purple: 'lila', magenta: 'magenta', pink: 'pink',
		veryDark: 'sehr dunkel', dark: 'dunkel', light: 'hell', veryLight: 'sehr hell'
	},
	fr: {
		black: 'noir', white: 'blanc', gray: 'gris', silver: 'argent', brown: 'brun',
		red: 'rouge', rose: 'rose', orange: 'orange', amber: 'ambre', yellow: 'jaune',
		lime: 'vert citron', green: 'vert', teal: 'bleu sarcelle', turquoise: 'turquoise', cyan: 'cyan',
		skyBlue: 'bleu ciel', blue: 'bleu', indigo: 'indigo', violet: 'violet',
		purple: 'pourpre', magenta: 'magenta', pink: 'rose',
		veryDark: 'très foncé', dark: 'foncé', light: 'clair', veryLight: 'très clair'
	},
	pt: {
		black: 'preto', white: 'branco', gray: 'cinzento', silver: 'prateado', brown: 'castanho',
		red: 'vermelho', rose: 'rosa', orange: 'laranja', amber: 'âmbar', yellow: 'amarelo',
		lime: 'verde lima', green: 'verde', teal: 'azul-petróleo', turquoise: 'turquesa', cyan: 'ciano',
		skyBlue: 'azul-céu', blue: 'azul', indigo: 'índigo', violet: 'violeta',
		purple: 'roxo', magenta: 'magenta', pink: 'cor-de-rosa',
		veryDark: 'muito escuro', dark: 'escuro', light: 'claro', veryLight: 'muito claro'
	},
	it: {
		black: 'nero', white: 'bianco', gray: 'grigio', silver: 'argento', brown: 'marrone',
		red: 'rosso', rose: 'rosa', orange: 'arancione', amber: 'ambra', yellow: 'giallo',
		lime: 'verde lime', green: 'verde', teal: 'verde petrolio', turquoise: 'turchese', cyan: 'ciano',
		skyBlue: 'azzurro cielo', blue: 'blu', indigo: 'indaco', violet: 'viola',
		purple: 'porpora', magenta: 'magenta', pink: 'rosa',
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
		} else {
			name = 'gray';
		}
	} else if (hsl.h >= 18 && hsl.h <= 45 && hsl.s >= 0.28 && hsl.l < 0.42) {
		name = 'brown';
	} else {
		name = baseColorName(hsl.h);
	}

	if (!modifier || name === 'black' || name === 'white' || name === 'silver') {
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
