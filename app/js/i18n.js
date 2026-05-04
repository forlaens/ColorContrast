(function () {
	var languages = [
		{ code: 'en', name: 'English' },
		{ code: 'da', name: 'Dansk' },
		{ code: 'no', name: 'Norsk' },
		{ code: 'sv', name: 'Svenska' },
		{ code: 'fi', name: 'Suomi' },
		{ code: 'kl', name: 'Kalaallisut' },
		{ code: 'is', name: 'Íslenska' },
		{ code: 'fo', name: 'Føroyskt' },
		{ code: 'es', name: 'Español' },
		{ code: 'de', name: 'Deutsch' },
		{ code: 'fr', name: 'Français' },
		{ code: 'pt', name: 'Português' },
		{ code: 'it', name: 'Italiano' }
	];

	var translations = {
		en: {
			description: 'Upload an image and highlight areas that do not meet WCAG contrast targets.',
			skipLink: 'Skip to main content',
			languageLabel: 'Language',
			title: 'Image contrast checker',
			lede: 'Check whether text or UI colors have enough contrast when placed on top of an image.',
			chooseImage: 'Choose an image',
			uploadCopy: 'PNG, JPG, GIF, or SVG. The file stays in your browser.',
			loadImage: 'Load image',
			introTitle: 'How to use it',
			stepUploadTitle: 'Upload an image',
			stepUploadCopy: 'Use a screenshot, design export, or content image.',
			stepColorTitle: 'Pick the foreground color',
			stepColorCopy: 'Choose the text or UI color you want to test.',
			stepRunTitle: 'Run the test',
			stepRunCopy: 'The preview highlights image areas that do not meet the selected contrast target.',
			checkerTitle: 'Highlight contrast issues',
			checkerCopy: 'Highlighted pixels are places where the chosen color does not meet the selected WCAG ratio.',
			newImage: 'New image',
			resetImage: 'Reset image',
			colorLabel: 'Color to test',
			pickColor: 'Pick a color from the image',
			contrastLabel: 'Conformance level',
			wcagAA: 'WCAG level AA',
			wcagAAA: 'WCAG level AAA',
			nonText: 'Non-text (3:1)',
			largeTextAA: 'Large text (3:1)',
			smallTextAA: 'Small text (4.5:1)',
			largeTextAAA: 'Large text (4.5:1)',
			smallTextAAA: 'Small text (7:1)',
			runTest: 'Run test',
			imagePreview: 'Image preview',
			genericError: 'Something went wrong. Please try again.',
			pleaseWait: 'Please wait.',
			highlighting: 'Highlighting conflicting contrasts.',
			caching: 'Caching image and highlighting conflicting contrasts.',
			loadBeforeTest: 'Load an image before running a contrast test.',
			canvasError: 'Your browser could not initialize the image preview canvas.'
		},
		da: {
			description: 'Upload et billede, og markér områder, der ikke opfylder WCAG-kontrastkrav.',
			skipLink: 'Spring til hovedindhold',
			languageLabel: 'Sprog',
			title: 'Billedkontrasttjek',
			lede: 'Tjek om tekst- eller UI-farver har nok kontrast, når de ligger oven på et billede.',
			chooseImage: 'Vælg et billede',
			uploadCopy: 'PNG, JPG, GIF eller SVG. Filen bliver i din browser.',
			loadImage: 'Indlæs billede',
			introTitle: 'Sådan bruges det',
			stepUploadTitle: 'Upload et billede',
			stepUploadCopy: 'Brug et skærmbillede, designeksport eller indholdsbillede.',
			stepColorTitle: 'Vælg forgrundsfarven',
			stepColorCopy: 'Vælg den tekst- eller UI-farve, du vil teste.',
			stepRunTitle: 'Kør testen',
			stepRunCopy: 'Forhåndsvisningen markerer billedområder, der ikke opfylder det valgte kontrastmål.',
			checkerTitle: 'Markér kontrastproblemer',
			checkerCopy: 'Markerede pixels er steder, hvor den valgte farve ikke opfylder det valgte WCAG-forhold.',
			newImage: 'Nyt billede',
			resetImage: 'Nulstil billede',
			colorLabel: 'Farve der testes',
			pickColor: 'Vælg en farve fra billedet',
			contrastLabel: 'Overholdelsesniveau',
			wcagAA: 'WCAG-niveau AA',
			wcagAAA: 'WCAG-niveau AAA',
			nonText: 'Ikke-tekst (3:1)',
			largeTextAA: 'Stor tekst (3:1)',
			smallTextAA: 'Lille tekst (4,5:1)',
			largeTextAAA: 'Stor tekst (4,5:1)',
			smallTextAAA: 'Lille tekst (7:1)',
			runTest: 'Kør test',
			imagePreview: 'Billedvisning',
			genericError: 'Noget gik galt. Prøv igen.',
			pleaseWait: 'Vent venligst.',
			highlighting: 'Markerer kontrastkonflikter.'
		},
		no: {
			description: 'Last opp et bilde og marker områder som ikke oppfyller WCAG-kontrastkrav.',
			skipLink: 'Hopp til hovedinnhold',
			languageLabel: 'Språk',
			title: 'Bildekontrastsjekk',
			lede: 'Sjekk om tekst- eller UI-farger har nok kontrast når de ligger oppå et bilde.',
			chooseImage: 'Velg et bilde',
			uploadCopy: 'PNG, JPG, GIF eller SVG. Filen blir i nettleseren din.',
			loadImage: 'Last inn bilde',
			introTitle: 'Slik bruker du det',
			stepUploadTitle: 'Last opp et bilde',
			stepUploadCopy: 'Bruk et skjermbilde, designeksport eller innholdsbilde.',
			stepColorTitle: 'Velg forgrunnsfarge',
			stepColorCopy: 'Velg tekst- eller UI-fargen du vil teste.',
			stepRunTitle: 'Kjør testen',
			stepRunCopy: 'Forhåndsvisningen markerer bildeområder som ikke oppfyller valgt kontrastmål.',
			checkerTitle: 'Marker kontrastproblemer',
			checkerCopy: 'Markerte piksler er steder der valgt farge ikke oppfyller valgt WCAG-forhold.',
			newImage: 'Nytt bilde',
			resetImage: 'Tilbakestill bilde',
			colorLabel: 'Farge som testes',
			pickColor: 'Velg en farge fra bildet',
			contrastLabel: 'Samsvarsnivå',
			wcagAA: 'WCAG-nivå AA',
			wcagAAA: 'WCAG-nivå AAA',
			nonText: 'Ikke-tekst (3:1)',
			largeTextAA: 'Stor tekst (3:1)',
			smallTextAA: 'Liten tekst (4,5:1)',
			largeTextAAA: 'Stor tekst (4,5:1)',
			smallTextAAA: 'Liten tekst (7:1)',
			runTest: 'Kjør test',
			imagePreview: 'Bildeforhåndsvisning',
			genericError: 'Noe gikk galt. Prøv igjen.',
			pleaseWait: 'Vennligst vent.',
			highlighting: 'Markerer kontrastkonflikter.'
		},
		sv: {
			description: 'Ladda upp en bild och markera områden som inte uppfyller WCAG:s kontrastmål.',
			skipLink: 'Hoppa till huvudinnehåll',
			languageLabel: 'Språk',
			title: 'Bildkontrastkontroll',
			lede: 'Kontrollera om text- eller UI-färger har tillräcklig kontrast ovanpå en bild.',
			chooseImage: 'Välj en bild',
			uploadCopy: 'PNG, JPG, GIF eller SVG. Filen stannar i din webbläsare.',
			loadImage: 'Ladda bild',
			introTitle: 'Så använder du det',
			stepUploadTitle: 'Ladda upp en bild',
			stepUploadCopy: 'Använd en skärmbild, designexport eller innehållsbild.',
			stepColorTitle: 'Välj förgrundsfärg',
			stepColorCopy: 'Välj text- eller UI-färgen du vill testa.',
			stepRunTitle: 'Kör testet',
			stepRunCopy: 'Förhandsvisningen markerar bildområden som inte uppfyller valt kontrastmål.',
			checkerTitle: 'Markera kontrastproblem',
			checkerCopy: 'Markerade pixlar är platser där den valda färgen inte uppfyller valt WCAG-förhållande.',
			newImage: 'Ny bild',
			resetImage: 'Återställ bild',
			colorLabel: 'Färg att testa',
			pickColor: 'Välj en färg från bilden',
			contrastLabel: 'Överensstämmelsenivå',
			wcagAA: 'WCAG-nivå AA',
			wcagAAA: 'WCAG-nivå AAA',
			nonText: 'Icke-text (3:1)',
			largeTextAA: 'Stor text (3:1)',
			smallTextAA: 'Liten text (4,5:1)',
			largeTextAAA: 'Stor text (4,5:1)',
			smallTextAAA: 'Liten text (7:1)',
			runTest: 'Kör test',
			imagePreview: 'Bildförhandsvisning',
			genericError: 'Något gick fel. Försök igen.',
			pleaseWait: 'Vänta.',
			highlighting: 'Markerar kontrastkonflikter.'
		},
		fi: {
			description: 'Lataa kuva ja korosta alueet, jotka eivät täytä WCAG-kontrastitavoitteita.',
			skipLink: 'Siirry pääsisältöön',
			languageLabel: 'Kieli',
			title: 'Kuvan kontrastin tarkistin',
			lede: 'Tarkista, onko tekstin tai käyttöliittymän väreillä riittävä kontrasti kuvan päällä.',
			chooseImage: 'Valitse kuva',
			uploadCopy: 'PNG, JPG, GIF tai SVG. Tiedosto pysyy selaimessasi.',
			loadImage: 'Lataa kuva',
			introTitle: 'Näin sitä käytetään',
			stepUploadTitle: 'Lataa kuva',
			stepUploadCopy: 'Käytä kuvakaappausta, design-vientiä tai sisältökuvaa.',
			stepColorTitle: 'Valitse etualan väri',
			stepColorCopy: 'Valitse testattava tekstin tai käyttöliittymän väri.',
			stepRunTitle: 'Suorita testi',
			stepRunCopy: 'Esikatselu korostaa kuva-alueet, jotka eivät täytä valittua kontrastitavoitetta.',
			checkerTitle: 'Korosta kontrastiongelmat',
			checkerCopy: 'Korostetut pikselit ovat kohtia, joissa valittu väri ei täytä valittua WCAG-suhdetta.',
			newImage: 'Uusi kuva',
			resetImage: 'Palauta kuva',
			colorLabel: 'Testattava väri',
			pickColor: 'Valitse väri kuvasta',
			contrastLabel: 'Vaatimustaso',
			wcagAA: 'WCAG-taso AA',
			wcagAAA: 'WCAG-taso AAA',
			nonText: 'Ei-teksti (3:1)',
			largeTextAA: 'Suuri teksti (3:1)',
			smallTextAA: 'Pieni teksti (4,5:1)',
			largeTextAAA: 'Suuri teksti (4,5:1)',
			smallTextAAA: 'Pieni teksti (7:1)',
			runTest: 'Suorita testi',
			imagePreview: 'Kuvan esikatselu',
			genericError: 'Jotain meni pieleen. Yritä uudelleen.',
			pleaseWait: 'Odota.',
			highlighting: 'Korostetaan kontrastiristiriitoja.'
		},
		kl: {
			description: 'Assiliivik ikkunuk aamma WCAG-imi kontrastimut piumasaqaatinik naammassinninngitsut ersersikkit.',
			skipLink: 'Imarisamut pingaarnermut ingerlaarit',
			languageLabel: 'Oqaatsit',
			title: 'Assip kontrastia misissuut',
			lede: 'Allakkap imaluunniit UI-p qalipaataasa assip qaavani naammattumik kontrasteqarnersut misissukkit.',
			chooseImage: 'Assi toqqaruk',
			uploadCopy: 'PNG, JPG, GIF imaluunniit SVG. Fiili browserinniiginnassaaq.',
			loadImage: 'Assi ikkuguk',
			introTitle: 'Qanoq atorneqartoq',
			stepUploadTitle: 'Assi ikkuguk',
			stepUploadCopy: 'Skærmimi assi, design-exporti imaluunniit imarisami assi atoruk.',
			stepColorTitle: 'Siuliani qalipaat toqqaruk',
			stepColorCopy: 'Allakkap imaluunniit UI-p qalipaataa misilikkusut toqqaruk.',
			stepRunTitle: 'Misiliineq aallartiguk',
			stepRunCopy: 'Takussutissiaq assimi sumiiffinnik kontrastimut anguniakkamik naammassinninngitsunik ersersitsisarpoq.',
			checkerTitle: 'Kontrastimi ajornartorsiutit ersersikkit',
			checkerCopy: 'Pixelit ersersinneqartut tassaapput qalipaat toqqarneqartoq WCAG-imi annertussutsimik naammassinninngiffii.',
			newImage: 'Assi nutaaq',
			resetImage: 'Assi aallaqqaataanut utertiguk',
			colorLabel: 'Qalipaat misilinneqartoq',
			pickColor: 'Assimit qalipaat toqqaruk',
			contrastLabel: 'Naammassinniffiup qaffasissusaa',
			wcagAA: 'WCAG qaffasissuseq AA',
			wcagAAA: 'WCAG qaffasissuseq AAA',
			nonText: 'Allagaanani (3:1)',
			largeTextAA: 'Allagaq angisooq (3:1)',
			smallTextAA: 'Allagaq mikisoq (4,5:1)',
			largeTextAAA: 'Allagaq angisooq (4,5:1)',
			smallTextAAA: 'Allagaq mikisoq (7:1)',
			runTest: 'Misiliineq aallartiguk',
			imagePreview: 'Assip takussutissaa',
			genericError: 'Ajutoortoqarpoq. Misileeqqigit.',
			pleaseWait: 'Utaqqilaarit.',
			highlighting: 'Kontrastimi aporaaffiit ersersinneqarput.'
		},
		is: {
			description: 'Hladdu upp mynd og merktu svæði sem uppfylla ekki WCAG birtuskilamarkmið.',
			skipLink: 'Fara í aðalefni',
			languageLabel: 'Tungumál',
			title: 'Myndbirtuskilaprófari',
			lede: 'Athugaðu hvort texta- eða viðmótslitir hafi næg birtuskil þegar þeir liggja ofan á mynd.',
			chooseImage: 'Veldu mynd',
			uploadCopy: 'PNG, JPG, GIF eða SVG. Skráin verður áfram í vafranum þínum.',
			loadImage: 'Hlaða mynd',
			introTitle: 'Hvernig á að nota',
			stepUploadTitle: 'Hladdu upp mynd',
			stepUploadCopy: 'Notaðu skjáskot, hönnunarútflutning eða efnis mynd.',
			stepColorTitle: 'Veldu forgrunnslit',
			stepColorCopy: 'Veldu texta- eða viðmótslitinn sem þú vilt prófa.',
			stepRunTitle: 'Keyrðu prófið',
			stepRunCopy: 'Forskoðunin merkir myndsvæði sem uppfylla ekki valið birtuskilamarkmið.',
			checkerTitle: 'Merkja birtuskilavandamál',
			checkerCopy: 'Merktir pixlar eru staðir þar sem valinn litur uppfyllir ekki valið WCAG-hlutfall.',
			newImage: 'Ný mynd',
			resetImage: 'Endurstilla mynd',
			colorLabel: 'Litur til prófunar',
			pickColor: 'Veldu lit úr myndinni',
			contrastLabel: 'Samræmisstig',
			wcagAA: 'WCAG stig AA',
			wcagAAA: 'WCAG stig AAA',
			nonText: 'Ekki texti (3:1)',
			largeTextAA: 'Stór texti (3:1)',
			smallTextAA: 'Lítill texti (4,5:1)',
			largeTextAAA: 'Stór texti (4,5:1)',
			smallTextAAA: 'Lítill texti (7:1)',
			runTest: 'Keyra próf',
			imagePreview: 'Myndforskoðun',
			genericError: 'Eitthvað fór úrskeiðis. Reyndu aftur.',
			pleaseWait: 'Vinsamlegast bíddu.',
			highlighting: 'Merkir birtuskilaárekstra.'
		},
		fo: {
			description: 'Legg eina mynd inn og markera øki, sum ikki lúka WCAG-krøvini til kontrast.',
			skipLink: 'Far til høvuðsinnihald',
			languageLabel: 'Mál',
			title: 'Myndakontrastkannari',
			lede: 'Kanna um tekst- ella UI-litir hava nóg góðan kontrast, tá teir liggja omaná eini mynd.',
			chooseImage: 'Vel eina mynd',
			uploadCopy: 'PNG, JPG, GIF ella SVG. Fílan verður verandi í kaganum.',
			loadImage: 'Les mynd inn',
			introTitle: 'Soleiðis brúkar tú tað',
			stepUploadTitle: 'Legg eina mynd inn',
			stepUploadCopy: 'Brúka skíggjamynd, design-útflutning ella innihaldsmynd.',
			stepColorTitle: 'Vel forgrundslitin',
			stepColorCopy: 'Vel tekst- ella UI-litin, sum tú vilt kanna.',
			stepRunTitle: 'Koyr kanningina',
			stepRunCopy: 'Forsýningin markerar myndøki, sum ikki lúka valda kontrastmálið.',
			checkerTitle: 'Markera kontrasttrupulleikar',
			checkerCopy: 'Markeraðir pixlar eru støð, har valdi liturin ikki lýkur valda WCAG-lutfallið.',
			newImage: 'Nýggj mynd',
			resetImage: 'Nullstilla mynd',
			colorLabel: 'Litur at kanna',
			pickColor: 'Vel ein lit úr myndini',
			contrastLabel: 'Samsvarsstig',
			wcagAA: 'WCAG stig AA',
			wcagAAA: 'WCAG stig AAA',
			nonText: 'Ikki-tekstur (3:1)',
			largeTextAA: 'Stórur tekstur (3:1)',
			smallTextAA: 'Lítil tekstur (4,5:1)',
			largeTextAAA: 'Stórur tekstur (4,5:1)',
			smallTextAAA: 'Lítil tekstur (7:1)',
			runTest: 'Koyr kanning',
			imagePreview: 'Myndaforsýning',
			genericError: 'Okkurt gekk galið. Royn aftur.',
			pleaseWait: 'Vinarliga bíða.',
			highlighting: 'Markerar kontrastósemjur.'
		},
		es: {
			description: 'Sube una imagen y resalta las zonas que no cumplen los objetivos de contraste WCAG.',
			skipLink: 'Saltar al contenido principal',
			languageLabel: 'Idioma',
			title: 'Comprobador de contraste de imagen',
			lede: 'Comprueba si los colores de texto o interfaz tienen suficiente contraste sobre una imagen.',
			chooseImage: 'Elige una imagen',
			uploadCopy: 'PNG, JPG, GIF o SVG. El archivo permanece en tu navegador.',
			loadImage: 'Cargar imagen',
			introTitle: 'Cómo usarlo',
			stepUploadTitle: 'Sube una imagen',
			stepUploadCopy: 'Usa una captura, una exportación de diseño o una imagen de contenido.',
			stepColorTitle: 'Elige el color de primer plano',
			stepColorCopy: 'Elige el color de texto o interfaz que quieres probar.',
			stepRunTitle: 'Ejecuta la prueba',
			stepRunCopy: 'La vista previa resalta las zonas de la imagen que no cumplen el objetivo de contraste seleccionado.',
			checkerTitle: 'Resaltar problemas de contraste',
			checkerCopy: 'Los píxeles resaltados son lugares donde el color elegido no cumple la relación WCAG seleccionada.',
			newImage: 'Nueva imagen',
			resetImage: 'Restablecer imagen',
			colorLabel: 'Color a probar',
			pickColor: 'Elegir un color de la imagen',
			contrastLabel: 'Nivel de conformidad',
			wcagAA: 'Nivel WCAG AA',
			wcagAAA: 'Nivel WCAG AAA',
			nonText: 'No texto (3:1)',
			largeTextAA: 'Texto grande (3:1)',
			smallTextAA: 'Texto pequeño (4,5:1)',
			largeTextAAA: 'Texto grande (4,5:1)',
			smallTextAAA: 'Texto pequeño (7:1)',
			runTest: 'Ejecutar prueba',
			imagePreview: 'Vista previa de imagen',
			genericError: 'Algo salió mal. Inténtalo de nuevo.',
			pleaseWait: 'Espera, por favor.',
			highlighting: 'Resaltando conflictos de contraste.'
		},
		de: {
			description: 'Lade ein Bild hoch und markiere Bereiche, die die WCAG-Kontrastziele nicht erfüllen.',
			skipLink: 'Zum Hauptinhalt springen',
			languageLabel: 'Sprache',
			title: 'Bildkontrast-Prüfer',
			lede: 'Prüfe, ob Text- oder UI-Farben auf einem Bild genügend Kontrast haben.',
			chooseImage: 'Bild auswählen',
			uploadCopy: 'PNG, JPG, GIF oder SVG. Die Datei bleibt in deinem Browser.',
			loadImage: 'Bild laden',
			introTitle: 'So funktioniert es',
			stepUploadTitle: 'Bild hochladen',
			stepUploadCopy: 'Nutze einen Screenshot, Design-Export oder ein Inhaltsbild.',
			stepColorTitle: 'Vordergrundfarbe wählen',
			stepColorCopy: 'Wähle die Text- oder UI-Farbe, die du testen möchtest.',
			stepRunTitle: 'Test starten',
			stepRunCopy: 'Die Vorschau markiert Bildbereiche, die das gewählte Kontrastziel nicht erfüllen.',
			checkerTitle: 'Kontrastprobleme markieren',
			checkerCopy: 'Markierte Pixel sind Stellen, an denen die gewählte Farbe das ausgewählte WCAG-Verhältnis nicht erfüllt.',
			newImage: 'Neues Bild',
			resetImage: 'Bild zurücksetzen',
			colorLabel: 'Zu testende Farbe',
			pickColor: 'Farbe aus dem Bild wählen',
			contrastLabel: 'Konformitätsstufe',
			wcagAA: 'WCAG-Stufe AA',
			wcagAAA: 'WCAG-Stufe AAA',
			nonText: 'Nicht-Text (3:1)',
			largeTextAA: 'Großer Text (3:1)',
			smallTextAA: 'Kleiner Text (4,5:1)',
			largeTextAAA: 'Großer Text (4,5:1)',
			smallTextAAA: 'Kleiner Text (7:1)',
			runTest: 'Test starten',
			imagePreview: 'Bildvorschau',
			genericError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
			pleaseWait: 'Bitte warten.',
			highlighting: 'Kontrastkonflikte werden markiert.'
		},
		fr: {
			description: 'Importez une image et mettez en évidence les zones qui ne respectent pas les objectifs de contraste WCAG.',
			skipLink: 'Aller au contenu principal',
			languageLabel: 'Langue',
			title: 'Vérificateur de contraste d’image',
			lede: 'Vérifiez si les couleurs de texte ou d’interface ont assez de contraste sur une image.',
			chooseImage: 'Choisir une image',
			uploadCopy: 'PNG, JPG, GIF ou SVG. Le fichier reste dans votre navigateur.',
			loadImage: 'Charger l’image',
			introTitle: 'Comment l’utiliser',
			stepUploadTitle: 'Importer une image',
			stepUploadCopy: 'Utilisez une capture, un export de design ou une image de contenu.',
			stepColorTitle: 'Choisir la couleur de premier plan',
			stepColorCopy: 'Choisissez la couleur de texte ou d’interface à tester.',
			stepRunTitle: 'Lancer le test',
			stepRunCopy: 'L’aperçu met en évidence les zones de l’image qui ne respectent pas la cible de contraste choisie.',
			checkerTitle: 'Mettre en évidence les problèmes de contraste',
			checkerCopy: 'Les pixels mis en évidence indiquent où la couleur choisie ne respecte pas le ratio WCAG sélectionné.',
			newImage: 'Nouvelle image',
			resetImage: 'Réinitialiser l’image',
			colorLabel: 'Couleur à tester',
			pickColor: 'Choisir une couleur dans l’image',
			contrastLabel: 'Niveau de conformité',
			wcagAA: 'Niveau WCAG AA',
			wcagAAA: 'Niveau WCAG AAA',
			nonText: 'Hors texte (3:1)',
			largeTextAA: 'Grand texte (3:1)',
			smallTextAA: 'Petit texte (4,5:1)',
			largeTextAAA: 'Grand texte (4,5:1)',
			smallTextAAA: 'Petit texte (7:1)',
			runTest: 'Lancer le test',
			imagePreview: 'Aperçu de l’image',
			genericError: 'Une erreur est survenue. Réessayez.',
			pleaseWait: 'Veuillez patienter.',
			highlighting: 'Mise en évidence des conflits de contraste.'
		},
		pt: {
			description: 'Carregue uma imagem e destaque áreas que não cumprem os objetivos de contraste WCAG.',
			skipLink: 'Saltar para o conteúdo principal',
			languageLabel: 'Idioma',
			title: 'Verificador de contraste de imagem',
			lede: 'Verifique se as cores de texto ou interface têm contraste suficiente sobre uma imagem.',
			chooseImage: 'Escolha uma imagem',
			uploadCopy: 'PNG, JPG, GIF ou SVG. O ficheiro fica no seu navegador.',
			loadImage: 'Carregar imagem',
			introTitle: 'Como usar',
			stepUploadTitle: 'Carregue uma imagem',
			stepUploadCopy: 'Use uma captura, exportação de design ou imagem de conteúdo.',
			stepColorTitle: 'Escolha a cor de primeiro plano',
			stepColorCopy: 'Escolha a cor de texto ou interface que quer testar.',
			stepRunTitle: 'Execute o teste',
			stepRunCopy: 'A pré-visualização destaca áreas da imagem que não cumprem o alvo de contraste selecionado.',
			checkerTitle: 'Destacar problemas de contraste',
			checkerCopy: 'Os píxeis destacados são locais onde a cor escolhida não cumpre a relação WCAG selecionada.',
			newImage: 'Nova imagem',
			resetImage: 'Repor imagem',
			colorLabel: 'Cor a testar',
			pickColor: 'Escolher uma cor da imagem',
			contrastLabel: 'Nível de conformidade',
			wcagAA: 'Nível WCAG AA',
			wcagAAA: 'Nível WCAG AAA',
			nonText: 'Não texto (3:1)',
			largeTextAA: 'Texto grande (3:1)',
			smallTextAA: 'Texto pequeno (4,5:1)',
			largeTextAAA: 'Texto grande (4,5:1)',
			smallTextAAA: 'Texto pequeno (7:1)',
			runTest: 'Executar teste',
			imagePreview: 'Pré-visualização da imagem',
			genericError: 'Algo correu mal. Tente novamente.',
			pleaseWait: 'Aguarde.',
			highlighting: 'A destacar conflitos de contraste.'
		},
		it: {
			description: 'Carica un’immagine ed evidenzia le aree che non rispettano gli obiettivi di contrasto WCAG.',
			skipLink: 'Vai al contenuto principale',
			languageLabel: 'Lingua',
			title: 'Verifica contrasto immagine',
			lede: 'Controlla se i colori di testo o interfaccia hanno abbastanza contrasto sopra un’immagine.',
			chooseImage: 'Scegli un’immagine',
			uploadCopy: 'PNG, JPG, GIF o SVG. Il file resta nel tuo browser.',
			loadImage: 'Carica immagine',
			introTitle: 'Come usarlo',
			stepUploadTitle: 'Carica un’immagine',
			stepUploadCopy: 'Usa uno screenshot, un export di design o un’immagine di contenuto.',
			stepColorTitle: 'Scegli il colore in primo piano',
			stepColorCopy: 'Scegli il colore di testo o interfaccia che vuoi testare.',
			stepRunTitle: 'Esegui il test',
			stepRunCopy: 'L’anteprima evidenzia le aree dell’immagine che non rispettano il target di contrasto selezionato.',
			checkerTitle: 'Evidenzia problemi di contrasto',
			checkerCopy: 'I pixel evidenziati sono punti in cui il colore scelto non rispetta il rapporto WCAG selezionato.',
			newImage: 'Nuova immagine',
			resetImage: 'Reimposta immagine',
			colorLabel: 'Colore da testare',
			pickColor: 'Scegli un colore dall’immagine',
			contrastLabel: 'Livello di conformità',
			wcagAA: 'Livello WCAG AA',
			wcagAAA: 'Livello WCAG AAA',
			nonText: 'Non testo (3:1)',
			largeTextAA: 'Testo grande (3:1)',
			smallTextAA: 'Testo piccolo (4,5:1)',
			largeTextAAA: 'Testo grande (4,5:1)',
			smallTextAAA: 'Testo piccolo (7:1)',
			runTest: 'Esegui test',
			imagePreview: 'Anteprima immagine',
			genericError: 'Qualcosa è andato storto. Riprova.',
			pleaseWait: 'Attendere.',
			highlighting: 'Evidenziazione dei conflitti di contrasto.'
		}
	};

	function getTranslation(key) {
		var current = translations[window.appLanguage] || translations.en;
		return current[key] || translations.en[key] || key;
	}

	function setText(selector, key, attr) {
		var elements = document.querySelectorAll(selector);

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var value = getTranslation(element.getAttribute(key));

			if (attr === 'text') {
				element.textContent = value;
			} else if (attr === 'value') {
				element.value = value;
			} else {
				element.setAttribute(attr, value);
			}
		}
	}

	function getInitialLanguage() {
		var params = new URLSearchParams(window.location.search);
		var requested = params.get('lang') || window.localStorage.getItem('colorcontrast-language');

		if (translations[requested]) {
			return requested;
		}

		var browserLanguage = (navigator.language || 'en').slice(0, 2).toLowerCase();
		return translations[browserLanguage] ? browserLanguage : 'en';
	}

	function populateSwitcher(switcher) {
		if (switcher.options.length > 0) {
			return;
		}

		for (var i = 0; i < languages.length; i++) {
			var option = document.createElement('option');
			option.value = languages[i].code;
			option.textContent = languages[i].name;
			switcher.appendChild(option);
		}
	}

	function applyLanguage(language) {
		window.appLanguage = translations[language] ? language : 'en';
		document.documentElement.lang = window.appLanguage;
		document.title = getTranslation('title');

		var description = document.querySelector('meta[name="description"]');
		if (description) {
			description.setAttribute('content', getTranslation('description'));
		}

		setText('[data-i18n]', 'data-i18n', 'text');
		setText('[data-i18n-value]', 'data-i18n-value', 'value');
		setText('[data-i18n-label]', 'data-i18n-label', 'label');
		setText('[data-i18n-aria-label]', 'data-i18n-aria-label', 'aria-label');

		var switcher = document.querySelector('#language-switcher');
		if (switcher) {
			switcher.value = window.appLanguage;
		}

		window.localStorage.setItem('colorcontrast-language', window.appLanguage);
	}

	function initLanguageSwitcher() {
		var switcher = document.querySelector('#language-switcher');

		window.translate = getTranslation;
		window.appLanguage = getInitialLanguage();

		if (switcher) {
			populateSwitcher(switcher);
			switcher.addEventListener('change', function () {
				applyLanguage(switcher.value);
			});
		}

		applyLanguage(window.appLanguage);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
	} else {
		initLanguageSwitcher();
	}
}());
