import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './test',
	fullyParallel: false,
	retries: 0,
	reporter: 'line',
	use: {
		baseURL: 'http://127.0.0.1:4174',
		colorScheme: 'light',
		locale: 'en-US',
		reducedMotion: 'reduce',
		serviceWorkers: 'block'
	},
	projects: [
		{
			name: 'desktop',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 900 }
			}
		},
		{
			name: 'mobile',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 390, height: 844 },
				isMobile: false
			}
		},
		{
			name: 'intermediate-dark',
			grep: /dark (task chooser|two-color result|image result)$/,
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 768, height: 900 }
			}
		}
	],
	webServer: {
		command: 'npm run build && php -S 127.0.0.1:4174 -t dist',
		url: 'http://127.0.0.1:4174',
		reuseExistingServer: false,
		timeout: 30_000
	}
});
