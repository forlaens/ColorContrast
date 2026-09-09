import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const screenshotOptions = {
	animations: 'disabled',
	caret: 'hide',
	fullPage: true,
	maxDiffPixelRatio: 0.01,
	scale: 'css'
};

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		window.localStorage.setItem('colorcontrast-language', 'en');
		window.localStorage.setItem('colorcontrast-theme', 'light');
	});
});

test('task chooser', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await expect(page).toHaveScreenshot('task-chooser.png', screenshotOptions);
});

test('focused task choice takes priority over hover', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	const choice = page.locator('.tool-choice').first();
	await choice.focus();
	await choice.hover();
	await expect(page).toHaveScreenshot('task-chooser-focused-hover.png', screenshotOptions);
});

test('two-color result', async ({ page }) => {
	await page.goto('/#simple-contrast', { waitUntil: 'networkidle' });
	await expect(page.locator('#simple-contrast-result')).not.toBeEmpty();
	await expect(page).toHaveScreenshot('two-color-result.png', screenshotOptions);
});

test('two-color validation error', async ({ page }) => {
	await page.goto('/#simple-contrast', { waitUntil: 'networkidle' });
	await page.locator('#simple-foreground').fill('not-a-color');
	await expect(page.locator('#simple-foreground')).toHaveAttribute('aria-invalid', 'true');
	await expect(page.locator('#simple-foreground-error')).toBeVisible();
	await expect(page).toHaveScreenshot('two-color-error.png', screenshotOptions);
});

test('two-color failure result', async ({ page }) => {
	await page.goto('/#simple-contrast', { waitUntil: 'networkidle' });
	await page.locator('#simple-foreground').fill('#ffffff');
	await expect(page.locator('.simple-contrast-outcome[data-state="fail"]')).toHaveCount(3);
	await expect(page).toHaveScreenshot('two-color-fail.png', screenshotOptions);
});

test('empty image checker', async ({ page }) => {
	await page.goto('/#image-contrast', { waitUntil: 'networkidle' });
	await expect(page.locator('#step-1')).toBeVisible();
	await expect(page.locator('#step-2')).toBeHidden();
	await expect(page).toHaveScreenshot('image-empty.png', screenshotOptions);
});

test('accessibility statement', async ({ page }) => {
	await page.goto('/#accessibility-statement', { waitUntil: 'networkidle' });
	await expect(page.locator('#accessibility-statement')).toBeVisible();
	await expect(page).toHaveScreenshot('accessibility-statement.png', screenshotOptions);
});

test('active image color picker', async ({ page }) => {
	await page.goto('/#image-contrast', { waitUntil: 'networkidle' });
	await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
	await expect(page.locator('#step-2')).toBeVisible();
	await page.getByRole('button', { name: 'Pick a color from the image' }).click();
	await expect(page.locator('#picker-instruction')).toBeVisible();
	await expect(page).toHaveScreenshot('image-picker-active.png', screenshotOptions);
});

test('image result', async ({ page }) => {
	await page.goto('/#image-contrast', { waitUntil: 'networkidle' });
	await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
	await expect(page.locator('#step-2')).toBeVisible();
	await page.getByRole('button', { name: 'Find problem areas' }).click();
	await expect(page.locator('#image-contrast-view')).toHaveAttribute('data-state', 'result');
	await expect(page).toHaveScreenshot('image-result.png', screenshotOptions);
});

test('advanced image palette', async ({ page }) => {
	await page.goto('/#image-contrast', { waitUntil: 'networkidle' });
	await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
	await expect(page.locator('#step-2')).toBeVisible();
	await page.getByRole('button', { name: 'Find problem areas' }).click();
	await expect(page.locator('#image-contrast-view')).toHaveAttribute('data-state', 'result');
	await page.locator('#palette-card > summary').click();
	await expect(page.locator('.palette-content')).toBeVisible();
	await expect(page).toHaveScreenshot('image-palette-open.png', screenshotOptions);
});

test('dark task chooser', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.locator('#theme-toggle').click();
	await expect(page).toHaveScreenshot('task-chooser-dark.png', screenshotOptions);
});

test('dark two-color result', async ({ page }) => {
	await page.goto('/#simple-contrast', { waitUntil: 'networkidle' });
	await page.locator('#theme-toggle').click();
	await expect(page.locator('#simple-contrast-result')).not.toBeEmpty();
	await expect(page).toHaveScreenshot('two-color-result-dark.png', screenshotOptions);
});

test('dark image result', async ({ page }) => {
	await page.goto('/#image-contrast', { waitUntil: 'networkidle' });
	await page.locator('#theme-toggle').click();
	await page.locator('#image_file').setInputFiles(resolve('dist/img/social-card.png'));
	await expect(page.locator('#step-2')).toBeVisible();
	await page.getByRole('button', { name: 'Find problem areas' }).click();
	await expect(page.locator('#image-contrast-view')).toHaveAttribute('data-state', 'result');
	await expect(page).toHaveScreenshot('image-result-dark.png', screenshotOptions);
});
