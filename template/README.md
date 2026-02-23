# NBA Blog

A data-driven NBA blog with interactive visualization components, powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).

Write blog posts in plain English. Claude writes the MDX, shows you a preview, and pushes to your repo. Cloudflare deploys it automatically.

---

## Setup (one-time)

### 1. Fork & Clone

Fork this repo on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/nba-blog.git
cd nba-blog
npm install
```

### 2. Deploy to Cloudflare Pages

Connect your repo to Cloudflare Pages so every git push auto-deploys:

1. Go to the [Cloudflare Pages dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project** → **Connect to Git**
3. Select your forked repo
4. Set the build config:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

Your blog is now live at `your-project.pages.dev`. Every future `git push` triggers an automatic redeploy.

### 3. Connect the MCP Server

Update `.mcp.json` in this repo with your MCP server URL:

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

### 4. Open Claude Code

```bash
claude
```

Claude Code will automatically detect `.mcp.json` and connect to the MCP server.
Check the connection with `/mcp` — you should see `nba-blog-studio` listed.

---

## Writing a Blog Post

Once Claude Code is open, just describe what you want:

> "Write a blog post comparing Stephen Curry and Klay Thompson this season"

Claude will:

1. **Call `create_blog_post`** to get a structured outline and relevant visualization components
2. **Write the MDX** using its NBA knowledge to populate all the stats and analysis
3. **Call `preview_blog_post`** to render a rich visual preview inside Claude so you can see exactly how it'll look
4. **Save the file** to `src/content/posts/curry-vs-thompson.mdx`
5. **Commit and push** — Cloudflare deploys the post within ~60 seconds

### Example prompts

```
Write a blog post comparing LeBron James and Stephen Curry's 2024-25 seasons

Write about Victor Wembanyama's sophomore leap — stats, highlights, and impact

Do a midseason MVP race breakdown with a leaderboard of the top contenders

Write a deep dive on the Boston Celtics' three-point shooting dominance
```

---

## What a Generated Post Looks Like

Here's an example of what Claude produces — this is `src/content/posts/jokic-vs-embiid.mdx`:

```mdx
---
title: "Jokic vs Embiid: The MVP Race Heats Up"
date: "2024-03-15"
author: "NBA Blog Studio"
tags: ["MVP", "Centers", "Player Comparison"]
description: "Breaking down the numbers behind the NBA's fiercest rivalry"
---

<HeroImage
  title="Jokic vs Embiid: The MVP Race Heats Up"
  subtitle="Breaking down the numbers behind the NBA's fiercest rivalry"
  colorLeft="#0E2240"
  colorRight="#006BB6"
  date="2024-03-15"
  author="NBA Blog Studio"
/>

The MVP race is heating up...

<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring while averaging a near triple-double"
  playerName="Nikola Jokic"
  color="#FDB927"
/>

<PlayerCompare
  player1={{ name: "Nikola Jokic", team: "Denver Nuggets", ... }}
  player2={{ name: "Joel Embiid", team: "Philadelphia 76ers", ... }}
  season="2023-24"
/>

<LeaderboardTable
  title="MVP Voting Frontrunners (PPG)"
  statLabel="PPG"
  entries={[
    { rank: 1, name: "Joel Embiid", team: "PHI", value: 33.1 },
    ...
  ]}
/>

<QuoteBlock attribution="Charles Barkley, Inside the NBA">
  The Joker does things that no big man has ever done.
</QuoteBlock>
```

See the full example at `src/content/posts/jokic-vs-embiid.mdx`.

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

Full usage examples for each component are in `CLAUDE.md`.

---

## Manual Post Writing

You can also write posts by hand. Create a new file in `src/content/posts/`:

```mdx
---
title: "Your Post Title"
date: "2025-01-15"
author: "Your Name"
tags: ["NBA", "Analysis"]
description: "A brief description for the listing page"
---

<HeroImage
  title="Your Post Title"
  colorLeft="#552583"
  colorRight="#FDB927"
  date="2025-01-15"
  author="Your Name"
/>

Your narrative here...

<StatHighlight value="30.2 PPG" label="Career-high scoring season" playerName="Player Name" color="#552583" />
```

Then commit and push — Cloudflare Pages deploys automatically.

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
