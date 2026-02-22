import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	registerAppTool,
	registerAppResource,
	RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { blogPreviewHtml } from "../widgets/blog-preview-html.js";

const RESOURCE_PREVIEW = "ui://nba-blog/preview.html";

export function registerBlogPreviewTool(server: McpServer) {
	// ── Tool: preview_blog_post ──────────────────────────────────────────────
	registerAppTool(
		server,
		"preview_blog_post",
		{
			description:
				"Render a preview of an MDX blog post with NBA visualization components. " +
				"Pass the complete MDX content and see it rendered with all components. " +
				"The preview shows how the post will look on the final blog site.",
			inputSchema: {
				mdx_content: z.string().describe("The complete MDX content to preview"),
			},
			_meta: { ui: { resourceUri: RESOURCE_PREVIEW } },
		},
		async ({ mdx_content }) => {
			// Return the MDX content as JSON for the preview widget to render
			const payload = { mdx: mdx_content };

			// Also return a markdown summary for non-app clients
			const lines = mdx_content.split("\n").length;
			const components = (mdx_content.match(/<[A-Z]\w+/g) ?? [])
				.map((m) => m.slice(1))
				.filter((v, i, a) => a.indexOf(v) === i);

			let markdown = `## Blog Post Preview\n\n`;
			markdown += `**Lines:** ${lines}\n`;
			markdown += `**Components used:** ${components.length > 0 ? components.join(", ") : "none"}\n\n`;
			markdown += `The blog post preview is rendering in the MCP App widget.\n\n`;
			markdown += `---\n\n`;
			markdown += `### MDX Source\n\n\`\`\`mdx\n${mdx_content}\n\`\`\``;

			return {
				content: [
					{ type: "text" as const, text: markdown },
					{ type: "text" as const, text: JSON.stringify(payload) },
				],
			};
		},
	);

	// ── App Resource: blog preview HTML ─────────────────────────────────────
	registerAppResource(
		server,
		RESOURCE_PREVIEW,
		RESOURCE_PREVIEW,
		{ mimeType: RESOURCE_MIME_TYPE },
		async () => ({
			contents: [
				{
					uri: RESOURCE_PREVIEW,
					mimeType: RESOURCE_MIME_TYPE,
					text: blogPreviewHtml,
				},
			],
		}),
	);
}
