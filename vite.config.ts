/// <reference types="vitest/config" />
import { defineConfig, type ViteDevServer, type PreviewServer } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import { serwist } from "@serwist/vite"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

let ffmpegCoreVersion = "unknown"
try {
	const pkg = JSON.parse(
		readFileSync(resolve("node_modules/@ffmpeg/core/package.json"), "utf8"),
	)
	ffmpegCoreVersion = pkg.version
} catch (_e) {
	console.warn("Failed to read @ffmpeg/core version")
}

function coopCoepMiddleware() {
	return {
		name: "coop-coep-middleware",

		configureServer(server: ViteDevServer) {
			server.middlewares.use((_req, res, next) => {
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
				res.setHeader("Cross-Origin-Resource-Policy", "same-origin")
				next()
			})
		},

		configurePreviewServer(server: PreviewServer) {
			server.middlewares.use((_req, res, next) => {
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
				res.setHeader("Cross-Origin-Resource-Policy", "same-origin")
				next()
			})
		},
	}
}

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},

	server: {
		host: true,
		port: 3000,
	},

	preview: {
		host: true,
		port: 3000,
	},

	plugins: [
		devtools(),
		coopCoepMiddleware(),

		nitro({
			publicAssets: [
				{
					baseURL: "/",
					dir: "dist",
					maxAge: 0,
				},
			],
			rollupConfig: { external: [/^@sentry\//] },
			routeRules: {
				"/**": {
					headers: {
						"Cross-Origin-Opener-Policy": "same-origin",
						"Cross-Origin-Embedder-Policy": "require-corp",
						"Cross-Origin-Resource-Policy": "same-origin",
					},
				},
			},
		}),

		tailwindcss(),
		tanstackStart({
			router: {
				autoCodeSplitting: false,
			},
		}),
		viteReact({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),

		serwist({
			swSrc: "src/sw.ts",
			swDest: "sw.js",
			globPatterns: ["**/*"],
			globDirectory: ".output/public",
			additionalPrecacheEntries: [
				{ url: "/", revision: String(Date.now()) },
				{
					url: "/ffmpeg/ffmpeg-core.js",
					revision: `core-${ffmpegCoreVersion}`,
				},
				{
					url: "/ffmpeg/ffmpeg-core.wasm",
					revision: `core-${ffmpegCoreVersion}`,
				},
			],
			injectionPoint: "self.__WB_MANIFEST",
			rollupFormat: "iife",
			devOptions: {
				enabled: true,
			},
			maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
		}),
	],

	test: {
		exclude: ["tests/e2e/**", "node_modules/**"],
	},
})
