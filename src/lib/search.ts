import type { ToolDefinition } from "./tool-registry"

const SYNONYMS: Record<string, string[]> = {
	shrink: ["compress", "reduce"],
	combine: ["merge", "concat"],
	join: ["merge", "concat"],
	record: ["recorder", "capture"],
	checklist: ["todo", "tasks"],
	photo: ["image", "picture"],
	sound: ["audio", "music"],
}

const FORMAT_ALIASES: Record<string, string> = {
	jpeg: "jpg",
	tif: "tiff",
	text: "txt",
	yml: "yaml",
}

function normalizeToken(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9.+-]/g, "")
}

function normalizeExtension(value: string) {
	const token = normalizeToken(value).replace(/^\./, "")
	return FORMAT_ALIASES[token] || token
}

function getExpandedTokens(query: string) {
	const rawTokens = query
		.toLowerCase()
		.split(/\s+/)
		.map(normalizeToken)
		.filter(Boolean)

	const expanded = new Set<string>(rawTokens)
	for (const token of rawTokens) {
		for (const synonym of SYNONYMS[token] || []) expanded.add(synonym)
	}
	return [...expanded]
}

function getConversionIntent(query: string) {
	const match = query
		.toLowerCase()
		.match(/\b([a-z0-9.+-]+)\s+to\s+([a-z0-9.+-]+)\b/)
	if (!match) return null
	return {
		source: normalizeExtension(match[1]),
		target: normalizeExtension(match[2]),
	}
}

function getToolTerms(tool: ToolDefinition) {
	return [
		tool.name,
		tool.id,
		tool.description,
		tool.category,
		...(tool.acceptedExtensions || []),
		...(tool.producedExtensions || []),
		...(tool.keywords || []),
	]
		.join(" ")
		.toLowerCase()
}

function scoreTool(tool: ToolDefinition, query: string) {
	const normalizedQuery = query.toLowerCase().trim()
	if (!normalizedQuery) return 0

	const terms = getToolTerms(tool)
	const expandedTokens = getExpandedTokens(normalizedQuery)
	let score = 0

	if (terms.includes(normalizedQuery)) score += 40
	if (tool.name.toLowerCase() === normalizedQuery) score += 150
	if (tool.id === normalizedQuery) score += 140
	if (tool.name.toLowerCase().includes(normalizedQuery)) score += 100
	if (tool.id.includes(normalizedQuery)) score += 85
	if (tool.description.toLowerCase().includes(normalizedQuery)) score += 55
	if (
		(tool.keywords || []).some((keyword) => keyword.includes(normalizedQuery))
	) {
		score += 70
	}

	for (const token of expandedTokens) {
		if (tool.name.toLowerCase().includes(token)) score += 18
		if (tool.id.includes(token)) score += 15
		if (tool.description.toLowerCase().includes(token)) score += 10
		if ((tool.keywords || []).some((keyword) => keyword.includes(token)))
			score += 14
		if (tool.category.includes(token)) score += 8
	}

	const conversion = getConversionIntent(normalizedQuery)
	if (conversion) {
		const accepted = tool.acceptedExtensions.map(normalizeExtension)
		const produced = (tool.producedExtensions || []).map(normalizeExtension)
		if (accepted.includes(conversion.source)) score += 45
		if (produced.includes(conversion.target)) score += 70
		if (
			tool.name.toLowerCase().includes("convert") &&
			accepted.includes(conversion.source) &&
			produced.includes(conversion.target)
		) {
			score += 160
		}
	}

	return score
}

export function rankToolsByQuery(tools: ToolDefinition[], query: string) {
	const trimmedQuery = query.trim()
	if (!trimmedQuery) return null

	return [...tools]
		.map((tool) => ({
			tool,
			score: scoreTool(tool, trimmedQuery),
		}))
		.filter((entry) => entry.score > 0)
		.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
		.map((entry) => entry.tool)
}
