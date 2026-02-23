# NBA Blog Studio — Claude Code Guide

This is an NBA blog powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).
You are connected to an MCP server that gives you tools to plan, write, preview, and publish
NBA blog posts with rich visualization components.

## MCP Tools Available

| Tool | When to use |
|------|-------------|
| `scaffold_blog` | **First-time setup** — writes all project files, runs npm install, commits, and pushes |
| `list_components` | Browse all available visualization components with full prop schemas |
| `create_blog_post` | **Start every post here** — returns a structured outline + relevant components |
| `preview_blog_post` | Render completed MDX as a rich visual preview inside Claude |

---

## First-time Setup

If the user says "set up my blog" or "scaffold the blog" (or the repo is empty), call `scaffold_blog`.

The tool returns all project files with their paths and contents. Write each file, then:

```bash
npm install
git add -A
git commit -m "Initial NBA blog setup"
git push
```

Then show the user these Cloudflare Pages setup steps:

1. Go to **dash.cloudflare.com** → Pages → **Create a project** → Connect to Git
2. Select the repo
3. Build settings: Framework = Astro, Build command = `npm run build`, Output dir = `dist`
4. Click **Save and Deploy**

The blog will be live at `your-project.pages.dev` and auto-deploys on every push.

---

## Workflow: Writing a New Blog Post

When the user asks you to write a blog post, follow this sequence:

### 1. Call `create_blog_post`

Pass:
- `topic` — short description, e.g. `"Curry vs Thompson 2024-25 season"`
- `players` — array of player names, e.g. `["Stephen Curry", "Klay Thompson"]`
- `season` (optional) — e.g. `"2024-25"`

This returns a structured outline and the most relevant components for the post.

### 2. Write the MDX

Using the outline and your NBA knowledge, write a complete `.mdx` file:

- Start with YAML frontmatter (`title`, `date`, `author`, `tags`, `description`)
- Use `<HeroImage>` as the very first component
- Weave components between prose paragraphs — don't stack them back-to-back
- All stats must be **literal values** (no JS expressions or computed values)
- Components are **auto-imported** — no `import` statements needed

### 3. Preview it

Call `preview_blog_post` with the full MDX string. This renders a styled HTML preview
inside Claude showing exactly how the post will look when deployed.

Show the user the preview and ask if they want any changes before saving.

### 4. Save the file

Write the MDX to: **`src/content/posts/your-post-slug.mdx`**

Use a descriptive kebab-case filename:
- `lebron-vs-curry-scoring-race.mdx`
- `wembanyama-sophomore-leap.mdx`
- `western-conference-mvp-race-2025.mdx`

### 5. Commit and push

```bash
git add src/content/posts/your-post.mdx
git commit -m "Add blog post: <title>"
git push
```

Cloudflare Pages automatically builds and deploys — the post is live within ~60 seconds.

---

## Component Reference

All components render to static HTML with zero client-side JavaScript.
Props must use **literal values only** — no variables or expressions.

### `<HeroImage>` — Blog header with team-color gradient
Use as the **first element** in every post. Pick team colors from the table at the bottom.

```mdx
<HeroImage
  title="Jokic vs Embiid: The MVP Race Heats Up"
  subtitle="Breaking down the numbers behind the NBA's fiercest rivalry"
  colorLeft="#0E2240"
  colorRight="#006BB6"
  date="2025-01-15"
  author="Your Name"
/>
```

---

### `<PlayerCompare>` — Side-by-side comparison with stat bars
Best for head-to-head posts. Include all 8 stat fields for a complete visualization.

```mdx
<PlayerCompare
  player1={{
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    position: "C",
    height: "6'11\"",
    weight: "284 lbs",
    stats: {
      ppg: 26.4,
      rpg: 12.4,
      apg: 9.0,
      spg: 1.4,
      bpg: 0.9,
      fg_pct: 58.3,
      fg3_pct: 35.9,
      ft_pct: 81.7
    }
  }}
  player2={{
    name: "Joel Embiid",
    team: "Philadelphia 76ers",
    position: "C",
    height: "7'0\"",
    weight: "280 lbs",
    stats: {
      ppg: 33.1,
      rpg: 10.2,
      apg: 4.2,
      spg: 1.0,
      bpg: 1.7,
      fg_pct: 52.9,
      fg3_pct: 38.8,
      ft_pct: 88.3
    }
  }}
  season="2024-25"
/>
```

---

### `<StatHighlight>` — Large callout for a standout stat
Use 2–3 per post for the most impressive numbers. Place between paragraphs.

