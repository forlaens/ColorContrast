<?php include($_SERVER['DOCUMENT_ROOT'] . '/include/layout/head.php'); ?>

<a class="skip-link" href="#main-content" data-i18n="skipLink">Skip to main content</a>

<main id="main-content" class="app-shell" tabindex="-1">
	<noscript>
		<div class="notice">For this tool to work, your browser must have JavaScript enabled.</div>
	</noscript>

	<div hidden id="app-error" class="error-panel" role="alert" tabindex="-1"></div>

	<section class="hero" aria-labelledby="app-title">
		<div>
			<h1 id="app-title" data-i18n="title">Image contrast checker</h1>
			<p class="lede" data-i18n="lede">Check whether text or UI colors have enough contrast when placed on top of an image.</p>
		</div>
		<label class="language-switcher">
			<span data-i18n="languageLabel">Language</span>
			<select id="language-switcher" name="language" autocomplete="off"></select>
		</label>
	</section>

	<form id="step-1" class="step upload-panel" action="" method="POST" enctype="multipart/form-data" onsubmit="loadImagePreview(); return false;">
		<label class="upload-dropzone">
			<span class="upload-title" data-i18n="chooseImage">Choose an image</span>
			<span class="upload-copy" data-i18n="uploadCopy">PNG, JPG, GIF, or SVG. The file stays in your browser.</span>
			<input id="image_file" type="file" name="image" accept="image/*">
		</label>
		<input class="cta" type="submit" value="Load image" data-i18n-value="loadImage">
	</form>

	<section class="intro-panel" aria-labelledby="intro-title">
		<h2 id="intro-title" data-i18n="introTitle">How to use it</h2>
		<ol class="steps">
			<li>
				<strong data-i18n="stepUploadTitle">Upload an image</strong>
				<span data-i18n="stepUploadCopy">Use a screenshot, design export, or content image.</span>
				<img class="step-illustration" src="/img/steps/step-1-upload.png" width="807" height="715" alt="" loading="lazy" decoding="async">
			</li>
			<li>
				<strong data-i18n="stepColorTitle">Pick the foreground color</strong>
				<span data-i18n="stepColorCopy">Choose the text or UI color you want to test.</span>
				<img class="step-illustration" src="/img/steps/step-2-pick-color.png" width="875" height="628" alt="" loading="lazy" decoding="async">
			</li>
			<li>
				<strong data-i18n="stepRunTitle">Run the test</strong>
				<span data-i18n="stepRunCopy">The preview highlights image areas that do not meet the selected contrast target.</span>
				<img class="step-illustration" src="/img/steps/step-3-result.png" width="852" height="745" alt="" loading="lazy" decoding="async">
			</li>
		</ol>
	</section>

	<section hidden id="step-2" class="step checker-stage" aria-labelledby="checker-title">
		<div class="stage-header">
			<div>
				<h2 id="checker-title" data-i18n="checkerTitle">Highlight contrast issues</h2>
				<p class="stage-copy" data-i18n="checkerCopy">Highlighted pixels are places where the chosen color does not meet the selected WCAG ratio.</p>
			</div>
			<div class="stage-actions">
				<input type="button" class="cta secondary" onclick="resetFileInput(); showStep(1);" value="New image" data-i18n-value="newImage">
				<input hidden type="button" id="reset-image" class="cta ghost" onclick="updatePreviewCanvas();" value="Reset image" data-i18n-value="resetImage">
			</div>
		</div>

		<div hidden role="status" class="loading" aria-atomic="true"></div>

		<div class="checker-scroll">
			<section id="preview_area" class="checker" aria-label="Contrast checker">
				<div role="toolbar" aria-label="Settings">
					<div class="toolbar-group">
						<label class="field color-field">
							<span id="testcolor-label" data-i18n="colorLabel">Color to test</span>
							<span class="control-row">
								<input type="color" name="color" aria-labelledby="testcolor-label">
								<button id="colorpicker" class="icon-button" type="button" aria-label="Pick a color from the image" data-i18n-aria-label="pickColor" aria-pressed="false" onclick="toggleColorPicker(this);">
									<svg role="presentation" focusable="false" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
										<path d="M27.7,3.3c-1.5-1.5-3.9-1.5-5.4,0L17,8.6l-1.3-1.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l1.3,1.3L5,20.6  c-0.6,0.6-1,1.4-1.1,2.3C3.3,23.4,3,24.2,3,25c0,1.7,1.3,3,3,3c0.8,0,1.6-0.3,2.2-0.9C9,27,9.8,26.6,10.4,26L21,15.4l1.3,1.3  c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L22.4,14l5.3-5.3C29.2,7.2,29.2,4.8,27.7,3.3z M9,24.6  c-0.4,0.4-0.8,0.6-1.3,0.5c-0.4,0-0.7,0.2-0.9,0.5C6.7,25.8,6.3,26,6,26c-0.6,0-1-0.4-1-1c0-0.3,0.2-0.7,0.5-0.8  c0.3-0.2,0.5-0.5,0.5-0.9c0-0.5,0.2-1,0.5-1.3L17,11.4l2.6,2.6L9,24.6z" />
									</svg>
								</button>
							</span>
						</label>

						<label class="field">
							<span id="contrast-label" data-i18n="contrastLabel">Conformance level</span>
							<select name="contrast" aria-labelledby="contrast-label">
								<optgroup label="WCAG level AA" data-i18n-label="wcagAA">
									<option value="3" data-i18n="nonText">Non-text (3:1)</option>
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

					<button class="cta" type="button" onclick="initRenderContrast();" data-i18n="runTest">Run test</button>
				</div>

				<canvas id="image_preview" class="preview" tabindex="0" aria-label="Image preview" data-i18n-aria-label="imagePreview" onmousedown="setTestColorFromCanvas(event, this);" onfocus="placeCrosshairs(this);" onkeydown="canvasKeyDown(this, event);" onkeyup="canvasKeyUp(event);" onblur="canvasBlur();"></canvas>

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
			</section>
		</div>
	</section>
</main>

<?php include($_SERVER['DOCUMENT_ROOT'] . '/include/layout/foot.php'); ?>
