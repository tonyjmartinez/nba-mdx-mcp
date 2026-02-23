import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRepoInfo } from "../github/api.js";
import type { NBABlogMCP } from "../index.js";

export function registerConnectGithubTool(server: McpServer, agent: NBABlogMCP) {
	server.tool(
		"connect_github",
		"Connect your GitHub repository so the MCP server can push blog posts and the full Astro template directly to your repo. " +
			"Run this once per session. You need a GitHub Personal Access Token with `repo` scope and an empty (or existing) GitHub repo.",
		{
			github_token: z
				.string()
				.describe(
					"GitHub Personal Access Token with `repo` scope. " +
						"Create one at https://github.com/settings/tokens/new — select 'repo' scope.",
				),
			repo_url: z
				.string()
				.describe(
					"GitHub repository URL or owner/repo slug. " +
						"Examples: 'https://github.com/alice/my-nba-blog' or 'alice/my-nba-blog'",
				),
		},
		async ({ github_token, repo_url }) => {
			// Parse owner/repo from URL or slug
			const match =
				repo_url.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/) ??
				repo_url.match(/^([\w.-]+)\/([\w.-]+)$/);

			if (!match) {
				return {
					content: [
						{
							type: "text" as const,
							text:
								"Could not parse the repo URL. Please use the format `owner/repo` or a full GitHub URL like `https://github.com/owner/repo`.",
						},
					],
					isError: true,
				};
			}

			const owner = match[1];
			const repo = match[2];

			// Validate the token + repo by calling the GitHub API
			let repoInfo: Awaited<ReturnType<typeof getRepoInfo>>;
			try {
				repoInfo = await getRepoInfo(github_token, owner, repo);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				return {
					content: [
						{
							type: "text" as const,
							text:
								`Failed to access **${owner}/${repo}** with the provided token.\n\n` +
								`Error: \`${msg}\`\n\n` +
								"Make sure:\n" +
								"1. The token has `repo` scope\n" +
								"2. The repository exists and you have write access\n" +
								"3. The token hasn't expired",
						},
					],
					isError: true,
				};
			}

			// Store credentials in agent state
			await agent.setState({
				github: { token: github_token, owner, repo },
				repoInitialized: false,
			});

			const emptyNote = repoInfo.empty
				? "The repo is **empty** — the full Astro blog template will be pushed on your first `publish_blog_post` call."
				: `The repo has existing commits on branch \`${repoInfo.default_branch}\`. Blog posts will be added to \`src/content/posts/\`.`;

			return {
				content: [
					{
						type: "text" as const,
						text:
							`## GitHub Connected\n\n` +
							`**Repo:** [${owner}/${repo}](https://github.com/${owner}/${repo})\n` +
							`**Branch:** \`${repoInfo.default_branch}\`\n\n` +
							`${emptyNote}\n\n` +
							`---\n\n` +
							`### Next Steps\n\n` +
							`1. Ask Claude to write a blog post: *"Give me a blog post comparing Curry and Klay"*\n` +
							`2. Claude will generate the MDX and call \`publish_blog_post\` to push it to your repo.\n` +
							`3. **One-time Cloudflare setup** (after your first push):\n` +
							`   - Go to [Cloudflare Pages](https://pages.cloudflare.com/) → **Create a project** → **Connect to Git**\n` +
							`   - Select your repo \`${owner}/${repo}\`\n` +
							`   - Build settings: Framework preset: **Astro**, Build command: \`npm run build\`, Output directory: \`dist\`\n` +
							`   - Add two GitHub Actions secrets in your repo (**Settings → Secrets → Actions**):\n` +
							`     - \`CLOUDFLARE_API_TOKEN\` — [Create here](https://dash.cloudflare.com/profile/api-tokens) with "Cloudflare Pages: Edit" permission\n` +
							`     - \`CLOUDFLARE_ACCOUNT_ID\` — Found in your Cloudflare dashboard right sidebar\n` +
							`   - After that, every \`publish_blog_post\` will auto-deploy to Cloudflare Pages.\n`,
					},
				],
			};
		},
	);
}
