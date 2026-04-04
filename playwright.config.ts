import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: false,
	retries: 1,
	workers: 1,
	reporter: [["html"], ["list"]],
	use: {
		baseURL: "http://localhost:3000",
		colorScheme: "dark",
		viewport: { width: 1280, height: 720 },
		video: "on",
		actionTimeout: 15_000,
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1280, height: 720 },
				launchOptions: { args: ["--disable-web-security"] },
			},
		},
	],
	webServer: {
		command: "npm run build && npm run preview",
		port: 3000,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
})
