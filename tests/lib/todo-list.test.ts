import { describe, expect, it } from "vitest"
import {
	mergeTodoItems,
	parseTodoItems,
	serializeTodoItems,
	type TodoItem,
} from "../../src/lib/todo-list"

describe("todo list helpers", () => {
	it("parses saved todo items", () => {
		const items = parseTodoItems(
			JSON.stringify([
				{
					id: "a",
					text: "Ship feature",
					completed: false,
					createdAt: "2026-04-27T00:00:00.000Z",
				},
			]),
		)
		expect(items[0]?.text).toBe("Ship feature")
	})

	it("appends imported items without overwriting existing entries", () => {
		const existing: TodoItem[] = [
			{
				id: "a",
				text: "Existing",
				completed: false,
				createdAt: "2026-04-27T00:00:00.000Z",
			},
		]
		const incoming: TodoItem[] = [
			{
				id: "a",
				text: "Duplicate",
				completed: true,
				createdAt: "2026-04-27T00:00:00.000Z",
			},
			{
				id: "b",
				text: "Imported",
				completed: false,
				createdAt: "2026-04-27T01:00:00.000Z",
			},
		]

		expect(mergeTodoItems(existing, incoming)).toEqual([
			existing[0],
			incoming[1],
		])
	})

	it("serializes items with stable formatting", () => {
		const serialized = serializeTodoItems([
			{
				id: "a",
				text: "Task",
				completed: false,
				createdAt: "2026-04-27T00:00:00.000Z",
			},
		])
		expect(serialized).toContain("\n")
		expect(parseTodoItems(serialized)[0]?.id).toBe("a")
	})
})
