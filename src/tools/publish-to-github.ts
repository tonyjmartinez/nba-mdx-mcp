import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	registerAppTool,
	registerAppResource,
	RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { blogPreviewHtml } from "../widgets/blog-preview-html.js";
import { TEMPLATE_FILES } from "../github/template-files.js";
import { getRepoInfo, pushBatchCommit, upsertFile } from "../github/api.js";
import type { NBABlogMCP } from "../index.js";

const RESOURCE_PREVIEW = "ui://nba-blog/preview.html";

/** Convert an MDX title into a URL-safe slug */
function titleToSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 80);
}

/** Extract frontmatter field from MDX string */
function extractFrontmatter(mdx: string, field: string): string | null {
	const match = mdx.match(new RegExp(`^${field}:\\s*["']?([^"'\\n]+)["']?`, "m"));
	return match ? match[1].trim() : null;
}

export function registerPublishToGithubTool(server: McpServer, agent: NBABlogMCP) {
	// ── Tool: publish_blog_post ───────────────────────────────────────────────
	registerAppTool(
		server,
		"publish_blog_post",
		{
			description:
				"Preview and publish an MDX blog post to GitHub. " +
				"Shows a live preview in Claude Desktop, then pushes the post (and the full Astro blog template on first use) " +
				"to the connected GitHub repository. Cloudflare Pages auto-deploys on push. " +
				"Requires `connect_github` to be called first.",
			inputSchema: {
				mdx_content: z.string().describe("The complete MDX content to preview and publish"),
			},
			_meta: { ui: { resourceUri: RESOURCE_PREVIEW } },
		},
		async ({ mdx_content }) => {
			const state = agent.state as {
				github?: { token: string; owner: string; repo: string };
				repoInitialized?: boolean;
			};

			// ── Preview payload (always returned so the widget renders) ──────
			const previewPayload = JSON.stringify({ mdx: mdx_content });

			if (!state.github) {
				return {
					content: [
						{
							type: "text" as const,
							text:
								"## Not connected to GitHub\n\n" +
								"Call `connect_github` first with your GitHub token and repo URL, then try again.",
						},
						{ type: "text" as const, text: previewPayload },
					],
					isError: true,
				};
			}

			const { token, owner, repo } = state.github;

			// ── Get repo info ────────────────────────────────────────────────
			let repoInfo: Awaited<ReturnType<typeof getRepoInfo>>;
			try {
				repoInfo = await getRepoInfo(token, owner, repo);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				return {
					content: [
						{
							type: "text" as const,
							text:
								`## GitHub error\n\nCould not reach **${owner}/${repo}**: \`${msg}\`\n\n` +
								"Check that the token is still valid and has `repo` scope.",
						},
						{ type: "text" as const, text: previewPayload },
					],
					isError: true,
				};
			}

			const branch = repoInfo.default_branch;
			const pushLog: string[] = [];

			// ── Initialize repo with template on first use ───────────────────
			if (!state.repoInitialized) {
				try {
					await pushBatchCommit(
						token,
						owner,
						repo,
						branch,
						TEMPLATE_FILES,
						"chore: initialize NBA Blog Studio template\n\nScaffolded by NBA Blog Studio MCP server.\nIncludes Astro + MDX + React components + Cloudflare Pages deployment.",
						repoInfo.empty,
					);
					await agent.setState({ repoInitialized: true });
					pushLog.push(`Pushed **${Object.keys(TEMPLATE_FILES).length} template files** to \`${owner}/${repo}\``);
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					return {
						content: [
							{
								type: "text" as const,
								text:
									`## Template push failed\n\n\`${msg}\`\n\n` +
									"The preview is still shown above. Fix the error and try again.",
							},
							{ type: "text" as const, text: previewPayload },
						],
						isError: true,
					};
				}
			}

			// ── Push the MDX blog post file ──────────────────────────────────
			const title = extractFrontmatter(mdx_content, "title") ?? "untitled";
			const slug = titleToSlug(title);
			const postPath = `src/content/posts/${slug}.mdx`;

			try {
				await upsertFile(
					token,
					owner,
					repo,
					postPath,
					mdx_content,
					`post: "${title}"`,
					branch,
				);
				pushLog.push(`Pushed blog post → \`${postPath}\``);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				return {
					content: [
						{
							type: "text" as const,
							text: `## Post push failed\n\n\`${msg}\`\n\nPreview is still shown above.`,
						},
						{ type: "text" as const, text: previewPayload },
					],
					isError: true,
				};
			}

			// ── Build success message ────────────────────────────────────────
			const repoUrl = `https://github.com/${owner}/${repo}`;
			const fileUrl = `${repoUrl}/blob/${branch}/${postPath}`;

			let md = `## Published\n\n`;
			for (const entry of pushLog) md += `- ${entry}\n`;
			md += `\n`;
			md += `**Repo:** [${owner}/${repo}](${repoUrl})\n`;
			md += `**Post file:** [${postPath}](${fileUrl})\n\n`;

			const isFirstPush = pushLog.some((l) => l.includes("template files"));
			if (isFirstPush) {
				md +=
					`---\n\n` +
					`### One-time Cloudflare Pages setup\n\n` +
					`The template is now in your repo. To enable auto-deployment:\n\n` +
					`1. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → **Create a project** → **Connect to Git**\n` +
					`2. Select **${owner}/${repo}** — framework preset: **Astro**, build command: \`npm run build\`, output: \`dist\`\n` +
					`3. Add GitHub Actions secrets in [${owner}/${repo}/settings/secrets/actions](${repoUrl}/settings/secrets/actions):\n` +
					`   - \`CLOUDFLARE_API_TOKEN\` — [create here](https://dash.cloudflare.com/profile/api-tokens) with *Cloudflare Pages: Edit* permission\n` +
					`   - \`CLOUDFLARE_ACCOUNT_ID\` — shown in your Cloudflare dashboard right sidebar\n\n` +
					`After this one-time setup, every future \`publish_blog_post\` call will automatically deploy.\n`;
			} else {
				md +=
					`Cloudflare Pages will deploy automatically from the push to \`${branch}\`.\n`;
			}

			return {
				content: [
					{ type: "text" as const, text: md },
					{ type: "text" as const, text: previewPayload },
				],
			};
		},
	);

	// ── App Resource: blog preview HTML ──────────────────────────────────────
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
