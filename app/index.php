<?php include($_SERVER['DOCUMENT_ROOT'] . '/include/layout/head.php'); ?>

<a class="skip-link" href="#main-content" onclick="markSkipLinkTarget();" data-i18n="skipLink">Skip to main content</a>

<div class="app-shell">
	<noscript>
		<div class="notice">For this tool to work, your browser must have JavaScript enabled.</div>
	</noscript>

	<div hidden id="app-error" class="error-panel" role="alert" tabindex="-1"></div>

	<header class="hero" aria-labelledby="app-title">
		<div>
			<h1 id="app-title">
				<a class="home-title-link" href="/" onclick="return showFrontView();" data-i18n="title">Image contrast checker</a>
			</h1>
			<p class="lede" data-i18n="lede">Choose a color from the image, run the test, then check whether that color would still be readable or visible on the highlighted areas.</p>
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
		<form id="step-1" class="step upload-panel" method="POST" enctype="multipart/form-data" aria-labelledby="upload-title" onsubmit="loadImagePreview(); return false;">
			<div class="upload-dropzone">
				<h2 id="upload-title" class="upload-title" data-i18n="chooseImage">Choose an image</h2>
				<span class="upload-copy" data-i18n="uploadCopy">PNG, JPG, GIF, or SVG. The file stays in your browser.</span>
				<span class="upload-file-row">
					<img hidden id="image-thumbnail" class="upload-thumbnail" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="">
					<input id="image_file" class="file-input-native" type="file" name="image" accept="image/*" aria-describedby="selected-file-name">
					<label for="image_file" class="file-picker-control">
						<span class="file-picker-button" data-i18n="chooseFile">Choose file</span>
						<span id="selected-file-name" class="selected-file-name" data-i18n-file-empty="noFileChosen">No file chosen</span>
					</label>
				</span>
			</div>
			<button class="cta" type="submit" data-i18n="loadImage">Load image</button>
		</form>

	<section id="intro-panel" class="intro-panel" aria-labelledby="intro-title">
		<div class="intro-header">
			<h2 id="intro-title" data-i18n="introTitle">How to use it</h2>
			<button id="intro-toggle" class="intro-toggle" type="button" aria-expanded="true" aria-controls="intro-steps" aria-labelledby="intro-title"></button>
		</div>
		<ol id="intro-steps" class="steps">
			<li>
				<h3 data-i18n="stepUploadTitle">Upload an image</h3>
				<span data-i18n="stepUploadCopy">Use a screenshot, design export, or content image.</span>
				<img class="step-illustration" src="/img/steps/step-1-upload.webp" width="807" height="715" alt="" fetchpriority="high" decoding="async">
			</li>
			<li>
				<h3 data-i18n="stepColorTitle">Choose the color to check</h3>
				<span data-i18n="stepColorCopy">Pick the text, icon, or background color people need to read or see.</span>
				<img class="step-illustration step-illustration-spaced" src="/img/steps/step-2-pick-color.webp" width="875" height="628" alt="" loading="lazy" decoding="async">
			</li>
			<li>
				<h3 data-i18n="stepRunTitle">Run the test</h3>
				<span data-i18n="stepRunCopy">The preview marks places where that color may disappear into the image. Ask: can I still read it or see what I am supposed to see?</span>
				<img class="step-illustration" src="/img/steps/step-3-result.webp" width="852" height="745" alt="" loading="lazy" decoding="async">
			</li>
		</ol>
	</section>

	<section hidden id="step-2" class="step checker-stage" aria-labelledby="checker-title">
		<div class="stage-header">
			<div>
				<h2 id="checker-title" data-i18n="checkerTitle">Highlight contrast issues</h2>
				<p class="stage-copy" data-i18n="checkerCopy">Highlighted pixels are places where the chosen color may be hard to read or see against the image.</p>
			</div>
			<div class="stage-actions">
				<button hidden type="button" id="reset-image" class="cta ghost" onclick="resetPreviewImage();" data-i18n="resetImage">Reset image</button>
			</div>
		</div>

		<div hidden role="status" class="loading" aria-atomic="true"></div>
		<p id="checker-result" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>

		<div class="checker-scroll">
			<section id="preview_area" class="checker" aria-label="Contrast checker" data-i18n-aria-label="checkerRegion">
				<div role="toolbar" aria-label="Checker settings" data-i18n-aria-label="settingsToolbar">
					<div class="toolbar-group">
						<div class="field color-field">
							<span id="testcolor-label" data-i18n="colorLabel">Color to check</span>
							<span class="control-row">
								<input type="color" name="color" aria-labelledby="testcolor-label">
								<button id="colorpicker" class="icon-button" type="button" aria-label="Pick a color from the image" data-i18n-aria-label="pickColor" aria-pressed="false" onclick="toggleColorPicker(this);">
									<svg role="presentation" focusable="false" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
										<path d="M27.7,3.3c-1.5-1.5-3.9-1.5-5.4,0L17,8.6l-1.3-1.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l1.3,1.3L5,20.6  c-0.6,0.6-1,1.4-1.1,2.3C3.3,23.4,3,24.2,3,25c0,1.7,1.3,3,3,3c0.8,0,1.6-0.3,2.2-0.9C9,27,9.8,26.6,10.4,26L21,15.4l1.3,1.3  c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L22.4,14l5.3-5.3C29.2,7.2,29.2,4.8,27.7,3.3z M9,24.6  c-0.4,0.4-0.8,0.6-1.3,0.5c-0.4,0-0.7,0.2-0.9,0.5C6.7,25.8,6.3,26,6,26c-0.6,0-1-0.4-1-1c0-0.3,0.2-0.7,0.5-0.8  c0.3-0.2,0.5-0.5,0.5-0.9c0-0.5,0.2-1,0.5-1.3L17,11.4l2.6,2.6L9,24.6z" />
									</svg>
								</button>
							</span>
						</div>

						<label class="field">
							<span id="contrast-label" data-i18n="contrastLabel">Conformance level</span>
							<select name="contrast" aria-labelledby="contrast-label">
								<optgroup label="WCAG level AA" data-i18n-label="wcagAA">
									<option value="3" data-i18n="nonText">Graphics (3:1)</option>
									<option value="3" data-i18n="largeTextAA">Large text (3:1)</option>
									<option value="4.5" selected data-i18n="smallTextAA">Small text (4.5:1)</option>
								</optgroup>
								<optgroup label="WCAG level AAA" data-i18n-label="wcagAAA">
									<option value="4.5" data-i18n="largeTextAAA">Large text (4.5:1)</option>
									<option value="7" data-i18n="smallTextAAA">Small text (7:1)</option>
								</optgroup>
							</select>
						</label>
					</div>

					<div class="view-controls">
						<div class="field zoom-field">
							<span id="zoom-label" data-i18n="zoomLabel">Zoom</span>
							<div class="zoom-controls" role="group" aria-labelledby="zoom-label">
								<button id="zoom-out" class="icon-button" type="button" aria-label="Zoom out" data-i18n-aria-label="zoomOut" onclick="zoomPreview(-1);">−</button>
								<output id="zoom-output" for="image_preview" aria-live="polite">100%</output>
								<button id="zoom-in" class="icon-button" type="button" aria-label="Zoom in" data-i18n-aria-label="zoomIn" onclick="zoomPreview(1);">+</button>
								<button id="zoom-reset" class="icon-button text-icon-button" type="button" aria-label="Reset zoom to 1:1" data-i18n-aria-label="resetZoom" onclick="resetPreviewZoom();">1:1</button>
							</div>
						</div>
						<div hidden id="pan-controls" class="pan-controls" role="group" aria-label="Pan image" data-i18n-aria-label="panControls">
							<button class="icon-button" type="button" aria-label="Pan left" data-i18n-aria-label="panLeft" onclick="panPreview(-1, 0);">←</button>
							<button class="icon-button" type="button" aria-label="Pan up" data-i18n-aria-label="panUp" onclick="panPreview(0, -1);">↑</button>
							<button class="icon-button" type="button" aria-label="Pan down" data-i18n-aria-label="panDown" onclick="panPreview(0, 1);">↓</button>
							<button class="icon-button" type="button" aria-label="Pan right" data-i18n-aria-label="panRight" onclick="panPreview(1, 0);">→</button>
						</div>
						<button class="cta" type="button" onclick="initRenderContrast();" data-i18n="runTest">Run test</button>
					</div>
				</div>

				<p id="preview-help" class="sr-only" data-i18n="previewHelp">Use the zoom controls to inspect the image. If the image is larger than the visible preview, use the pan buttons or scroll the preview. Focus the image preview and use arrow keys to move the color picker.</p>
				<section id="preview-viewport" class="preview-viewport" tabindex="0" aria-label="Zoomable image preview" data-i18n-aria-label="previewViewport" aria-describedby="preview-help">
					<div id="preview-canvas-layer" class="preview-canvas-layer">
						<canvas id="image_preview" class="preview" tabindex="0" aria-label="Image preview" data-i18n-aria-label="imagePreview" aria-describedby="preview-help" onmousedown="setTestColorFromCanvas(event, this);" onfocus="placeCrosshairs(this);" onkeydown="canvasKeyDown(this, event);" onkeyup="canvasKeyUp(event);" onblur="canvasBlur();"></canvas>

						<div id="crosshairs">
					<svg aria-hidden="true" focusable="false" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1792 1792" xml:space="preserve">
						<g>
							<path class="white" d="M833.1,1691.6c-24.7,0-47.2-9.4-65-27.3c-17.9-17.9-27.3-40.4-27.3-65v-120.8
								c-103-27.6-193.8-80.2-270.2-156.6c-76.4-76.4-129-167.2-156.6-270.2H193.1c-24.7,0-47.2-9.4-65-27.3c-17.9-17.9-27.3-40.4-27.3-65
								v-128c0-24.7,9.4-47.2,27.3-65c17.9-17.9,40.4-27.3,65-27.3h120.8c27.6-103,80.2-193.8,156.6-270.2
								c76.4-76.4,167.2-129,270.2-156.6V191.3c0-24.7,9.4-47.2,27.3-65c17.9-17.9,40.4-27.3,65-27.3h128c24.7,0,47.2,9.4,65,27.3
								c17.9,17.9,27.3,40.4,27.3,65v120.8c103,27.6,193.8,80.2,270.2,156.6c76.4,76.4,129,167.2,156.6,270.2h120.8
								c24.7,0,47.2,9.4,65,27.3c17.9,17.9,27.3,40.4,27.3,65v128c0,24.7-9.4,47.2-27.3,65c-17.9,17.9-40.4,27.3-65,27.3h-120.8
								c-27.6,103-80.2,193.8-156.6,270.2c-76.4,76.4-167.2,129-270.2,156.6v120.8c0,24.7-9.4,47.2-27.3,65c-17.9,17.9-40.4,27.3-65,27.3
								H833.1z M961.1,1122.9c24.7,0,47.2,9.4,65,27.3c17.9,17.9,27.3,40.4,27.3,65v69.2c52.3-20.9,99.3-52,140.1-92.8
								c40.8-40.8,71.9-87.8,92.8-140.1h-69.2c-24.7,0-47.2-9.4-65-27.3c-17.9-17.9-27.3-40.4-27.3-65v-128c0-24.7,9.4-47.2,27.3-65
								c17.9-17.9,40.4-27.3,65-27.3h69.2c-20.9-52.3-52-99.3-92.8-140.1c-40.8-40.8-87.8-71.9-140.1-92.8v69.2c0,24.7-9.4,47.2-27.3,65
								c-17.9,17.9-40.4,27.3-65,27.3h-128c-24.7,0-47.2-9.4-65-27.3c-17.9-17.9-27.3-40.4-27.3-65v-69.2c-52.3,20.9-99.3,52-140.1,92.8
								c-40.8,40.8-71.9,87.8-92.8,140.1h69.2c24.7,0,47.2,9.4,65,27.3c17.9,17.9,27.3,40.4,27.3,65v128c0,24.7-9.4,47.2-27.3,65
								c-17.9,17.9-40.4,27.3-65,27.3h-69.2c20.9,52.3,52,99.3,92.8,140.1c40.8,40.8,87.8,71.9,140.1,92.8v-69.2c0-24.7,9.4-47.2,27.3-65
								c17.9-17.9,40.4-27.3,65-27.3H961.1z"/>
						</g>
						<g>
							<path d="M1325,1024h-109c-17.3,0-32.3-6.3-45-19s-19-27.7-19-45V832c0-17.3,6.3-32.3,19-45s27.7-19,45-19h109
								c-21.3-72-58.8-134.8-112.5-188.5S1096,488.3,1024,467v109c0,17.3-6.3,32.3-19,45s-27.7,19-45,19H832c-17.3,0-32.3-6.3-45-19
								s-19-27.7-19-45V467c-72,21.3-134.8,58.8-188.5,112.5S488.3,696,467,768h109c17.3,0,32.3,6.3,45,19s19,27.7,19,45v128
								c0,17.3-6.3,32.3-19,45s-27.7,19-45,19H467c21.3,72,58.8,134.8,112.5,188.5S696,1303.7,768,1325v-109c0-17.3,6.3-32.3,19-45
								s27.7-19,45-19h128c17.3,0,32.3,6.3,45,19s19,27.7,19,45v109c72-21.3,134.8-58.8,188.5-112.5S1303.7,1096,1325,1024z M1664,832v128
								c0,17.3-6.3,32.3-19,45s-27.7,19-45,19h-143c-24.7,107.3-76.2,200.2-154.5,278.5S1131.3,1432.3,1024,1457v143
								c0,17.3-6.3,32.3-19,45s-27.7,19-45,19H832c-17.3,0-32.3-6.3-45-19s-19-27.7-19-45v-143c-107.3-24.7-200.2-76.2-278.5-154.5
								S359.7,1131.3,335,1024H192c-17.3,0-32.3-6.3-45-19s-19-27.7-19-45V832c0-17.3,6.3-32.3,19-45s27.7-19,45-19h143
								c24.7-107.3,76.2-200.2,154.5-278.5S660.7,359.7,768,335V192c0-17.3,6.3-32.3,19-45s27.7-19,45-19h128c17.3,0,32.3,6.3,45,19
								s19,27.7,19,45v143c107.3,24.7,200.2,76.2,278.5,154.5S1432.3,660.7,1457,768h143c17.3,0,32.3,6.3,45,19S1664,814.7,1664,832z"/>
						</g>
							</svg>
						</div>
					</div>
				</section>
			</section>
		</div>
	</section>
		</div>

		<section hidden id="accessibility-statement" class="accessibility-page" aria-labelledby="accessibility-statement-title" tabindex="-1">
			<h2 id="accessibility-statement-title" data-i18n="accessibilityTitle">Accessibility statement</h2>
			<p class="accessibility-lede" data-i18n="accessibilityIntro">This statement explains the accessibility target for the Image contrast checker, what is covered, how the app is tested, and how to report an accessibility problem.</p>

			<section class="accessibility-section" aria-labelledby="accessibility-status-title">
				<h3 id="accessibility-status-title" data-i18n="accessibilityStatusTitle">Conformance status</h3>
				<p data-i18n="accessibilityStatusCopy">The aim is for the app itself to conform to WCAG 2.2 AAA where the criteria apply to this kind of tool. The interface is built to work with keyboard, screen reader, zoom, high contrast, light mode, dark mode, and system color preferences.</p>
			</section>

			<section class="accessibility-section" aria-labelledby="accessibility-scope-title">
				<h3 id="accessibility-scope-title" data-i18n="accessibilityScopeTitle">Scope</h3>
				<p data-i18n="accessibilityScopeCopy">This statement covers the public Image contrast checker web app at colorcontrast.2biaz.dk: the upload view, checker view, language and theme controls, footer, and accessibility statement page. It does not cover user-uploaded images or browser and operating system controls outside the app.</p>
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
			<a class="back-link" href="/" data-i18n="accessibilityBack">Back to checker</a>
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
