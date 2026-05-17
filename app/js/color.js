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
