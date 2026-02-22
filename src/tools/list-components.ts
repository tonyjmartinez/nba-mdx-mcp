import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { componentRegistry } from "../components/registry.js";

export function registerListComponentsTool(server: McpServer) {
	server.tool(
		"list_components",
		"List all available NBA visualization components for MDX blog posts. Returns component names, descriptions, props, and usage examples.",
		async () => {
			const sections = componentRegistry.map((comp) => {
				const propsTable = comp.props
					.map(
						(p) =>
							`| \`${p.name}\` | \`${p.type}\` | ${p.required ? "Yes" : "No"} | ${p.description} |`,
					)
					.join("\n");

				return [
					`### \`<${comp.name}>\``,
					"",
					comp.description,
					"",
					"**Props:**",
					"",
					"| Prop | Type | Required | Description |",
					"|------|------|----------|-------------|",
					propsTable,
					"",
					"**MDX Example:**",
					"",
					"```mdx",
					comp.mdxExample,
					"```",
				].join("\n");
			});

			const markdown = [
				"# NBA Blog Components",
				"",
				"These components are available in MDX blog posts. They render to static HTML with no client-side JavaScript.",
				"In the Astro blog template, all components are auto-imported \u2014 no import statements needed in MDX files.",
				"",
				"**Important:** All data (stats, names, etc.) should be passed as literal prop values. ",
				"Use `get_player_stats` or `compare_players` tools to fetch real data, then bake it into the component props.",
				"",
				...sections,
			].join("\n");

			return { content: [{ type: "text" as const, text: markdown }] };
		},
	);
}
