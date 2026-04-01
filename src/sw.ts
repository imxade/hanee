import type { PrecacheEntry } from "serwist"
import { Serwist } from "serwist"

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: (PrecacheEntry | string)[]
}

const serwist = new Serwist({
	precacheEntries: self.__WB_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: false,
})

serwist.addEventListeners()
