/**
 * generate_embed MCP tool.
 *
 * Generates copy-paste HTML snippets authors use to embed live NBA stats
 * widgets into any CMS — Hashnode, WordPress, Ghost, Substack, etc.
 *
 * The snippet is a plain <iframe> pointing at the Worker's /embed endpoint.
 * When a reader loads the page:
 *   1. The iframe loads our embed page from the Worker.
 *   2. The embed page calls /api/stats with the same params.
 *   3. Claude looks up the real stats.
 *   4. The React component renders with live data.
 *
 * No MDX, no Astro, no git push required.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Component height guidelines (pixels) — used as the iframe height default.
const DEFAULT_HEIGHTS: Record<string, number> = {
	"player-compare": 540,
	"leaderboard": 320,
	"stat-highlight": 160,
	"player-card": 130,
};

export function registerGenerateEmbedTool(server: McpServer, workerUrl: string) {
	server.tool(
		"generate_embed",
		`Generate a copy-paste HTML embed snippet for an NBA stats widget. ` +
		`Authors paste this into any blog platform (Hashnode, WordPress, Ghost, Substack, Medium, etc.) ` +
		`and the widget automatically fetches live data via Claude — no MDX, no git, no deployments needed. ` +
		`The snippet is a plain <iframe> that works everywhere HTML is accepted.`,
		{
			component: z.enum(["player-compare", "leaderboard", "stat-highlight", "player-card"])
				.describe("Which widget to embed"),

			player1: z.string().optional()
				.describe("First player name (required for player-compare, stat-highlight, player-card)"),

			player2: z.string().optional()
				.describe("Second player name (required for player-compare)"),

			players: z.array(z.string()).optional()
				.describe("Ordered list of player names for a custom leaderboard"),

			stat: z.string().optional()
				.describe("Stat key for leaderboard/stat-highlight: ppg, rpg, apg, fg_pct, fg3_pct, ft_pct"),

			season: z.string().optional()
				.describe("Season label, e.g. '2024-25'. Defaults to the most recent season."),

			title: z.string().optional()
				.describe("Custom title for the leaderboard table"),

			height: z.number().optional()
				.describe("Override the iframe height in pixels"),
		},
		async ({ component, player1, player2, players, stat, season, title, height }) => {
			const params = new URLSearchParams({ component });

			if (player1) params.set("player1", player1);
			if (player2) params.set("player2", player2);
			if (players?.length) params.set("players", players.join(","));
			if (stat) params.set("stat", stat);
			if (season) params.set("season", season);
			if (title) params.set("title", title);

			const iframeHeight = height ?? DEFAULT_HEIGHTS[component] ?? 400;
			const embedUrl = `${workerUrl}/embed?${params.toString()}`;

			// ── Validation feedback ──────────────────────────────────────────────────
			const warnings: string[] = [];

			if (component === "player-compare") {
				if (!player1) warnings.push("⚠️  player1 is required for player-compare");
				if (!player2) warnings.push("⚠️  player2 is required for player-compare");
			}
			if (component === "player-card" && !player1) {
				warnings.push("⚠️  player1 is required for player-card");
			}
			if (component === "stat-highlight" && !player1) {
				warnings.push("⚠️  player1 is required for stat-highlight");
			}

			// ── Embed snippet ────────────────────────────────────────────────────────
			const snippet = `<!-- NBA Stats Widget: ${component} -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="${iframeHeight}"
  style="border:0;border-radius:12px;overflow:hidden;display:block;max-width:720px;margin:0 auto;"
  loading="lazy"
  title="NBA Stats: ${buildTitle(component, player1, player2, stat, season)}"
></iframe>

<!-- Optional: auto-resize iframe to fit content height -->
<script>
window.addEventListener("message", function(e) {
  if (e.data && e.data.type === "nba-embed-resize") {
    var iframes = document.querySelectorAll('iframe[src*="${new URL(workerUrl).hostname}"]');
    iframes.forEach(function(f) { f.height = e.data.height + 24; });
  }
});
</script>`;

			// ── Response markdown ────────────────────────────────────────────────────
			let md = `## NBA Stats Embed Generated\n\n`;

			if (warnings.length > 0) {
				md += warnings.join("\n") + "\n\n";
			}

			md += `**Widget:** \`${component}\`\n`;
			md += `**Data source:** Claude AI (live lookup on every page view)\n`;
			if (season) md += `**Season:** ${season}\n`;
			md += `\n`;

			md += `### Copy this snippet into your post:\n\n`;
			md += "```html\n" + snippet + "\n```\n\n";

			md += `### Platform-specific notes\n\n`;
			md += `- **Hashnode**: Paste in the HTML block widget (⌘+K → HTML)\n`;
			md += `- **WordPress**: Use the "Custom HTML" block\n`;
			md += `- **Ghost**: Add an HTML card\n`;
			md += `- **Substack**: Use the Embed block (paste the iframe URL when prompted)\n`;
			md += `- **Medium**: Embeds aren't supported — use the iframe URL as a link instead\n\n`;

			md += `### How it works\n\n`;
			md += `1. Reader loads your post on Hashnode/WordPress/etc.\n`;
			md += `2. The iframe loads from \`${workerUrl}\`\n`;
			md += `3. Claude looks up the real NBA stats\n`;
			md += `4. The component renders with live data — automatically\n\n`;
			md += `You never have to update the embed. It always shows current stats.\n`;

			return {
				content: [{ type: "text" as const, text: md }],
			};
		},
	);
}

function buildTitle(
	component: string,
	player1?: string,
	player2?: string,
	stat?: string,
	season?: string,
): string {
	const s = season ? ` (${season})` : "";
	switch (component) {
		case "player-compare":
			return `${player1 ?? "Player 1"} vs ${player2 ?? "Player 2"}${s}`;
		case "leaderboard":
			return `${(stat ?? "stat").toUpperCase()} Leaders${s}`;
		case "stat-highlight":
			return `${player1 ?? "Player"} highlight${s}`;
		case "player-card":
			return player1 ?? "Player card";
		default:
			return component;
	}
}
