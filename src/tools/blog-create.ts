import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	findPlayerWithStats,
	formatPlayerData,
} from "../api/balldontlie.js";
import { componentRegistry } from "../components/registry.js";

export function registerBlogCreateTool(server: McpServer) {
	server.tool(
		"create_blog_post",
		"Prepare data and context for writing an NBA blog post. Fetches real player stats and returns structured data along with available components and a suggested outline. The tool provides the ingredients — you (Claude) provide the creativity and writing.",
		{
			topic: z.string().describe("Blog post topic (e.g. 'comparing Jokic and Embiid', 'top 3 shooters this season')"),
			player_names: z.array(z.string()).optional().describe("Player names to fetch stats for"),
			season: z.number().optional().describe("Season year (e.g. 2024). Omit for current season."),
		},
		async ({ topic, player_names, season }) => {
			// Fetch stats for all mentioned players
			const playerResults = await Promise.all(
				(player_names ?? []).map(async (name) => {
					const result = await findPlayerWithStats(name, season);
					return result ? { name, data: formatPlayerData(result) } : { name, data: null };
				}),
			);

			const foundPlayers = playerResults.filter((p) => p.data != null);
			const notFound = playerResults.filter((p) => p.data == null);

			// Build suggested outline based on the topic and number of players
			const outline = buildOutline(topic, foundPlayers.length);

			// Gather component examples relevant to the topic
			const relevantComponents = getRelevantComponents(foundPlayers.length);

			const seasonLabel = season ? `${season}-${String(season + 1).slice(2)}` : "Current";

			// Build the response
			let markdown = `# Blog Post Context: "${topic}"\n\n`;
			markdown += `**Season:** ${seasonLabel}\n\n`;

			if (notFound.length > 0) {
				markdown += `**Players not found:** ${notFound.map((p) => p.name).join(", ")}. Try \`search_players\` to find correct names.\n\n`;
			}

			markdown += `## Player Data\n\n`;
			for (const p of foundPlayers) {
				const d = p.data!;
				markdown += `### ${d.name}\n`;
				markdown += `${d.team} | ${d.position}`;
				if (d.height) markdown += ` | ${d.height}`;
				markdown += "\n\n";
				if (d.stats) {
					markdown += `| Stat | Value |\n|---|---|\n`;
					const s = d.stats;
					if (s.ppg != null) markdown += `| PPG | ${s.ppg} |\n`;
					if (s.rpg != null) markdown += `| RPG | ${s.rpg} |\n`;
					if (s.apg != null) markdown += `| APG | ${s.apg} |\n`;
					if (s.spg != null) markdown += `| SPG | ${s.spg} |\n`;
					if (s.bpg != null) markdown += `| BPG | ${s.bpg} |\n`;
					if (s.fg_pct != null) markdown += `| FG% | ${s.fg_pct}% |\n`;
					if (s.fg3_pct != null) markdown += `| 3P% | ${s.fg3_pct}% |\n`;
					if (s.ft_pct != null) markdown += `| FT% | ${s.ft_pct}% |\n`;
					markdown += "\n";
				}
			}

			markdown += `## Suggested Outline\n\n${outline}\n\n`;
			markdown += `## Available Components\n\n`;
			for (const comp of relevantComponents) {
				markdown += `- **\`<${comp.name}>\`** — ${comp.description}\n`;
			}

			markdown += `\n## Instructions\n\n`;
			markdown += `Compose an MDX blog post using the player data above and the available components.\n`;
			markdown += `- Start with a \`<HeroImage>\` component for the post header\n`;
			markdown += `- Weave in \`<StatHighlight>\` for impressive numbers\n`;
			markdown += `- Use \`<PlayerCompare>\` for side-by-side comparisons\n`;
			markdown += `- Add \`<QuoteBlock>\` for editorial commentary\n`;
			markdown += `- Use \`<LeaderboardTable>\` for rankings\n`;
			markdown += `- Write engaging prose between components\n`;
			markdown += `- **Bake all data as literal prop values** — no runtime fetching\n`;
			markdown += `- The MDX file needs frontmatter: title, date, author, tags\n\n`;
			markdown += `When done, use \`preview_blog_post\` to see a rendered preview.\n`;

			// Also return structured JSON for programmatic use
			const json = {
				topic,
				season: seasonLabel,
				players: foundPlayers.map((p) => p.data),
				suggestedOutline: outline,
				components: relevantComponents.map((c) => c.name),
			};

			return {
				content: [
					{ type: "text" as const, text: markdown },
					{ type: "text" as const, text: JSON.stringify(json, null, 2) },
				],
			};
		},
	);
}

function buildOutline(topic: string, playerCount: number): string {
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
	// Always include these
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
