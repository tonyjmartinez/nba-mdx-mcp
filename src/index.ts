import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { registerListComponentsTool } from "./tools/list-components.js";
import { registerBlogCreateTool } from "./tools/blog-create.js";
import { registerBlogPreviewTool } from "./tools/blog-preview.js";
import { registerGenerateEmbedTool } from "./tools/generate-embed.js";
import { blogPreviewHtml } from "./widgets/blog-preview-html.js";
import { embedPageHtml } from "./widgets/embed-page-html.js";
import { handleStatsRequest } from "./api/stats.js";

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
export class NBABlogMCP extends McpAgent<Env> {
	// `env` is injected by the Cloudflare DO runtime; declare it so TS knows it exists.
	declare env: Env;

	server = new McpServer({
		name: "NBA Blog Studio",
		version: "2.0.0",
	});

	async init() {
		const workerUrl = this.env.WORKER_URL ?? "https://nba-mdx-mcp.tonyjmartinez.workers.dev";
		registerListComponentsTool(this.server);
		registerBlogCreateTool(this.server);
		registerBlogPreviewTool(this.server);
		registerGenerateEmbedTool(this.server, workerUrl);
	}
}

// ── HTTP handler ─────────────────────────────────────────────────────────────
export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// ── MCP protocol endpoint ──────────────────────────────────────────────
		if (url.pathname === "/mcp") {
			return NBABlogMCP.serve("/mcp").fetch(request, env, ctx);
		}

		// ── Stats API: Claude-powered live data lookup ─────────────────────────
		// GET /api/stats?component=player-compare&player1=Jokic&player2=SGA
		if (url.pathname === "/api/stats") {
			return handleStatsRequest(request, env);
		}

		// ── Embed iframe page ──────────────────────────────────────────────────
		// GET /embed?component=player-compare&player1=Jokic&player2=SGA
		if (url.pathname === "/embed") {
			return new Response(embedPageHtml, {
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					// Allow any site to iframe this endpoint
					"X-Frame-Options": "ALLOWALL",
					"Content-Security-Policy": "frame-ancestors *",
				},
			});
		}

		// ── Landing page: MDX blog preview demo ───────────────────────────────
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
