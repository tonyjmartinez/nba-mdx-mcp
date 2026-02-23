import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { registerListComponentsTool } from "./tools/list-components.js";
import { registerBlogCreateTool } from "./tools/blog-create.js";
import { registerBlogPreviewTool } from "./tools/blog-preview.js";
import { registerGenerateEmbedTool } from "./tools/generate-embed.js";
import { embedPageHtml } from "./widgets/embed-page-html.js";
import { handleStatsRequest } from "./api/stats.js";
import { landingHtml } from "./landing.js";

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

		// ── Landing page: embeddable widget showcase ──────────────────────────
		if (url.pathname === "/" || url.pathname === "") {
			return new Response(landingHtml, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
