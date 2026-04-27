// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import TodoListPanel from "../../src/components/TodoListPanel"
import { TODO_STORAGE_KEY } from "../../src/lib/todo-list"

describe("TodoListPanel", () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	afterEach(() => {
		cleanup()
	})

	it("loads from localStorage and appends imported tasks", async () => {
		window.localStorage.setItem(
			TODO_STORAGE_KEY,
			JSON.stringify([
				{
					id: "stored",
					text: "Stored task",
					completed: false,
					createdAt: "2026-04-27T00:00:00.000Z",
				},
			]),
		)

		render(<TodoListPanel />)
		expect(await screen.findByText("Stored task")).toBeTruthy()

		fireEvent.change(screen.getByTestId("todo-input"), {
			target: { value: "Fresh task" },
		})
		fireEvent.click(screen.getByTestId("todo-add"))
		expect(await screen.findByText("Fresh task")).toBeTruthy()

		const importFile = new File(
			[
				JSON.stringify([
					{
						id: "imported",
						text: "Imported task",
						completed: false,
						createdAt: "2026-04-27T01:00:00.000Z",
					},
				]),
			],
			"todos.json",
			{ type: "application/json" },
		)

		fireEvent.change(screen.getByTestId("todo-import"), {
			target: { files: [importFile] },
		})

		expect(await screen.findByText("Imported task")).toBeTruthy()
		await waitFor(() => {
			expect(window.localStorage.getItem(TODO_STORAGE_KEY)).toContain("Imported task")
		})
	})

	it("exports the current list as a JSON download", async () => {
		const appendChildSpy = vi.spyOn(document.body, "appendChild")
		const removeChildSpy = vi.spyOn(document.body, "removeChild")
		const clickSpy = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => undefined)
		const createObjectUrlSpy = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:todo-export")
		const revokeObjectUrlSpy = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => undefined)

		render(<TodoListPanel />)
		fireEvent.change(screen.getByTestId("todo-input"), {
			target: { value: "Export me" },
		})
		fireEvent.click(screen.getByTestId("todo-add"))
		fireEvent.click(screen.getByTestId("todo-export"))

		expect(createObjectUrlSpy).toHaveBeenCalled()
		expect(appendChildSpy).toHaveBeenCalled()
		expect(removeChildSpy).toHaveBeenCalled()

		appendChildSpy.mockRestore()
		removeChildSpy.mockRestore()
		clickSpy.mockRestore()
		createObjectUrlSpy.mockRestore()
		revokeObjectUrlSpy.mockRestore()
	})
})
