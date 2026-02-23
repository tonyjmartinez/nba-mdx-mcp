# NBA Blog

A data-driven NBA blog with interactive visualization components, powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).

Describe what you want in plain English. Claude writes the MDX, shows you a preview, and pushes to your repo. Cloudflare deploys it automatically.

---

## Setup (one-time, ~5 minutes)

### 1. Create an empty GitHub repo

Create a new empty repository on GitHub (no README, no .gitignore — just a blank repo). Clone it and open Claude Code:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
claude
```

### 2. Connect the MCP server

In Claude Code, add the NBA Blog Studio MCP server to your settings (run `/mcp` to open the MCP config panel):

```json
{
  "mcpServers": {
    "nba-blog-studio": {
      "type": "sse",
      "url": "https://YOUR_MCP_SERVER_URL/mcp"
    }
  }
}
```

### 3. Scaffold the blog

Ask Claude:

> "Set up my NBA blog"

Claude calls `scaffold_blog`, writes all the project files, runs `npm install`, and makes the initial commit and push. Your repo is now a working Astro blog — no cloning a template, no manual file copying.

### 4. Connect Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages) → **Create a project** → **Connect to Git**
2. Select your repo
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**

Your blog is live at `your-project.pages.dev`. Every `git push` auto-deploys.

---

## Writing Blog Posts

Once set up, just describe what you want:

> "Write a blog post comparing LeBron James and Stephen Curry this season"

Claude will:

1. Call `create_blog_post` to get a structured outline and the relevant components
2. Write the MDX using its NBA knowledge for all the stats
3. Call `preview_blog_post` to show you a rendered preview in-chat
4. Save the file to `src/content/posts/your-slug.mdx`
5. Commit and push — Cloudflare deploys the post within ~60 seconds

### Example prompts

```
Write a blog post comparing LeBron James and Stephen Curry's 2024-25 seasons

Write about Victor Wembanyama's sophomore season highlights

Do a midseason MVP race breakdown with a leaderboard of the top contenders

Write a deep dive on the Boston Celtics' three-point shooting
```

---

## Visualization Components

All 9 components render to static HTML with zero client-side JavaScript.

| Component | Description |
|-----------|-------------|
| `<HeroImage>` | Blog post header with team-color gradient |
| `<PlayerCompare>` | Side-by-side player stats with comparison bars |
| `<PlayerCard>` | Single player info card |
| `<StatHighlight>` | Large callout box for a standout stat |
| `<LeaderboardTable>` | Ranked player table |
| `<QuoteBlock>` | Styled editorial pull-quote |
| `<ShootingSplits>` | Shooting percentages comparison with donut charts |
| `<Bar>` | Single horizontal stat bar |
| `<DonutChart>` | Percentage donut/ring chart |

Components are auto-imported in every `.mdx` file — no import statements needed.

See `src/content/posts/jokic-vs-embiid.mdx` for a complete working example.

---

## Local Development

```bash
npm run dev      # Start local dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview the production build locally
```

---

## Performance

- **0 bytes of client-side JavaScript** — all components render to static HTML
- **Edge-cached globally** — served from Cloudflare's CDN
- **Fully accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Print-friendly** — clean print styles for all components
