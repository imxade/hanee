export interface TodoItem {
	id: string
	text: string
	completed: boolean
	createdAt: string
}

export const TODO_STORAGE_KEY = "kitsy.todo-list.v1"

export function createTodoItem(
	text: string,
	id = crypto.randomUUID(),
): TodoItem {
	return {
		id,
		text: text.trim(),
		completed: false,
		createdAt: new Date().toISOString(),
	}
}

export function parseTodoItems(raw: string): TodoItem[] {
	const parsed = JSON.parse(raw)
	if (!Array.isArray(parsed))
		throw new Error("Expected a JSON array of todo items.")

	return parsed
		.map((entry) => {
			if (
				typeof entry !== "object" ||
				entry === null ||
				typeof entry.id !== "string" ||
				typeof entry.text !== "string"
			) {
				throw new Error("Invalid todo item in imported file.")
			}

			return {
				id: entry.id,
				text: entry.text.trim(),
				completed: Boolean(entry.completed),
				createdAt:
					typeof entry.createdAt === "string"
						? entry.createdAt
						: new Date().toISOString(),
			} satisfies TodoItem
		})
		.filter((entry) => entry.text.length > 0)
}

export function mergeTodoItems(existing: TodoItem[], incoming: TodoItem[]) {
	const merged = [...existing]
	const seen = new Set(existing.map((item) => item.id))

	for (const item of incoming) {
		if (seen.has(item.id)) continue
		seen.add(item.id)
		merged.push(item)
	}

	return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function serializeTodoItems(items: TodoItem[]) {
	return JSON.stringify(items, null, "\t")
}
