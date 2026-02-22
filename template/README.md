# NBA Blog

A data-driven NBA blog with interactive visualization components, powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).

## Quick Start

### 1. Fork & Clone

Fork this repo, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/nba-blog.git
cd nba-blog
npm install
```

### 2. Deploy to Cloudflare Pages

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project** → **Connect to Git**
3. Select your forked repo
4. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

Your blog is now live at `your-project.pages.dev`.

### 3. Connect the MCP Server (for AI-powered writing)

Add the NBA Blog Studio MCP server to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nba-blog-studio": {
      "url": "https://nba-mdx-mcp.YOUR_SUBDOMAIN.workers.dev/mcp"
    }
  }
}
```

### 4. Write Blog Posts

Open Claude Desktop and start writing:

> "Write me a blog post comparing LeBron James and Stephen Curry this season"

Claude will:
1. Fetch real NBA stats via the MCP server
2. Compose MDX with interactive visualization components
3. Show you a rich preview
4. Output the MDX file for you to save

Save the MDX file to `src/content/posts/your-post-title.mdx`, commit, and push.
Cloudflare Pages will auto-deploy your new post.

## Writing Posts Manually

Create a new `.mdx` file in `src/content/posts/`:

```mdx
---
title: "Your Post Title"
date: "2024-03-15"
author: "Your Name"
tags: ["NBA", "Analysis"]
description: "A brief description for the listing page"
---

Your content here. All NBA components are auto-imported — no import statements needed.

<PlayerCompare
  player1={{ name: "Player A", team: "Team A", position: "PG", stats: { ppg: 25.0 } }}
  player2={{ name: "Player B", team: "Team B", position: "SG", stats: { ppg: 23.5 } }}
/>
```

## Available Components

All components render to static HTML with zero client-side JavaScript.

| Component | Description |
|-----------|-------------|
| `<PlayerCompare>` | Side-by-side player comparison with stat bars |
| `<PlayerCard>` | Single player info card |
| `<StatHighlight>` | Callout box for a standout stat |
| `<LeaderboardTable>` | Ranked player table |
| `<QuoteBlock>` | Styled editorial pull-quote |
| `<HeroImage>` | Blog post header with gradient |
| `<Bar>` | Horizontal stat bar |
| `<DonutChart>` | Percentage donut chart |
| `<ShootingSplits>` | Shooting splits comparison |

See `src/content/posts/jokic-vs-embiid.mdx` for a complete example using all components.

## Development

```bash
npm run dev      # Start local dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Performance

- **0 bytes of client-side JavaScript** — everything renders to static HTML
- **Instant page loads** — served from Cloudflare's edge CDN
- **Fully accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Print-friendly** — clean print styles for all components
