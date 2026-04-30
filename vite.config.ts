/// <reference types="vitest/config" />

import { defineConfig, type ViteDevServer, type PreviewServer } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import { serwist } from "@serwist/vite"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const entry = fileURLToPath(import.meta.resolve("@ffmpeg/core"))
const pkgPath = join(dirname(entry), "..", "..", "package.json")
const ffmpegPkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
const ffmpegCoreVersion = ffmpegPkg.version
const crossOriginOpenerPolicy = "same-origin-allow-popups"

function coopCoepDevOnly() {
	return {
		name: "coop-coep-dev",
		configureServer(server: ViteDevServer) {
			server.middlewares.use((_req, res, next) => {
				res.setHeader("Cross-Origin-Opener-Policy", crossOriginOpenerPolicy)
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
				res.setHeader("Cross-Origin-Resource-Policy", "same-origin")
				next()
			})
		},
		configurePreviewServer(server: PreviewServer) {
			server.middlewares.use((_req, res, next) => {
				res.setHeader("Cross-Origin-Opener-Policy", crossOriginOpenerPolicy)
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
				res.setHeader("Cross-Origin-Resource-Policy", "same-origin")
				next()
			})
		},
	}
}

export default defineConfig({
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
		coopCoepDevOnly(),
		tanstackStart({
			// router: {
			// 	autoCodeSplitting: false,
			// },
		}),
		react({
			reactCompiler: true,
		}),
		tailwindcss(),
		nitro({
			publicAssets: [
				{
					baseURL: "/",
					dir: "dist",
					maxAge: 0,
				},
			],
			externals: {
				external: ["@sentry/*"],
			},
			routeRules: {
				"/**": {
					headers: {
						"Cross-Origin-Opener-Policy": crossOriginOpenerPolicy,
						"Cross-Origin-Embedder-Policy": "require-corp",
						"Cross-Origin-Resource-Policy": "same-origin",
					},
				},
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
			maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
		}),
	],

	test: {
		exclude: ["tests/e2e/**", "node_modules/**"],
	},
})
