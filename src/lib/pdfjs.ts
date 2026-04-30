import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url"

// ensure worker is only configured in browser
if (typeof window !== "undefined") {
	pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
}

// export directly (no promise, no lazy loader)
export async function getPdfjsLib() {
	return pdfjsLib
}
