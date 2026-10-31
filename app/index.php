<?php include($_SERVER['DOCUMENT_ROOT'] . '/include/layout/head.php'); ?>

<div class="app-shell">
	<noscript>
		<div class="notice">For this tool to work, your browser must have JavaScript enabled.</div>
	</noscript>

	<div hidden id="app-error" class="error-panel" role="alert" tabindex="-1"></div>

	<header class="hero" aria-labelledby="app-title">
		<a class="skip-link" href="#main-content" onclick="markSkipLinkTarget();" data-i18n="skipLink">Skip to main content</a>
		<div>
			<h1 id="app-title">
				<a class="home-title-link" href="/" onclick="return showFrontView();">
					<img class="brand-mark" src="/img/brand/forlaens-circle-mark.svg" width="32" height="32" alt="">
					<span data-i18n="title">Color contrast checker</span>
				</a>
			</h1>
		</div>
		<div class="header-controls">
			<label class="language-switcher">
				<span class="label-with-icon">
					<svg class="label-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
						<ellipse cx="12" cy="12" rx="4.5" ry="9" fill="none" stroke="currentColor" stroke-width="1.4" />
						<ellipse cx="12" cy="12" rx="2" ry="9" fill="none" stroke="currentColor" stroke-width="1.2" />
						<path d="M3 12H21" fill="none" stroke="currentColor" stroke-width="1.4" />
						<path d="M5 8H19" fill="none" stroke="currentColor" stroke-width="1.2" />
						<path d="M5 16H19" fill="none" stroke="currentColor" stroke-width="1.2" />
					</svg>
					<span data-i18n="languageLabel">Language</span>
				</span>
				<select id="language-switcher" name="language" autocomplete="off"></select>
			</label>
			<div class="theme-control">
				<label for="theme-toggle" data-i18n="themeLabel">Theme</label>
				<button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false" aria-label="Dark mode" data-i18n-aria-label="themeDark">
					<svg class="theme-icon" aria-hidden="true" focusable="false" viewBox="0 0 32 32">
						<path d="M16 2 A14 14 0 0 0 16 30 Z" />
						<circle cx="16" cy="16" r="14" />
					</svg>
					<span class="sr-only" data-i18n="themeDark">Dark mode</span>
				</button>
			</div>
		</div>
		<div id="settings-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
	</header>

	<main id="main-content" class="app-main" tabindex="-1">
		<div id="home-view">
		<section id="tool-chooser" class="tool-chooser" aria-labelledby="tool-chooser-title" tabindex="-1">
			<h2 id="tool-chooser-title" data-i18n="toolChooserTitle">What do you want to check?</h2>
			<p data-i18n="toolChooserCopy">Choose two colors, or check an image.</p>
			<div class="tool-choice-grid">
				<a class="tool-choice" href="#simple-contrast">
					<span class="tool-choice-copy">
						<strong data-i18n="simpleContrastTitle">Check two colors</strong>
						<span data-i18n="simpleChoiceCopy">Compare a foreground and background color.</span>
					</span>
					<span class="tool-choice-arrow" aria-hidden="true">→</span>
				</a>
				<a class="tool-choice" href="#image-contrast">
					<span class="tool-choice-copy">
						<strong data-i18n="chooseImage">Check contrast in an image</strong>
						<span data-i18n="imageChoiceCopy">Find places where a chosen color is difficult to see.</span>
					</span>
					<span class="tool-choice-arrow" aria-hidden="true">→</span>
				</a>
			</div>
		</section>

		<section hidden id="simple-contrast" class="simple-contrast" aria-labelledby="simple-contrast-title" tabindex="-1">
			<a class="tool-switch-link" href="/" onclick="return showFrontView();">
				<svg class="tool-switch-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
					<path d="M19 12H5M11 6L5 12L11 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
				</svg>
				<span data-i18n="changeTool">Back to tools</span>
			</a>
			<div class="simple-contrast-header">
				<div>
					<h2 id="simple-contrast-title" data-i18n="simpleContrastTitle">Check two colors</h2>
					<p data-i18n="simpleContrastCopy">Choose a foreground color and a background color to see whether they have enough contrast.</p>
				</div>
			</div>
			<div class="simple-workspace">
				<div class="simple-contrast-form">
				<div class="field simple-color-field">
					<span id="simple-foreground-label" data-i18n="simpleForegroundLabel">Foreground color</span>
					<span class="color-input-pair">
					<input id="simple-foreground" class="hex-color-control" type="text" name="foreground" value="#111827" inputmode="text" spellcheck="false" autocomplete="off" aria-labelledby="simple-foreground-label" aria-describedby="simple-color-hint simple-foreground-error">
					<input id="simple-foreground-native" class="native-color-control" type="color" value="#111827" aria-label="Choose foreground color visually" data-i18n-aria-label="chooseForegroundVisually">
				</span>
				<span hidden id="simple-foreground-error" class="field-error" data-i18n="colorInvalid">Enter a valid color, such as #1a2b3c.</span>
			</div>
				<div class="field simple-color-field">
					<span id="simple-background-label" data-i18n="simpleBackgroundLabel">Background color</span>
					<span class="color-input-pair">
					<input id="simple-background" class="hex-color-control" type="text" name="background" value="#ffffff" inputmode="text" spellcheck="false" autocomplete="off" aria-labelledby="simple-background-label" aria-describedby="simple-color-hint simple-background-error">
					<input id="simple-background-native" class="native-color-control" type="color" value="#ffffff" aria-label="Choose background color visually" data-i18n-aria-label="chooseBackgroundVisually">
				</span>
				<span hidden id="simple-background-error" class="field-error" data-i18n="colorInvalid">Enter a valid color, such as #1a2b3c.</span>
			</div>
			<button id="simple-swap" class="cta ghost simple-swap" type="button" onclick="swapSimpleColors();" data-i18n="swapColors">Swap colors</button>
				</div>
				<p id="simple-color-hint" class="field-hint" data-i18n="colorFormatHint">Use a hex value or a recognized CSS color.</p>
				<div id="simple-contrast-result" class="simple-contrast-result"></div>
				<div id="simple-contrast-sample" class="simple-contrast-sample">
					<span data-i18n="simpleSampleText">Sample text</span>
				</div>
			</div>
		<details class="help-disclosure">
			<summary data-i18n="textSizeHelpTitle">What counts as normal and large text?</summary>
			<p data-i18n="textSizeHelpCopy">Large text is at least 24 px, or 18.5 px when bold. Smaller text counts as normal text.</p>
		</details>
	</section>

	<div hidden id="image-contrast-view" class="image-contrast-view">
		<div class="image-flow-bar">
			<a class="tool-switch-link" href="/" onclick="return showFrontView();">
				<svg class="tool-switch-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
					<path d="M19 12H5M11 6L5 12L11 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
				</svg>
				<span data-i18n="changeTool">Back to tools</span>
			</a>
			<section hidden id="loaded-image-summary" class="loaded-image-summary" aria-label="Loaded image" data-i18n-aria-label="chooseImage">
				<p id="image-summary-text"></p>
				<button class="cta ghost" type="button" onclick="replaceImage();" data-i18n="replaceImage">Choose another image</button>
			</section>
		</div>
		<section id="step-1" class="step upload-panel" aria-labelledby="upload-title" tabindex="-1">
			<div class="upload-intro">
				<h2 id="upload-title" class="upload-title" data-i18n="chooseImage">Check contrast in an image</h2>
				<p class="upload-copy" data-i18n="uploadCopy">Choose an image to find where a color may be hard to see. PNG, JPG, GIF, or SVG. It stays in your browser.</p>
			</div>
			<div class="upload-dropzone">
				<p class="paste-hint" data-i18n="pasteHint">Drop an image here, or paste one from your clipboard.</p>
				<span class="upload-file-row">
					<img hidden id="image-thumbnail" class="upload-thumbnail" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="">
					<input id="image_file" class="file-input-native" type="file" name="image" accept="image/*" aria-describedby="selected-file-name">
					<label for="image_file" class="file-picker-control">
						<span class="file-picker-button" data-i18n="chooseFile">Choose image</span>
						<span id="selected-file-name" class="selected-file-name sr-only" data-i18n-file-empty="noFileChosen">No file chosen</span>
					</label>
				</span>
				<details class="image-url-disclosure">
					<summary data-i18n="useImageUrl">Use an image URL</summary>
					<div class="upload-url-row">
						<label class="field upload-url-field">
							<span data-i18n="imageUrlLabel">Image URL</span>
							<input id="image_url" type="url" inputmode="url" autocomplete="url" placeholder="https://example.com/image.png" data-i18n-placeholder="imageUrlPlaceholder" aria-describedby="image-source-error">
						</label>
						<button id="load-image-url" class="cta secondary" type="button" onclick="loadImageFromUrl();" data-i18n="loadImageUrl" disabled>Load URL</button>
					</div>
				</details>
				<p hidden id="image-source-status" class="upload-status" role="status" aria-live="polite" aria-atomic="true"></p>
				<p hidden id="image-source-error" class="field-error" role="alert"></p>
			</div>
		</section>

	<section hidden id="step-2" class="step checker-stage" aria-labelledby="checker-title">
		<div class="stage-header">
			<div>
				<h2 id="checker-title" data-i18n="checkerTitle">Highlight contrast issues</h2>
				<p class="stage-copy" data-i18n="checkerCopy">Highlighted pixels are places where the chosen color may be hard to read or see against the image.</p>
			</div>
		</div>

		<div hidden role="status" class="loading" aria-atomic="true"></div>
		<div class="checker-scroll">
			<section id="preview_area" class="checker" aria-label="Contrast checker" data-i18n-aria-label="checkerRegion">
				<div class="checker-sidebar">
					<div id="checker-settings" class="checker-settings" role="group" aria-label="Checker settings" data-i18n-aria-label="settingsToolbar">
					<div class="toolbar-group">
						<div class="field color-field">
							<span id="testcolor-label" data-i18n="colorLabel">Color to check</span>
							<span class="control-row">
							<input id="test-color" class="hex-color-control" type="text" name="color" value="#000000" inputmode="text" spellcheck="false" autocomplete="off" aria-labelledby="testcolor-label" aria-describedby="test-color-error">
								<input id="test-color-native" class="native-color-control" type="color" value="#000000" aria-label="Choose color visually" data-i18n-aria-label="chooseColorVisually">
						</span>
						<span hidden id="test-color-error" class="field-error" data-i18n="colorInvalid">Enter a valid color, such as #1a2b3c.</span>
							<span hidden id="selected-test-color" class="selected-test-color" aria-live="polite"></span>
					</div>

					<label class="field">
						<span id="contrast-label" data-i18n="contrastUseLabel">What will the color be used for?</span>
						<select name="contrast" aria-labelledby="contrast-label">
							<option value="4.5" selected data-i18n="smallTextAA">Normal text, AA (4.5:1)</option>
							<option value="7" data-i18n="smallTextAAA">Normal text, AAA (7:1)</option>
							<option value="3" data-i18n="largeTextAA">Large text, AA (3:1)</option>
							<option value="4.5" data-i18n="largeTextAAA">Large text, AAA (4.5:1)</option>
							<option value="3" data-i18n="nonText">Graphics (3:1)</option>
						</select>
						</label>
					</div>
				</div>
				<div class="view-controls">
					<button id="run-test" class="cta" type="button" onclick="initRenderContrast();" data-i18n="findProblemAreas">Find problem areas</button>
				</div>
				<div hidden id="checker-result" class="checker-result"></div>
				</div>
				<div class="checker-preview-column">
				<div class="preview-control-bar">
					<div hidden id="result-view-controls" class="result-view-controls" role="group" aria-label="Image view" data-i18n-aria-label="imagePreview">
						<button id="show-problems" class="cta secondary" type="button" aria-pressed="true" onclick="showProblemAreas();" data-i18n="problemAreas">Problem areas</button>
						<button id="show-original" class="cta secondary" type="button" aria-pressed="false" onclick="showOriginalImage();" data-i18n="originalImage">Original</button>
						<button type="button" id="reset-image" class="cta ghost" onclick="resetPreviewImage();" data-i18n="clearHighlights">Remove markings</button>
					</div>
					<div class="field zoom-field">
						<span id="zoom-label" data-i18n="zoomLabel">Zoom</span>
						<div class="zoom-controls" role="group" aria-labelledby="zoom-label">
							<button id="zoom-out" class="icon-button" type="button" aria-label="Zoom out" data-i18n-aria-label="zoomOut" onclick="zoomPreview(-1);">−</button>
							<output id="zoom-output" for="image_preview" aria-live="polite">100%</output>
							<button id="zoom-in" class="icon-button" type="button" aria-label="Zoom in" data-i18n-aria-label="zoomIn" onclick="zoomPreview(1);">+</button>
							<button id="zoom-reset" class="icon-button text-icon-button" type="button" onclick="resetPreviewZoom();">1:1<span class="sr-only" data-i18n="resetZoom"> Reset zoom</span></button>
							<button id="hand-tool" class="icon-button text-icon-button hand-tool-button" type="button" aria-label="Drag image" data-i18n-aria-label="dragImage" aria-pressed="false" onclick="toggleHandTool(this);">
								<span data-i18n="dragImage">Drag image</span>
							</button>
						</div>
					</div>
				</div>

				<p id="preview-help" class="sr-only" data-i18n="previewHelp">Use the zoom controls to inspect the image. If the image is larger than the visible preview, use the pan buttons or scroll the preview.</p>
				<div class="preview-frame">
					<section id="preview-viewport" class="preview-viewport">
						<div id="preview-canvas-layer" class="preview-canvas-layer">
						<canvas id="image_preview" class="preview" tabindex="0" aria-label="Image preview" data-i18n-aria-label="imagePreview" aria-describedby="preview-help"></canvas>
						<canvas id="contrast_overlay" class="contrast-overlay" aria-hidden="true"></canvas>
					</div>
			</section>
						<div hidden id="pan-controls" class="pan-controls" role="group" aria-label="Pan image" data-i18n-aria-label="panControls">
						<button class="icon-button pan-up" type="button" aria-label="Pan up" data-i18n-aria-label="panUp" data-pan-direction="up" onclick="panPreview(0, -1);">↑</button>
						<button class="icon-button pan-left" type="button" aria-label="Pan left" data-i18n-aria-label="panLeft" data-pan-direction="left" onclick="panPreview(-1, 0);">←</button>
						<button class="icon-button pan-right" type="button" aria-label="Pan right" data-i18n-aria-label="panRight" data-pan-direction="right" onclick="panPreview(1, 0);">→</button>
						<button class="icon-button pan-down" type="button" aria-label="Pan down" data-i18n-aria-label="panDown" data-pan-direction="down" onclick="panPreview(0, 1);">↓</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	</section>

	<details hidden id="palette-card" class="palette-card">
		<summary data-i18n="paletteAdvancedTitle">Advanced: compare colors in the image</summary>
		<div class="palette-content">
		<div class="palette-header">
			<div>
				<h2 id="palette-title" data-i18n="paletteTitle">Main colors in this image</h2>
				<p data-i18n="paletteCopyUnique">Choose a swatch as the test color, or review the 15 unique pairs from lowest contrast to highest.</p>
			</div>
			<p id="palette-summary" class="palette-summary" aria-live="polite"></p>
		</div>
		<ul id="palette-swatches" class="palette-swatches"></ul>
		<div id="palette-matrix" class="palette-matrix"></div>
		</div>
	</details>
	</div>
		</div>

		<section hidden id="accessibility-statement" class="accessibility-page" aria-labelledby="accessibility-statement-title" tabindex="-1">
			<h2 id="accessibility-statement-title" data-i18n="accessibilityTitle">Accessibility statement</h2>
			<p class="accessibility-lede" data-i18n="accessibilityIntro">This statement explains the accessibility target for the Color contrast checker, what is covered, how the app is tested, and how to report an accessibility problem.</p>

			<section class="accessibility-section" aria-labelledby="accessibility-status-title">
				<h3 id="accessibility-status-title" data-i18n="accessibilityStatusTitle">Conformance status</h3>
				<p data-i18n="accessibilityStatusCopy">The aim is for the app itself to conform to WCAG 2.2 AAA where the criteria apply to this kind of tool. The interface is built to work with keyboard, screen reader, zoom, high contrast, light mode, dark mode, and system color preferences.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-scope-title">
				<h3 id="accessibility-scope-title" data-i18n="accessibilityScopeTitle">Scope</h3>
				<p data-i18n="accessibilityScopeCopy">This statement covers the public Color contrast checker web app at colorcontrast.forlaens.com: the upload view, checker view, language and theme controls, footer, and accessibility statement page. It does not cover user-uploaded images or browser and operating system controls outside the app.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-standard-title">
				<h3 id="accessibility-standard-title" data-i18n="accessibilityStandardTitle">Accessibility approach</h3>
				<p data-i18n="accessibilityStandardCopy">The app uses semantic HTML landmarks and headings, visible focus styles, labelled controls, status messages for important changes, translated interface text, and controls that can be operated without a mouse. Text and focus indicators are designed for strong contrast in both light and dark mode.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-measures-title">
				<h3 id="accessibility-measures-title" data-i18n="accessibilityMeasuresTitle">What the tool can and cannot do</h3>
				<p data-i18n="accessibilityMeasuresCopy">The checker helps review whether a chosen foreground color, such as text, icon, or UI color, remains readable or visible over an image. It highlights image areas that do not meet the selected contrast target. It does not automatically decide whether the image is meaningful, whether the chosen color is the right one, or whether the final design is accessible in every context.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-testing-title">
				<h3 id="accessibility-testing-title" data-i18n="accessibilityTestingTitle">Testing</h3>
				<p data-i18n="accessibilityTestingCopy">The build pipeline tests the rendered app with Siteimprove Alfa, axe-core, Nu Html Checker, and browser tests. The tests cover WCAG AAA and best-practice checks, valid HTML, keyboard flows, and focus behavior. The app is also manually tested with screen readers such as NVDA, JAWS, and VoiceOver, browser accessibility plugins, and keyboard-only use.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-feedback-title">
				<h3 id="accessibility-feedback-title" data-i18n="accessibilityFeedbackTitle">Feedback and contact</h3>
				<p>
					<span data-i18n="accessibilityFeedbackCopy">If you find an accessibility problem, have trouble using the app, or have a suggestion, email</span>
					<a href="mailto:tobias@forlaens.com">tobias@forlaens.com</a>.
				</p>
			</section>

			<p class="accessibility-updated" data-i18n="accessibilityUpdated">Last updated: May 7, 2026.</p>
			<a class="back-link" href="/"><span class="back-link-icon" aria-hidden="true">←</span><span data-i18n="accessibilityBack">Back to checker</span></a>
		</section>
	</main>

	<footer class="site-footer">
		<div class="footer-inner">
			<p class="footer-brand">
				<span data-i18n="footerCopyright">Copyright</span>
				<a href="https://forlaens.com/">Forlæns</a>
			</p>
			<div class="footer-meta">
				<p>
					<span data-i18n="footerContact">Contact, questions, or suggestions:</span>
					<a href="mailto:tobias@forlaens.com">tobias@forlaens.com</a>
				</p>
				<span class="footer-separator" aria-hidden="true">|</span>
				<a href="#accessibility-statement" data-i18n="accessibilityLink">Accessibility Statement</a>
			</div>
		</div>
	</footer>
</div>

<?php include($_SERVER['DOCUMENT_ROOT'] . '/include/layout/foot.php'); ?>