```mdx
<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring while averaging a near triple-double"
  playerName="Nikola Jokic"
  color="#FDB927"
/>
```

---

### `<LeaderboardTable>` — Ranked player table
Great for top-5 or top-10 lists. The #1 entry gets highlighted.

```mdx
<LeaderboardTable
  title="Scoring Leaders (PPG)"
  statLabel="PPG"
  entries={[
    { rank: 1, name: "Joel Embiid", team: "PHI", value: 33.1 },
    { rank: 2, name: "Luka Doncic", team: "DAL", value: 32.4 },
    { rank: 3, name: "Giannis Antetokounmpo", team: "MIL", value: 30.4 },
    { rank: 4, name: "Shai Gilgeous-Alexander", team: "OKC", value: 30.1 },
    { rank: 5, name: "Nikola Jokic", team: "DEN", value: 26.4 }
  ]}
/>
```

---

### `<QuoteBlock>` — Editorial pull-quote
Use for analyst takes, coach quotes, or player sound bites.

```mdx
<QuoteBlock attribution="Charles Barkley, Inside the NBA">
  The Joker does things that no big man has ever done. He makes everyone around
  him better. But Embiid? When he's healthy and locked in, there's nobody on
  Earth who can guard that man.
</QuoteBlock>
```

---

### `<ShootingSplits>` — Shooting percentage comparison with donut charts

```mdx
<ShootingSplits
  player1Name="Nikola Jokic"
  player2Name="Joel Embiid"
  player1FgPct={58.3}
  player2FgPct={52.9}
  player1Fg3Pct={35.9}
  player2Fg3Pct={38.8}
  player1FtPct={81.7}
  player2FtPct={88.3}
/>
```

---

### `<Bar>` — Single horizontal stat bar

```mdx
<Bar value={26.4} max={40} color="#FDB927" label="PPG" />
```

---

### `<DonutChart>` — Percentage donut/ring chart

```mdx
<DonutChart pct={58.3} color="#FDB927" label="FG%" />
```

---

## NBA Team Colors

Use these hex values for `colorLeft`/`colorRight` in `<HeroImage>` and `color` in other components.

| Team | Primary | Secondary |
|------|---------|-----------|
| Lakers | #FDB927 | #552583 |
| Warriors | #006BB6 | #FFC72C |
| Celtics | #007A33 | #BA9653 |
| Heat | #98002E | #F9A01B |
| Nuggets | #FDB927 | #0E2240 |
| 76ers | #006BB6 | #ED174C |
| Bucks | #00471B | #EEE1C6 |
| Nets | #000000 | #FFFFFF |
| Knicks | #006BB6 | #F58426 |
| Thunder | #007AC1 | #EF3B24 |
| Suns | #E56020 | #1D1160 |
| Mavericks | #00538C | #002B5E |
| Spurs | #C4CED4 | #000000 |
| Clippers | #C8102E | #1D428A |
| Rockets | #CE1141 | #000000 |
| Bulls | #CE1141 | #000000 |
| Cavaliers | #860038 | #FDBB30 |
| Pistons | #C8102E | #1D42BA |
| Pacers | #002D62 | #FDBB30 |
| Raptors | #CE1141 | #000000 |
| Hawks | #E03A3E | #C1D32F |
| Hornets | #00788C | #1D1160 |
| Magic | #0077C0 | #000000 |
| Wizards | #002B5C | #E31837 |
| Jazz | #002B5C | #F9A01B |
| Grizzlies | #5D76A9 | #12173F |
| Pelicans | #0C2340 | #C8102E |
| Kings | #5A2D81 | #63727A |
| Trail Blazers | #E03A3E | #000000 |
| Timberwolves | #236192 | #9EA1A2 |

---

## Example User Prompts

These are the kinds of requests users will make:

- "Write a blog post comparing LeBron and Curry this season"
- "Write about Wembanyama's sophomore season highlights"
- "Create a post on the top scorers in the Western Conference"
- "Write a midseason MVP race breakdown"
- "Do a deep dive on the Celtics' three-point shooting"

For each one: call `create_blog_post` → write MDX → call `preview_blog_post` → save → commit → push.

---

## File Structure

```
src/
├── content/
│   └── posts/          ← Save new blog posts here (.mdx files)
├── components/
│   └── nba/            ← Component source (do not modify)
└── pages/              ← Astro routing (do not modify)
public/                 ← Static assets
```

See `src/content/posts/jokic-vs-embiid.mdx` for a complete working example using all components.
