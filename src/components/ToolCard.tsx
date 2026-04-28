import { Link } from "@tanstack/react-router"
import type { ToolDefinition } from "../lib/tool-registry"
import Icon from "./Icon"

export default function ToolCard({ tool }: { tool: ToolDefinition }) {
	return (
		<Link
			to="/tool/$id"
			params={{ id: tool.id }}
			className="card bg-base-100 shadow-sm hover:shadow-lg border border-base-content/5 transition-all duration-200 hover:-translate-y-0.5 no-underline group"
		>
			<div className="card-body p-3 flex-row items-center gap-3">
				<Icon
					name={tool.icon}
					size={24}
					className="text-primary opacity-80 group-hover:opacity-100 transition-opacity"
				/>
				<h3 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors truncate">
					{tool.name}
				</h3>
			</div>
			<div className="sr-only">
				{tool.description} {tool.acceptedExtensions.join(" ")}
			</div>
		</Link>
	)
}
