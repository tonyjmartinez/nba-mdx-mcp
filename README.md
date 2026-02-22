# NBA Blog Studio — MCP Server

An AI-powered NBA blog authoring tool. Customers connect this MCP server to Claude Desktop, describe what they want in plain English, and Claude fetches real NBA stats, writes MDX with interactive visualization components, shows a rich preview, and outputs publishable content.

## Architecture

```
Customer in Claude Desktop
  ↓ MCP Protocol
NBA Blog Studio MCP Server (Cloudflare Worker)
  → get_player_stats, compare_players, search_players
  → create_blog_post, preview_blog_post, list_components
  ↓ outputs MDX
Customer's Blog Repo (template/)
  → Astro + Cloudflare Pages
  → Static HTML, 0 client JS
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_player_stats` | Fetch a player's season stats from the NBA |
| `compare_players` | Side-by-side stats for two players |
| `search_players` | Search for players by name |
| `list_components` | List all available blog components with examples |
| `create_blog_post` | Prepare data + context for writing a blog post |
| `preview_blog_post` | Render MDX as a rich visual preview |

## Component Library

9 visualization components, all SSR-first with semantic HTML and ARIA support:

- **PlayerCompare** — side-by-side comparison with stat bars and shooting splits
- **PlayerCard** — player info card with name, team, position
- **StatHighlight** — callout box for standout stats
- **LeaderboardTable** — ranked player table
- **QuoteBlock** — editorial pull-quote
- **HeroImage** — blog post header with gradient
- **Bar** — horizontal stat bar
- **DonutChart** — percentage donut chart
- **ShootingSplits** — shooting splits comparison table

## Project Structure

```
nba-mdx-mcp/
├── src/                    # MCP server source
│   ├── index.ts            # Server entry point
│   ├── tools/              # MCP tool implementations
│   ├── components/         # React visualization components
│   ├── widgets/            # MCP App preview widget
│   └── api/                # NBA data API (balldontlie)
├── template/               # Astro blog starter (customers fork this)
│   ├── src/content/posts/  # MDX blog posts
│   └── src/components/nba/ # Same components (auto-imported)
├── scripts/                # Build scripts
└── mcp-app.html            # Vite entry for preview widget
```

## Development

```bash
npm install
npm run build:ui    # Build the preview widget
npm run dev         # Start local dev server (wrangler)
npm run deploy      # Build + deploy to Cloudflare Workers
```

## Customer Setup

See [template/README.md](template/README.md) for customer-facing documentation.

1. Customer forks the `template/` directory as their own repo
2. Connects it to Cloudflare Pages (free, one-click)
3. Adds MCP server URL to Claude Desktop config
4. Writes blog posts conversationally with Claude
5. Saves MDX files to their repo → git push → live site
