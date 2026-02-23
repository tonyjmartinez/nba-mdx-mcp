import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { registerListComponentsTool } from "./tools/list-components.js";
import { registerBlogCreateTool } from "./tools/blog-create.js";
import { registerBlogPreviewTool } from "./tools/blog-preview.js";
import { blogPreviewHtml } from "./widgets/blog-preview-html.js";

// ── Demo MDX for the landing page ────────────────────────────────────────────
const DEMO_MDX = `---
title: "Jokic vs Embiid: The MVP Race"
date: "2024-03-15"
author: "NBA Blog Studio"
---

<HeroImage
  title="Jokic vs Embiid: The MVP Race"
  subtitle="Breaking down the numbers behind the NBA's fiercest rivalry"
  colorLeft="#552583"
  colorRight="#006BB6"
  date="2024-03-15"
  author="NBA Blog Studio"
/>

The battle for MVP supremacy between Nikola Jokic and Joel Embiid continues to be
one of the most compelling storylines in the NBA.

<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring while averaging a near triple-double"
  playerName="Nikola Jokic"
/>

<PlayerCompare
  player1={{
    name: "Nikola Jokic", team: "Denver Nuggets", position: "C",
    height: "6'11\\"", weight: "284 lbs",
    stats: { ppg: 26.4, rpg: 12.4, apg: 9.0, fg_pct: 58.3, fg3_pct: 35.9, ft_pct: 81.7 }
  }}
  player2={{
    name: "Joel Embiid", team: "Philadelphia 76ers", position: "C",
    height: "7'0\\"", weight: "280 lbs",
    stats: { ppg: 33.1, rpg: 10.2, apg: 4.2, fg_pct: 52.9, fg3_pct: 38.8, ft_pct: 88.3 }
  }}
  season="2023-24"
/>

<QuoteBlock attribution="Charles Barkley, TNT">
  He's not just the best center in the league, he's the best player in the league. Period.
</QuoteBlock>
`;

// ── MCP Agent ────────────────────────────────────────────────────────────────
export class NBABlogMCP extends McpAgent {
	server = new McpServer({
		name: "NBA Blog Studio",
		version: "1.0.0",
	});

	async init() {
		registerListComponentsTool(this.server);
		registerBlogCreateTool(this.server);
		registerBlogPreviewTool(this.server);
	}
}

// ── HTTP handler ─────────────────────────────────────────────────────────────
export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// MCP protocol endpoint
		if (url.pathname === "/mcp") {
			return NBABlogMCP.serve("/mcp").fetch(request, env, ctx);
		}

		// Landing page: standalone demo of the blog preview
		if (url.pathname === "/" || url.pathname === "") {
			const demoScript = `<script>window.__DEMO_DATA__ = ${JSON.stringify({ mdx: DEMO_MDX })};</script>`;
			const html = blogPreviewHtml.replace("</body>", `${demoScript}</body>`);
			return new Response(html, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
