import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TEMPLATE_FILES } from "./scaffold-files.js";

export function registerScaffoldTool(server: McpServer) {
	server.tool(
		"scaffold_blog",
		"Set up a new NBA blog in the current working directory. " +
		"Returns all project files (Astro config, components, layouts, example post, etc.) as a structured list. " +
		"Write each file to the given path, then run `npm install`, make an initial commit, and push. " +
		"Finally, show the user step-by-step Cloudflare Pages setup instructions so their blog auto-deploys on every push.",
		{},
		async () => {
			const fileLines = TEMPLATE_FILES.map((f) => `- \`${f.path}\``).join("\n");

			const instructions = [
				"# NBA Blog — Project Setup",
				"",
				"Write the following files to the current directory, then follow the steps below.",
				"",
				"## Files to write",
				"",
				fileLines,
				"",
				"## Steps after writing the files",
				"",
				"1. Run `npm install`",
				"2. Commit everything:",
				"   ```",
				"   git add -A",
				'   git commit -m "Initial NBA blog setup"',
				"   ```",
				"3. Push to the remote: `git push`",
				"",
				"## Connect Cloudflare Pages (tell the user to do this)",
				"",
				"Once pushed, the user needs to connect their repo to Cloudflare Pages for auto-deploy:",
				"",
				"1. Go to **dash.cloudflare.com** → Pages → **Create a project** → Connect to Git",
				"2. Select their GitHub repo",
				"3. Set build config:",
				"   - Framework preset: **Astro**",
				"   - Build command: `npm run build`",
				"   - Build output directory: `dist`",
				"4. Click **Save and Deploy**",
				"",
				"Their blog will be live at `your-project.pages.dev`. Every `git push` auto-deploys.",
				"",
				"## Update .mcp.json",
				"",
				"The scaffolded `.mcp.json` has a placeholder URL. If the user wants project-level MCP config,",
				"they should update it with their actual MCP server URL:",
				"```json",
				'{  "mcpServers": { "nba-blog-studio": { "type": "sse", "url": "https://YOUR_ACTUAL_URL/mcp" } } }',
				"```",
				"",
				"## Next steps",
				"",
				"Once the blog is deployed, the user can ask you to write posts.",
				"Use `create_blog_post` to get started.",
			].join("\n");

			return {
				content: [
					{ type: "text" as const, text: instructions },
					...TEMPLATE_FILES.map((f) => ({
						type: "text" as const,
						text: `<file path="${f.path}">\n${f.content}\n</file>`,
					})),
				],
			};
		},
	);
}
