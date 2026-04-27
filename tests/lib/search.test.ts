import { describe, expect, it } from "vitest"
import { getAllTools } from "../../src/lib/tool-registry"
import { rankToolsByQuery } from "../../src/lib/search"

describe("search ranking", () => {
	it("prioritizes direct format conversion intent", () => {
		const tools = rankToolsByQuery(getAllTools(), "jpg to png")
		expect(tools?.[0]?.id).toBe("image-convert")
	})

	it("expands common synonyms", () => {
		const tools = rankToolsByQuery(getAllTools(), "shrink pdf")
		expect(tools?.some((tool) => tool.id === "pdf-compress")).toBe(true)
	})

	it("finds recorder tools through capture phrasing", () => {
		const tools = rankToolsByQuery(getAllTools(), "screen capture")
		expect(tools?.[0]?.id).toBe("screen-recorder")
	})
})
