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
			<div className="card-body p-4 gap-3">
				<div className="flex items-center gap-3">
					<Icon
						name={tool.icon}
						size={24}
						className="text-primary opacity-80 group-hover:opacity-100 transition-opacity"
					/>
					<h3 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors truncate">
						{tool.name}
					</h3>
				</div>
				<p className="text-sm text-base-content/60 line-clamp-2">
					{tool.description}
				</p>
				<div className="flex flex-wrap gap-2">
					{tool.acceptedExtensions.slice(0, 4).map((extension) => (
						<span key={extension} className="badge badge-outline badge-sm">
							{extension}
						</span>
					))}
					{tool.acceptedExtensions.length > 4 && (
						<span className="badge badge-ghost badge-sm">
							+{tool.acceptedExtensions.length - 4}
						</span>
					)}
				</div>
			</div>
			<div className="sr-only">
				{tool.description} {tool.acceptedExtensions.join(" ")}
			</div>
		</Link>
	)
}
