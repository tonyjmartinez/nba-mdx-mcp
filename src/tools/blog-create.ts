import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { componentRegistry } from "../components/registry.js";

export function registerBlogCreateTool(server: McpServer) {
	server.tool(
		"create_blog_post",
		"Prepare context and components for writing an NBA blog post. Returns available MDX components with full prop schemas and usage examples. No external API is called — use your own knowledge of NBA statistics to populate all player data as literal prop values in the MDX.",
		{
			topic: z.string().describe("Blog post topic (e.g. 'comparing Jokic and Embiid', 'top 3 shooters this season')"),
			player_names: z.array(z.string()).optional().describe("Player names to feature in the post"),
			season: z.string().optional().describe("Season label (e.g. '2024-25'). Defaults to the most recent season in your training data."),
		},
		async ({ topic, player_names, season }) => {
			const seasonLabel = season ?? "2024-25";
			const playerCount = (player_names ?? []).length;
			const outline = buildOutline(playerCount);
			const relevantComponents = getRelevantComponents(playerCount);

			let markdown = `# Blog Post Context: "${topic}"\n\n`;
			markdown += `**Season:** ${seasonLabel}\n`;
			if (player_names && player_names.length > 0) {
				markdown += `**Players:** ${player_names.join(", ")}\n`;
			}
			markdown += "\n";

			markdown += `## Your Role\n\n`;
			markdown += `Use your knowledge of NBA statistics to write this post. `;
			markdown += `All player data (PPG, RPG, APG, FG%, shooting splits, etc.) must come from your training knowledge `;
			markdown += `and be baked in as **literal prop values** directly in the MDX. `;
			markdown += `Do not attempt to call any external APIs or URLs — the blog is fully static.\n\n`;

			markdown += `## Suggested Outline\n\n${outline}\n\n`;

			markdown += `## Available Components\n\n`;
			for (const comp of relevantComponents) {
				markdown += `### \`<${comp.name}>\`\n`;
				markdown += `${comp.description}\n\n`;
				markdown += `**Props:**\n`;
				for (const prop of comp.props) {
					markdown += `- \`${prop.name}\` (${prop.type})${prop.required ? " *required*" : ""} — ${prop.description}\n`;
				}
				markdown += `\n**Example:**\n\`\`\`mdx\n${comp.mdxExample}\n\`\`\`\n\n`;
			}

			markdown += `## Instructions\n\n`;
			markdown += `- Start with \`<HeroImage>\` as the first element\n`;
			if (playerCount >= 2) {
				markdown += `- Use \`<PlayerCompare>\` for the head-to-head stat comparison\n`;
			}
			if (playerCount === 1) {
				markdown += `- Use \`<PlayerCard>\` for the player profile\n`;
			}
			if (playerCount >= 3) {
				markdown += `- Use \`<LeaderboardTable>\` for rankings\n`;
			}
			markdown += `- Sprinkle in \`<StatHighlight>\` for standout numbers\n`;
			markdown += `- Add \`<QuoteBlock>\` for editorial commentary\n`;
			markdown += `- Write engaging prose between the components\n`;
			markdown += `- **Fill all props with literal values from your NBA knowledge** — no placeholders\n`;
			markdown += `- Include MDX frontmatter: \`title\`, \`date\`, \`author\`, \`tags\`\n\n`;
			markdown += `When done, call \`preview_blog_post\` to see a rendered preview.\n`;

			return {
				content: [
					{ type: "text" as const, text: markdown },
				],
			};
		},
	);
}

function buildOutline(playerCount: number): string {
	const lines: string[] = [];
	lines.push("1. **Hero Header** — `<HeroImage>` with title and subtitle");
	lines.push("2. **Introduction** — Set the narrative, why this topic matters");

	if (playerCount >= 2) {
		lines.push("3. **Head-to-Head Comparison** — `<PlayerCompare>` with full stat bars");
		lines.push("4. **Key Stats** — `<StatHighlight>` callouts for standout numbers");
		lines.push("5. **Shooting Analysis** — Deep dive into shooting splits");
	} else if (playerCount === 1) {
		lines.push("3. **Player Profile** — `<PlayerCard>` and key stats overview");
		lines.push("4. **Standout Numbers** — `<StatHighlight>` for impressive stats");
		lines.push("5. **Historical Context** — How this season compares");
	} else {
		lines.push("3. **The Contenders** — Individual player breakdowns");
		lines.push("4. **Rankings** — `<LeaderboardTable>` for stat leaders");
		lines.push("5. **Analysis** — Deeper dive into the numbers");
	}

	lines.push("6. **Editorial Take** — `<QuoteBlock>` with analysis/commentary");
	lines.push("7. **Conclusion** — Final thoughts and predictions");

	return lines.join("\n");
}

function getRelevantComponents(playerCount: number) {
	const names = ["HeroImage", "StatHighlight", "QuoteBlock"];

	if (playerCount >= 2) {
		names.unshift("PlayerCompare");
	} else if (playerCount === 1) {
		names.unshift("PlayerCard");
	}

	if (playerCount >= 3) {
		names.push("LeaderboardTable");
	}

	return componentRegistry.filter((c) => names.includes(c.name));
}
