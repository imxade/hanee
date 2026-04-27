import { useEffect, useMemo, useRef, useState } from "react"
import {
	TODO_STORAGE_KEY,
	createTodoItem,
	mergeTodoItems,
	parseTodoItems,
	serializeTodoItems,
	type TodoItem,
} from "../lib/todo-list"
import Icon from "./Icon"

type FilterMode = "all" | "open" | "done"

export default function TodoListPanel() {
	const [isClientReady, setIsClientReady] = useState(false)
	const [items, setItems] = useState<TodoItem[]>([])
	const [draft, setDraft] = useState("")
	const [filter, setFilter] = useState<FilterMode>("all")
	const [status, setStatus] = useState<string | null>(null)
	const hasLoadedRef = useRef(false)
	const importInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setIsClientReady(true)
	}, [])

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(TODO_STORAGE_KEY)
			if (saved) setItems(parseTodoItems(saved))
		} catch (error) {
			setStatus(
				error instanceof Error
					? error.message
					: "Failed to load saved todo items.",
			)
		} finally {
			hasLoadedRef.current = true
		}
	}, [])

	useEffect(() => {
		if (!hasLoadedRef.current) return
		window.localStorage.setItem(TODO_STORAGE_KEY, serializeTodoItems(items))
	}, [items])

	const filteredItems = useMemo(() => {
		if (filter === "open") return items.filter((item) => !item.completed)
		if (filter === "done") return items.filter((item) => item.completed)
		return items
	}, [filter, items])

	const addItem = () => {
		const trimmed = draft.trim()
		if (!trimmed) return
		setItems((prev) => [...prev, createTodoItem(trimmed)])
		setDraft("")
		setStatus(null)
	}

	const exportItems = () => {
		const blob = new Blob([serializeTodoItems(items)], {
			type: "application/json",
		})
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement("a")
		anchor.href = url
		anchor.download = "kitsy-todo-list.json"
		document.body.appendChild(anchor)
		anchor.click()
		document.body.removeChild(anchor)
		window.setTimeout(() => URL.revokeObjectURL(url), 1000)
		setStatus(
			`Exported ${items.length} todo item${items.length === 1 ? "" : "s"}.`,
		)
	}

	const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const imported = parseTodoItems(await file.text())
			setItems((prev) => mergeTodoItems(prev, imported))
			setStatus(
				`Imported ${imported.length} item${imported.length === 1 ? "" : "s"} and appended them to local storage.`,
			)
		} catch (error) {
			setStatus(
				error instanceof Error ? error.message : "Failed to import todo list.",
			)
		} finally {
			event.target.value = ""
		}
	}

	return (
		<div className="card bg-base-100 border border-base-content/10">
			<div className="card-body gap-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="text-lg font-semibold">Browser-local checklist</h3>
						<p className="text-sm text-base-content/60">
							Items are saved in `localStorage`, exports are JSON, and imports
							append instead of replacing.
						</p>
					</div>
					<div className="stats stats-horizontal shadow-sm border border-base-content/10 bg-base-200/40">
						<div className="stat px-4 py-3">
							<div className="stat-title">Open</div>
							<div className="stat-value text-xl">
								{items.filter((item) => !item.completed).length}
							</div>
						</div>
						<div className="stat px-4 py-3">
							<div className="stat-title">Done</div>
							<div className="stat-value text-xl">
								{items.filter((item) => item.completed).length}
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<label className="input input-bordered flex items-center gap-2 flex-1">
						<Icon name="check" size={16} className="opacity-50" />
						<input
							type="text"
							className="grow"
							placeholder="Add a task"
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") addItem()
							}}
							data-testid="todo-input"
						/>
					</label>
					<button
						type="button"
						className="btn btn-primary"
						onClick={addItem}
						data-testid="todo-add"
					>
						Add Task
					</button>
				</div>

				<div className="flex flex-wrap gap-2">
					{(["all", "open", "done"] as const).map((value) => (
						<button
							key={value}
							type="button"
							className={`btn btn-sm ${filter === value ? "btn-primary" : "btn-ghost"}`}
							onClick={() => setFilter(value)}
						>
							{value === "all" ? "All" : value === "open" ? "Open" : "Done"}
						</button>
					))}
					<div className="flex-1" />
					<button
						type="button"
						className="btn btn-sm btn-outline"
						onClick={() => importInputRef.current?.click()}
					>
						Import JSON
					</button>
					<button
						type="button"
						className="btn btn-sm btn-outline"
						onClick={exportItems}
						data-testid="todo-export"
					>
						Download JSON
					</button>
					<button
						type="button"
						className="btn btn-sm btn-ghost"
						onClick={() =>
							setItems((prev) => prev.filter((item) => !item.completed))
						}
					>
						Clear Completed
					</button>
				</div>

				<input
					ref={importInputRef}
					type="file"
					accept=".json,application/json"
					className="hidden"
					onChange={handleImport}
					data-testid="todo-import"
				/>
				{isClientReady && (
					<span className="hidden" data-testid="todo-mounted">
						ready
					</span>
				)}

				{status && (
					<div className="alert alert-info">
						<span>{status}</span>
					</div>
				)}

				<div className="space-y-2" data-testid="todo-list-panel">
					{filteredItems.length === 0 ? (
						<div className="rounded-xl border border-dashed border-base-content/20 p-6 text-center text-sm text-base-content/50">
							No tasks in this view yet.
						</div>
					) : (
						filteredItems.map((item) => (
							<div
								key={item.id}
								className="flex items-center gap-3 rounded-xl border border-base-content/10 bg-base-200/40 px-4 py-3"
								data-testid="todo-item"
							>
								<input
									type="checkbox"
									className="checkbox checkbox-primary checkbox-sm"
									checked={item.completed}
									onChange={() =>
										setItems((prev) =>
											prev.map((entry) =>
												entry.id === item.id
													? { ...entry, completed: !entry.completed }
													: entry,
											),
										)
									}
								/>
								<div className="min-w-0 flex-1">
									<p
										className={`truncate text-sm ${item.completed ? "line-through text-base-content/40" : ""}`}
									>
										{item.text}
									</p>
									<p className="text-xs text-base-content/40">
										Added {new Date(item.createdAt).toLocaleString()}
									</p>
								</div>
								<button
									type="button"
									className="btn btn-ghost btn-sm btn-circle"
									onClick={() =>
										setItems((prev) =>
											prev.filter((entry) => entry.id !== item.id),
										)
									}
									aria-label={`Remove ${item.text}`}
								>
									<Icon name="trash" size={16} />
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
