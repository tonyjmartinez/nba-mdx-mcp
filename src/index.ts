import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { registerListComponentsTool } from "./tools/list-components.js";
import { registerBlogCreateTool } from "./tools/blog-create.js";
import { registerBlogPreviewTool } from "./tools/blog-preview.js";
import { blogPreviewHtml } from "./widgets/blog-preview-html.js";
import { mdxToAgentMarkdown } from "./tools/mdx-to-markdown.js";

// ── Demo MDX for the landing page ────────────────────────────────────────────
const DEMO_MDX = `---
title: "Curry vs. Klay: The Greatest Shooting Backcourt of All Time"
date: "2024-03-15"
author: "NBA Blog Studio"
---

<HeroImage
  title="Curry vs. Klay: Greatest Shooting Backcourt Ever"
  subtitle="Breaking down the all-time shooting numbers of the Splash Brothers"
  colorLeft="#1D428A"
  colorRight="#FFC72C"
  date="2024-03-15"
  author="NBA Blog Studio"
/>

When you talk about the greatest shooters in NBA history, two names rise above all others — and they played on the same team for a decade. Stephen Curry and Klay Thompson, the Splash Brothers, didn't just redefine what perimeter shooting looks like in the modern era. They set the standard for every backcourt that came after them.

But how do their all-time shooting numbers actually stack up against each other?

<StatHighlight
  value="42.8% Career 3P%"
  label="The greatest three-point shooting percentage in NBA history among players with 500+ attempts"
  playerName="Stephen Curry"
  color="#FFC72C"
/>

<PlayerCompare
  player1={{
    name: "Stephen Curry",
    team: "Golden State Warriors",
    position: "PG",
    height: "6'2\\"",
    weight: "185 lbs",
    stats: { ppg: 24.8, rpg: 4.7, apg: 6.4, fg_pct: 47.3, fg3_pct: 42.8, ft_pct: 90.9 }
  }}
  player2={{
    name: "Klay Thompson",
    team: "Golden State Warriors",
    position: "SG",
    height: "6'6\\"",
    weight: "215 lbs",
    stats: { ppg: 19.5, rpg: 3.5, apg: 2.3, fg_pct: 45.7, fg3_pct: 41.9, ft_pct: 84.6 }
  }}
  season="Career"
/>

Both players comfortably exceed the 40% threshold from three — a benchmark that has historically defined elite-level shooting. Curry is the all-time leader in three-pointers made with over 3,700 and counting. Thompson, despite missing two full seasons to injury, sits comfortably in the all-time top ten.

<ShootingSplits
  player1Name="Stephen Curry"
  player2Name="Klay Thompson"
  player1FgPct={47.3}
  player1Fg3Pct={42.8}
  player1FtPct={90.9}
  player2FgPct={45.7}
  player2Fg3Pct={41.9}
  player2FtPct={84.6}
  selected="fg3_pct"
/>

<LeaderboardTable
  title="All-Time Three-Point Percentage Leaders (Min. 500 Attempts)"
  statLabel="3P%"
  entries={[
    { rank: 1, name: "Stephen Curry", team: "GSW", value: 42.8 },
    { rank: 2, name: "Steve Nash", team: "Multiple", value: 42.8 },
    { rank: 3, name: "Klay Thompson", team: "GSW", value: 41.9 },
    { rank: 4, name: "Joe Harris", team: "Multiple", value: 41.5 },
    { rank: 5, name: "Mike Miller", team: "Multiple", value: 40.9 }
  ]}
  highlightColor="#FFC72C"
/>

<StatHighlight
  value="37 Points"
  label="Points scored in a single quarter vs. Sacramento Kings (Jan 2015) — an NBA record that still stands"
  playerName="Klay Thompson"
  color="#1D428A"
/>

The case for Klay as the purest shooter of the two is real. His release is faster, his catch-and-shoot efficiency is arguably unmatched, and that 37-point quarter remains one of the most jaw-dropping individual performances in league history. Curry, meanwhile, is the greater overall offensive force — a pick-and-roll weapon, off-screen threat, and pull-up maestro who has forced defenses to invent entirely new schemes just to slow him down.

<QuoteBlock attribution="Reggie Miller, TNT">
  I've never seen anything like it. Curry and Klay don't just shoot threes — they make shooting look like an art form.
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

		// llms.txt — Cloudflare AI agents / LLM-readable site index
		if (url.pathname === "/llms.txt") {
			const origin = url.origin;
			const content = [
				"# NBA Blog Studio",
				"",
				"> Data-driven NBA analysis with interactive statistical visualizations.",
				"> Built with the NBA Blog Studio MCP server — an AI-native blogging platform",
				"> that generates rich MDX blog posts with visualization components.",
				"",
				"## Demo Article",
				"",
				`- [Curry vs. Klay: The Greatest Shooting Backcourt of All Time](${origin}/)`,
				`  Markdown: ${origin}/demo.md`,
				"",
				"## MCP Server",
				"",
				`- MCP endpoint: ${origin}/mcp`,
				"  Use with Claude Desktop or any MCP-compatible client to author your own NBA blog posts.",
				"",
				"## Markdown Endpoints",
				"",
				`All blog posts are available as structured markdown for AI consumption at \`/demo.md\`.`,
				"The markdown includes ASCII bar visualizations so AI assistants can render statistics visually.",
				"",
			].join("\n");

			return new Response(content, {
				headers: { "Content-Type": "text/plain; charset=utf-8" },
			});
		}

		// /demo.md — Cloudflare AI agents markdown version of the demo article
		if (url.pathname === "/demo.md") {
			const markdown = mdxToAgentMarkdown(DEMO_MDX);
			return new Response(markdown, {
				headers: {
					"Content-Type": "text/markdown; charset=utf-8",
					"Cache-Control": "public, max-age=3600",
				},
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
