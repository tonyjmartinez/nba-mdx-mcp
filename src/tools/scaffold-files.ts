// AUTO-GENERATED — do not edit by hand.
// Run `npm run build:scaffold` to regenerate.

export type TemplateFile = { path: string; content: string };

export const TEMPLATE_FILES: TemplateFile[] = [
  { path: ".gitignore", content: `node_modules/
dist/
.astro/
.wrangler/
*.log
` },
  { path: ".mcp.json", content: `{
  "mcpServers": {
    "nba-blog-studio": {
      "type": "sse",
      "url": "https://YOUR_MCP_SERVER_URL/mcp"
    }
  }
}
` },
  { path: "CLAUDE.md", content: `# NBA Blog Studio — Claude Code Guide

This is an NBA blog powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).
You are connected to an MCP server that gives you tools to plan, write, preview, and publish
NBA blog posts with rich visualization components.

## MCP Tools Available

| Tool | When to use |
|------|-------------|
| \`scaffold_blog\` | **First-time setup** — writes all project files, runs npm install, commits, and pushes |
| \`list_components\` | Browse all available visualization components with full prop schemas |
| \`create_blog_post\` | **Start every post here** — returns a structured outline + relevant components |
| \`preview_blog_post\` | Render completed MDX as a rich visual preview inside Claude |

---

## First-time Setup

If the user says "set up my blog" or "scaffold the blog" (or the repo is empty), call \`scaffold_blog\`.

The tool returns all project files with their paths and contents. Write each file, then:

\`\`\`bash
npm install
git add -A
git commit -m "Initial NBA blog setup"
git push
\`\`\`

Then show the user these Cloudflare Pages setup steps:

1. Go to **dash.cloudflare.com** → Pages → **Create a project** → Connect to Git
2. Select the repo
3. Build settings: Framework = Astro, Build command = \`npm run build\`, Output dir = \`dist\`
4. Click **Save and Deploy**

The blog will be live at \`your-project.pages.dev\` and auto-deploys on every push.

---

## Workflow: Writing a New Blog Post

When the user asks you to write a blog post, follow this sequence:

### 1. Call \`create_blog_post\`

Pass:
- \`topic\` — short description, e.g. \`"Curry vs Thompson 2024-25 season"\`
- \`players\` — array of player names, e.g. \`["Stephen Curry", "Klay Thompson"]\`
- \`season\` (optional) — e.g. \`"2024-25"\`

This returns a structured outline and the most relevant components for the post.

### 2. Write the MDX

Using the outline and your NBA knowledge, write a complete \`.mdx\` file:

- Start with YAML frontmatter (\`title\`, \`date\`, \`author\`, \`tags\`, \`description\`)
- Use \`<HeroImage>\` as the very first component
- Weave components between prose paragraphs — don't stack them back-to-back
- All stats must be **literal values** (no JS expressions or computed values)
- Components are **auto-imported** — no \`import\` statements needed

### 3. Preview it

Call \`preview_blog_post\` with the full MDX string. This renders a styled HTML preview
inside Claude showing exactly how the post will look when deployed.

Show the user the preview and ask if they want any changes before saving.

### 4. Save the file

Write the MDX to: **\`src/content/posts/your-post-slug.mdx\`**

Use a descriptive kebab-case filename:
- \`lebron-vs-curry-scoring-race.mdx\`
- \`wembanyama-sophomore-leap.mdx\`
- \`western-conference-mvp-race-2025.mdx\`

### 5. Commit and push

\`\`\`bash
git add src/content/posts/your-post.mdx
git commit -m "Add blog post: <title>"
git push
\`\`\`

Cloudflare Pages automatically builds and deploys — the post is live within ~60 seconds.

---

## Component Reference

All components render to static HTML with zero client-side JavaScript.
Props must use **literal values only** — no variables or expressions.

### \`<HeroImage>\` — Blog header with team-color gradient
Use as the **first element** in every post. Pick team colors from the table at the bottom.

\`\`\`mdx
<HeroImage
  title="Jokic vs Embiid: The MVP Race Heats Up"
  subtitle="Breaking down the numbers behind the NBA's fiercest rivalry"
  colorLeft="#0E2240"
  colorRight="#006BB6"
  date="2025-01-15"
  author="Your Name"
/>
\`\`\`

---

### \`<PlayerCompare>\` — Side-by-side comparison with stat bars
Best for head-to-head posts. Include all 8 stat fields for a complete visualization.

\`\`\`mdx
<PlayerCompare
  player1={{
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    position: "C",
    height: "6'11\\"",
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
    height: "7'0\\"",
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
\`\`\`

---

### \`<StatHighlight>\` — Large callout for a standout stat
Use 2–3 per post for the most impressive numbers. Place between paragraphs.

\`\`\`mdx
<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring while averaging a near triple-double"
  playerName="Nikola Jokic"
  color="#FDB927"
/>
\`\`\`

---

### \`<LeaderboardTable>\` — Ranked player table
Great for top-5 or top-10 lists. The #1 entry gets highlighted.

\`\`\`mdx
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
\`\`\`

---

### \`<QuoteBlock>\` — Editorial pull-quote
Use for analyst takes, coach quotes, or player sound bites.

\`\`\`mdx
<QuoteBlock attribution="Charles Barkley, Inside the NBA">
  The Joker does things that no big man has ever done. He makes everyone around
  him better. But Embiid? When he's healthy and locked in, there's nobody on
  Earth who can guard that man.
</QuoteBlock>
\`\`\`

---

### \`<ShootingSplits>\` — Shooting percentage comparison with donut charts

\`\`\`mdx
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
\`\`\`

---

### \`<Bar>\` — Single horizontal stat bar

\`\`\`mdx
<Bar value={26.4} max={40} color="#FDB927" label="PPG" />
\`\`\`

---

### \`<DonutChart>\` — Percentage donut/ring chart

\`\`\`mdx
<DonutChart pct={58.3} color="#FDB927" label="FG%" />
\`\`\`

---

## NBA Team Colors

Use these hex values for \`colorLeft\`/\`colorRight\` in \`<HeroImage>\` and \`color\` in other components.

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

For each one: call \`create_blog_post\` → write MDX → call \`preview_blog_post\` → save → commit → push.

---

## File Structure

\`\`\`
src/
├── content/
│   └── posts/          ← Save new blog posts here (.mdx files)
├── components/
│   └── nba/            ← Component source (do not modify)
└── pages/              ← Astro routing (do not modify)
public/                 ← Static assets
\`\`\`

See \`src/content/posts/jokic-vs-embiid.mdx\` for a complete working example using all components.
` },
  { path: "README.md", content: `# NBA Blog

A data-driven NBA blog with interactive visualization components, powered by [NBA Blog Studio](https://github.com/tonyjmartinez/nba-mdx-mcp).

Describe what you want in plain English. Claude writes the MDX, shows you a preview, and pushes to your repo. Cloudflare deploys it automatically.

---

## Setup (one-time, ~5 minutes)

### 1. Create an empty GitHub repo

Create a new empty repository on GitHub (no README, no .gitignore — just a blank repo). Clone it and open Claude Code:

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
claude
\`\`\`

### 2. Connect the MCP server

In Claude Code, add the NBA Blog Studio MCP server to your settings (run \`/mcp\` to open the MCP config panel):

\`\`\`json
{
  "mcpServers": {
    "nba-blog-studio": {
      "type": "sse",
      "url": "https://YOUR_MCP_SERVER_URL/mcp"
    }
  }
}
\`\`\`

### 3. Scaffold the blog

Ask Claude:

> "Set up my NBA blog"

Claude calls \`scaffold_blog\`, writes all the project files, runs \`npm install\`, and makes the initial commit and push. Your repo is now a working Astro blog — no cloning a template, no manual file copying.

### 4. Connect Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages) → **Create a project** → **Connect to Git**
2. Select your repo
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** \`npm run build\`
   - **Build output directory:** \`dist\`
4. Click **Save and Deploy**

Your blog is live at \`your-project.pages.dev\`. Every \`git push\` auto-deploys.

---

## Writing Blog Posts

Once set up, just describe what you want:

> "Write a blog post comparing LeBron James and Stephen Curry this season"

Claude will:

1. Call \`create_blog_post\` to get a structured outline and the relevant components
2. Write the MDX using its NBA knowledge for all the stats
3. Call \`preview_blog_post\` to show you a rendered preview in-chat
4. Save the file to \`src/content/posts/your-slug.mdx\`
5. Commit and push — Cloudflare deploys the post within ~60 seconds

### Example prompts

\`\`\`
Write a blog post comparing LeBron James and Stephen Curry's 2024-25 seasons

Write about Victor Wembanyama's sophomore season highlights

Do a midseason MVP race breakdown with a leaderboard of the top contenders

Write a deep dive on the Boston Celtics' three-point shooting
\`\`\`

---

## Visualization Components

All 9 components render to static HTML with zero client-side JavaScript.

| Component | Description |
|-----------|-------------|
| \`<HeroImage>\` | Blog post header with team-color gradient |
| \`<PlayerCompare>\` | Side-by-side player stats with comparison bars |
| \`<PlayerCard>\` | Single player info card |
| \`<StatHighlight>\` | Large callout box for a standout stat |
| \`<LeaderboardTable>\` | Ranked player table |
| \`<QuoteBlock>\` | Styled editorial pull-quote |
| \`<ShootingSplits>\` | Shooting percentages comparison with donut charts |
| \`<Bar>\` | Single horizontal stat bar |
| \`<DonutChart>\` | Percentage donut/ring chart |

Components are auto-imported in every \`.mdx\` file — no import statements needed.

See \`src/content/posts/jokic-vs-embiid.mdx\` for a complete working example.

---

## Local Development

\`\`\`bash
npm run dev      # Start local dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview the production build locally
\`\`\`

---

## Performance

- **0 bytes of client-side JavaScript** — all components render to static HTML
- **Edge-cached globally** — served from Cloudflare's CDN
- **Fully accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Print-friendly** — clean print styles for all components
` },
  { path: "astro.config.mjs", content: `import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "static",
	integrations: [mdx(), react()],
	adapter: cloudflare(),
});
` },
  { path: "package.json", content: `{
	"name": "nba-blog",
	"type": "module",
	"version": "0.0.1",
	"scripts": {
		"dev": "astro dev",
		"start": "astro dev",
		"build": "astro build",
		"preview": "astro preview"
	},
	"dependencies": {
		"@astrojs/cloudflare": "^12.0.0",
		"@astrojs/mdx": "^4.0.0",
		"@astrojs/react": "^4.0.0",
		"astro": "^5.0.0",
		"react": "^19.2.4",
		"react-dom": "^19.2.4"
	},
	"devDependencies": {
		"@types/react": "^19.2.14",
		"@types/react-dom": "^19.2.3",
		"typescript": "^5.9.3"
	}
}
` },
  { path: "public/favicon.svg", content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#0f172a" stroke="#ff2d78" stroke-width="2"/><text x="18" y="24" text-anchor="middle" font-size="20" fill="#ff2d78">🏀</text></svg>
` },
  { path: "src/components/nba/Bar.tsx", content: `import type { CSSProperties } from "react";

export type BarProps = {
	/** Stat value to display */
	value: number | undefined;
	/** Maximum value for scale (e.g. 35 for PPG) */
	max: number;
	/** Bar fill color */
	color: string;
	/** Accessible label for the bar */
	label?: string;
};

export function Bar({ value, max, color, label }: BarProps) {
	if (value == null) return <div style={{ flex: 1 }} />;
	const pct = Math.min((value / max) * 100, 100);

	const trackStyle: CSSProperties = {
		background: "#0f172a",
		borderRadius: 5,
		height: 10,
		flex: 1,
		overflow: "hidden",
	};

	const fillStyle: CSSProperties = {
		width: \`\${pct}%\`,
		height: "100%",
		background: color,
		borderRadius: 5,
	};

	return (
		<div
			role="img"
			aria-label={label ?? \`\${value} out of \${max}\`}
			style={trackStyle}
		>
			<div style={fillStyle} />
		</div>
	);
}
` },
  { path: "src/components/nba/DonutChart.tsx", content: `import type { CSSProperties } from "react";

const SIZE = 120;
const RADIUS = 42;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 13;

export type DonutChartProps = {
	/** Percentage value (0-100) */
	pct: number | undefined;
	/** Fill color */
	color: string;
	/** Label displayed below the chart */
	label: string;
};

export function DonutChart({ pct, color, label }: DonutChartProps) {
	const safePct = pct ?? 0;
	const filled = (safePct / 100) * CIRCUMFERENCE;
	const textColor = color === "#ff2d78" ? "#ff80bc" : "#80f3ff";

	const wrapStyle: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: 6,
	};

	const svgWrap: CSSProperties = {
		position: "relative",
		width: SIZE,
		height: SIZE,
	};

	const centerStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	const labelStyle: CSSProperties = {
		fontSize: "0.8rem",
		color: "#94a3b8",
		textAlign: "center",
		maxWidth: SIZE,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};

	return (
		<figure style={wrapStyle} role="img" aria-label={\`\${label}: \${pct != null ? \`\${pct.toFixed(1)}%\` : "N/A"}\`}>
			<div style={svgWrap}>
				<svg
					width={SIZE}
					height={SIZE}
					viewBox={\`0 0 \${SIZE} \${SIZE}\`}
					style={{ transform: "rotate(-90deg)", display: "block" }}
					aria-hidden="true"
				>
					<circle
						cx={CX} cy={CY} r={RADIUS}
						fill="none" stroke="#0f172a" strokeWidth={STROKE_WIDTH}
					/>
					<circle
						cx={CX} cy={CY} r={RADIUS}
						fill="none"
						stroke={pct != null ? color : "#1e293b"}
						strokeWidth={STROKE_WIDTH}
						strokeLinecap="round"
						strokeDasharray={\`\${filled} \${CIRCUMFERENCE}\`}
					/>
				</svg>
				<div style={centerStyle}>
					<span style={{ fontSize: "1rem", fontWeight: 700, color: textColor }}>
						{pct != null ? \`\${pct.toFixed(1)}%\` : "\\u2014"}
					</span>
				</div>
			</div>
			<figcaption style={labelStyle}>{label}</figcaption>
		</figure>
	);
}
` },
  { path: "src/components/nba/HeroImage.tsx", content: `import type { CSSProperties } from "react";

export type HeroImageProps = {
	/** Blog post title */
	title: string;
	/** Subtitle or tagline */
	subtitle?: string;
	/** Left accent color (e.g. player 1 or team color). Defaults to pink. */
	colorLeft?: string;
	/** Right accent color (e.g. player 2 or team color). Defaults to cyan. */
	colorRight?: string;
	/** Optional date string */
	date?: string;
	/** Optional author name */
	author?: string;
};

export function HeroImage({
	title,
	subtitle,
	colorLeft = "#ff2d78",
	colorRight = "#00e5ff",
	date,
	author,
}: HeroImageProps) {
	const headerStyle: CSSProperties = {
		position: "relative",
		padding: "40px 24px 32px",
		background: \`linear-gradient(135deg, \${colorLeft}22 0%, #0f172a 40%, #0f172a 60%, \${colorRight}22 100%)\`,
		borderRadius: 12,
		overflow: "hidden",
		margin: "0 0 24px",
		textAlign: "center",
	};

	const decorBarStyle: CSSProperties = {
		display: "flex",
		justifyContent: "center",
		gap: 4,
		marginBottom: 16,
	};

	const titleStyle: CSSProperties = {
		margin: 0,
		fontSize: "1.6rem",
		fontWeight: 800,
		lineHeight: 1.2,
		color: "#f1f5f9",
		letterSpacing: "-0.02em",
	};

	const subtitleStyle: CSSProperties = {
		margin: "8px 0 0",
		fontSize: "1rem",
		color: "#94a3b8",
		lineHeight: 1.4,
	};

	const metaStyle: CSSProperties = {
		marginTop: 14,
		fontSize: "0.8rem",
		color: "#64748b",
	};

	return (
		<header style={headerStyle}>
			{/* Decorative color bar */}
			<div style={decorBarStyle} aria-hidden="true">
				<div style={{ width: 32, height: 3, borderRadius: 2, background: colorLeft }} />
				<div style={{ width: 32, height: 3, borderRadius: 2, background: colorRight }} />
			</div>

			<h1 style={titleStyle}>{title}</h1>

			{subtitle && <p style={subtitleStyle}>{subtitle}</p>}

			{(date || author) && (
				<div style={metaStyle}>
					{author && <span>{author}</span>}
					{author && date && <span> &middot; </span>}
					{date && <time dateTime={date}>{date}</time>}
				</div>
			)}
		</header>
	);
}
` },
  { path: "src/components/nba/LeaderboardTable.tsx", content: `import type { CSSProperties } from "react";

export type LeaderboardEntry = {
	rank: number;
	name: string;
	team: string;
	value: number;
};

export type LeaderboardTableProps = {
	/** Table title (e.g. "Points Per Game Leaders") */
	title: string;
	/** Column header for the stat value (e.g. "PPG") */
	statLabel: string;
	/** Array of ranked entries */
	entries: LeaderboardEntry[];
	/** Accent color for the #1 rank. Defaults to gold. */
	highlightColor?: string;
};

export function LeaderboardTable({
	title,
	statLabel,
	entries,
	highlightColor = "#fbbf24",
}: LeaderboardTableProps) {
	const sectionStyle: CSSProperties = {
		margin: "16px 0",
		background: "#1e293b",
		borderRadius: 10,
		overflow: "hidden",
	};

	const headingStyle: CSSProperties = {
		margin: 0,
		padding: "12px 14px",
		fontSize: "0.85rem",
		fontWeight: 700,
		color: "#e2e8f0",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		borderBottom: "1px solid #334155",
	};

	const tableStyle: CSSProperties = {
		width: "100%",
		borderCollapse: "collapse",
		fontSize: "0.85rem",
		color: "#cbd5e1",
	};

	const thStyle: CSSProperties = {
		textAlign: "left",
		padding: "8px 14px",
		fontWeight: 600,
		color: "#94a3b8",
		borderBottom: "1px solid #334155",
	};

	const thRight: CSSProperties = { ...thStyle, textAlign: "right" };

	return (
		<section style={sectionStyle} aria-label={title}>
			<h4 style={headingStyle}>{title}</h4>
			<table style={tableStyle}>
				<thead>
					<tr>
						<th scope="col" style={{ ...thStyle, width: 40, textAlign: "center" }}>#</th>
						<th scope="col" style={thStyle}>Player</th>
						<th scope="col" style={{ ...thStyle, width: 100 }}>Team</th>
						<th scope="col" style={{ ...thRight, width: 70 }}>{statLabel}</th>
					</tr>
				</thead>
				<tbody>
					{entries.map((entry) => {
						const isFirst = entry.rank === 1;
						const rowStyle: CSSProperties = {
							borderBottom: "1px solid #1e293b",
							background: isFirst ? "rgba(251, 191, 36, 0.08)" : "transparent",
						};
						const cellStyle: CSSProperties = { padding: "8px 14px" };
						return (
							<tr key={\`\${entry.rank}-\${entry.name}\`} style={rowStyle}>
								<td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: isFirst ? highlightColor : "#64748b" }}>
									{entry.rank}
								</td>
								<td style={{ ...cellStyle, fontWeight: isFirst ? 700 : 400, color: isFirst ? "#f1f5f9" : "#cbd5e1" }}>
									{entry.name}
								</td>
								<td style={{ ...cellStyle, color: "#94a3b8" }}>{entry.team}</td>
								<td style={{ ...cellStyle, textAlign: "right", fontWeight: 600, color: isFirst ? highlightColor : "#e2e8f0" }}>
									{entry.value.toFixed(1)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</section>
	);
}
` },
  { path: "src/components/nba/PlayerCard.tsx", content: `import type { CSSProperties } from "react";

export type PlayerCardProps = {
	name: string;
	team: string;
	position: string;
	height?: string;
	weight?: string;
	/** Accent color for the card header border */
	color?: string;
};

const P1_COLOR = "#ff2d78";

export function PlayerCard({
	name,
	team,
	position,
	height,
	weight,
	color = P1_COLOR,
}: PlayerCardProps) {
	const cardStyle: CSSProperties = {
		flex: 1,
		padding: "12px 10px",
		borderRadius: 10,
		background: "#1e293b",
		borderTop: \`3px solid \${color}\`,
	};

	const nameColor = color === P1_COLOR ? "#ff80bc" : "#80f3ff";

	return (
		<article style={cardStyle} aria-label={\`\${name} player card\`}>
			<div
				style={{
					fontSize: "1.05rem",
					fontWeight: 700,
					color: nameColor,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					marginBottom: 3,
				}}
			>
				{name}
			</div>
			<dl style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
				<div style={{ display: "flex", gap: 4 }}>
					<dt style={{ fontWeight: 600 }}>Team:</dt>
					<dd style={{ margin: 0 }}>{team}</dd>
				</div>
				<div style={{ display: "flex", gap: 4 }}>
					<dt style={{ fontWeight: 600 }}>Pos:</dt>
					<dd style={{ margin: 0 }}>{position}</dd>
				</div>
				{height && (
					<div style={{ display: "flex", gap: 4 }}>
						<dt style={{ fontWeight: 600 }}>Ht:</dt>
						<dd style={{ margin: 0 }}>
							{height}
							{weight ? \` \\u00B7 \${weight}\` : ""}
						</dd>
					</div>
				)}
			</dl>
		</article>
	);
}
` },
  { path: "src/components/nba/PlayerCompare.tsx", content: `import type { CSSProperties } from "react";
import { PlayerCard } from "./PlayerCard.js";
import { Bar } from "./Bar.js";
import { ShootingSplits } from "./ShootingSplits.js";

export type PlayerData = {
	name: string;
	team: string;
	position: string;
	height?: string;
	weight?: string;
	stats?: {
		ppg?: number;
		rpg?: number;
		apg?: number;
		spg?: number;
		bpg?: number;
		fg_pct?: number;
		fg3_pct?: number;
		ft_pct?: number;
	};
};

export type PlayerCompareProps = {
	player1: PlayerData;
	player2: PlayerData;
	season?: string;
};

const STAT_KEYS = ["ppg", "rpg", "apg", "spg", "bpg", "fg_pct", "fg3_pct", "ft_pct"] as const;
type StatKey = typeof STAT_KEYS[number];

const STAT_LABELS: Record<StatKey, string> = {
	ppg: "PPG", rpg: "RPG", apg: "APG", spg: "SPG",
	bpg: "BPG", fg_pct: "FG%", fg3_pct: "3P%", ft_pct: "FT%",
};

const MAX_VALS: Record<StatKey, number> = {
	ppg: 35, rpg: 15, apg: 12, spg: 3,
	bpg: 4, fg_pct: 70, fg3_pct: 50, ft_pct: 100,
};

const SHOOTING_KEYS: StatKey[] = ["fg_pct", "fg3_pct", "ft_pct"];
const P1_COLOR = "#ff2d78";
const P2_COLOR = "#00e5ff";

export function PlayerCompare({ player1, player2, season }: PlayerCompareProps) {
	const s1 = player1.stats ?? {};
	const s2 = player2.stats ?? {};
	const activeKeys = STAT_KEYS.filter((k) => s1[k] != null || s2[k] != null);
	const hasShootingSplits = SHOOTING_KEYS.some((k) => s1[k] != null || s2[k] != null);

	const rootStyle: CSSProperties = {
		fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
		background: "#0f172a",
		color: "#e2e8f0",
		padding: 14,
		borderRadius: 12,
	};

	return (
		<section style={rootStyle} aria-label={\`\${player1.name} vs \${player2.name} comparison\`}>
			{/* Player header cards */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 44px 1fr", gap: 8, marginBottom: 12, alignItems: "stretch" }}>
				<PlayerCard name={player1.name} team={player1.team} position={player1.position} height={player1.height} weight={player1.weight} color={P1_COLOR} />
				<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
					<span style={{ fontSize: "1rem", fontWeight: 900, color: "#64748b" }} aria-hidden="true">VS</span>
				</div>
				<PlayerCard name={player2.name} team={player2.team} position={player2.position} height={player2.height} weight={player2.weight} color={P2_COLOR} />
			</div>

			{/* Season label */}
			{season && (
				<div style={{ textAlign: "center", fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
					{season} Season
				</div>
			)}

			{/* Stat comparison bars */}
			<div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }} role="table" aria-label="Statistical comparison">
				<div role="row" style={{ display: "none" }}>
					<span role="columnheader">Stat</span>
					<span role="columnheader">{player1.name}</span>
					<span role="columnheader">{player2.name}</span>
				</div>
				{activeKeys.length === 0 ? (
					<div style={{ textAlign: "center", color: "#94a3b8", padding: "36px 0", fontSize: "0.9rem" }}>
						No stats available
					</div>
				) : (
					activeKeys.map((k) => {
						const max = Math.max(MAX_VALS[k] ?? 100, s1[k] ?? 0, s2[k] ?? 0);
						const v1 = s1[k];
						const v2 = s2[k];
						return (
							<div key={k} role="row" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
								<div role="rowheader" style={{ width: 36, fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>
									{STAT_LABELS[k]}
								</div>
								<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<Bar value={v1} max={max} color={P1_COLOR} label={\`\${player1.name} \${STAT_LABELS[k]}: \${v1 ?? "N/A"}\`} />
										<div style={{ fontSize: "0.82rem", color: "#cbd5e1", minWidth: 34 }}>
											{v1 != null ? v1.toFixed(1) : "\\u2014"}
										</div>
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<Bar value={v2} max={max} color={P2_COLOR} label={\`\${player2.name} \${STAT_LABELS[k]}: \${v2 ?? "N/A"}\`} />
										<div style={{ fontSize: "0.82rem", color: "#cbd5e1", minWidth: 34 }}>
											{v2 != null ? v2.toFixed(1) : "\\u2014"}
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Shooting splits */}
			{hasShootingSplits && (
				<ShootingSplits
					player1Name={player1.name}
					player2Name={player2.name}
					player1FgPct={s1.fg_pct}
					player1Fg3Pct={s1.fg3_pct}
					player1FtPct={s1.ft_pct}
					player2FgPct={s2.fg_pct}
					player2Fg3Pct={s2.fg3_pct}
					player2FtPct={s2.ft_pct}
					player1Color={P1_COLOR}
					player2Color={P2_COLOR}
				/>
			)}

			{/* Legend */}
			<div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 12 }}>
				{[{ name: player1.name, color: P1_COLOR }, { name: player2.name, color: P2_COLOR }].map(({ name, color }) => (
					<div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "#cbd5e1" }}>
						<div style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }} aria-hidden="true" />
						{name}
					</div>
				))}
			</div>
		</section>
	);
}
` },
  { path: "src/components/nba/QuoteBlock.tsx", content: `import type { CSSProperties } from "react";

export type QuoteBlockProps = {
	/** The quote text */
	children: string;
	/** Attribution (e.g. "Charles Barkley, TNT") */
	attribution?: string;
	/** Accent color for the quote border. Defaults to pink. */
	color?: string;
};

export function QuoteBlock({
	children,
	attribution,
	color = "#ff2d78",
}: QuoteBlockProps) {
	const blockquoteStyle: CSSProperties = {
		margin: "20px 0",
		padding: "16px 20px",
		background: "#1e293b",
		borderLeft: \`4px solid \${color}\`,
		borderRadius: "0 10px 10px 0",
		fontStyle: "italic",
		fontSize: "1.05rem",
		lineHeight: 1.6,
		color: "#e2e8f0",
	};

	const citeStyle: CSSProperties = {
		display: "block",
		marginTop: 8,
		fontStyle: "normal",
		fontSize: "0.82rem",
		color: "#94a3b8",
	};

	return (
		<blockquote style={blockquoteStyle}>
			<p style={{ margin: 0 }}>{children}</p>
			{attribution && (
				<cite style={citeStyle}>&mdash; {attribution}</cite>
			)}
		</blockquote>
	);
}
` },
  { path: "src/components/nba/ShootingSplits.tsx", content: `import type { CSSProperties } from "react";
import { DonutChart } from "./DonutChart.js";

export type ShootingSplitsProps = {
	player1Name: string;
	player2Name: string;
	player1FgPct?: number;
	player1Fg3Pct?: number;
	player1FtPct?: number;
	player2FgPct?: number;
	player2Fg3Pct?: number;
	player2FtPct?: number;
	/** Which split to display: "fg_pct" | "fg3_pct" | "ft_pct". Defaults to "fg_pct". */
	selected?: "fg_pct" | "fg3_pct" | "ft_pct";
	player1Color?: string;
	player2Color?: string;
};

const P1_COLOR = "#ff2d78";
const P2_COLOR = "#00e5ff";

const LABELS: Record<string, string> = {
	fg_pct: "FG%",
	fg3_pct: "3P%",
	ft_pct: "FT%",
};

/**
 * SSR-friendly shooting splits display.
 * Shows all three splits as a table with donut charts for the selected stat.
 * No client-side interactivity — the \`selected\` prop controls which donuts render.
 */
export function ShootingSplits({
	player1Name,
	player2Name,
	player1FgPct,
	player1Fg3Pct,
	player1FtPct,
	player2FgPct,
	player2Fg3Pct,
	player2FtPct,
	selected = "fg_pct",
	player1Color = P1_COLOR,
	player2Color = P2_COLOR,
}: ShootingSplitsProps) {
	const splits = {
		fg_pct: { p1: player1FgPct, p2: player2FgPct },
		fg3_pct: { p1: player1Fg3Pct, p2: player2Fg3Pct },
		ft_pct: { p1: player1FtPct, p2: player2FtPct },
	};

	const sectionStyle: CSSProperties = {
		background: "#1e293b",
		borderRadius: 10,
		padding: "12px 14px",
		marginTop: 10,
	};

	const headingStyle: CSSProperties = {
		textAlign: "center",
		fontSize: "0.8rem",
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: "0.1em",
		marginBottom: 10,
		margin: 0,
	};

	return (
		<section style={sectionStyle} aria-label="Shooting splits comparison">
			<h4 style={headingStyle}>Shooting Splits</h4>

			{/* Table showing all splits */}
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: "0.82rem",
					color: "#cbd5e1",
					marginBottom: 14,
				}}
				role="table"
			>
				<thead>
					<tr>
						<th scope="col" style={{ textAlign: "left", padding: "4px 8px", color: "#94a3b8", fontWeight: 600 }}>Stat</th>
						<th scope="col" style={{ textAlign: "right", padding: "4px 8px", color: player1Color, fontWeight: 600 }}>{player1Name}</th>
						<th scope="col" style={{ textAlign: "right", padding: "4px 8px", color: player2Color, fontWeight: 600 }}>{player2Name}</th>
					</tr>
				</thead>
				<tbody>
					{(Object.keys(splits) as Array<keyof typeof splits>).map((key) => {
						const { p1, p2 } = splits[key];
						const isSelected = key === selected;
						return (
							<tr
								key={key}
								style={{
									background: isSelected ? "#334155" : "transparent",
									fontWeight: isSelected ? 600 : 400,
								}}
							>
								<td style={{ padding: "4px 8px" }}>{LABELS[key]}</td>
								<td style={{ textAlign: "right", padding: "4px 8px" }}>
									{p1 != null ? \`\${p1.toFixed(1)}%\` : "\\u2014"}
								</td>
								<td style={{ textAlign: "right", padding: "4px 8px" }}>
									{p2 != null ? \`\${p2.toFixed(1)}%\` : "\\u2014"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{/* Donut charts for the selected split */}
			<div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "0 8px" }}>
				<DonutChart
					pct={splits[selected].p1}
					color={player1Color}
					label={player1Name}
				/>
				<DonutChart
					pct={splits[selected].p2}
					color={player2Color}
					label={player2Name}
				/>
			</div>
		</section>
	);
}
` },
  { path: "src/components/nba/StatHighlight.tsx", content: `import type { CSSProperties } from "react";

export type StatHighlightProps = {
	/** The stat value to highlight (e.g. "26.4 PPG") */
	value: string;
	/** Short description or context (e.g. "League-leading scorer") */
	label: string;
	/** Player name for attribution */
	playerName?: string;
	/** Accent color. Defaults to cyan (#00e5ff). */
	color?: string;
};

export function StatHighlight({
	value,
	label,
	playerName,
	color = "#00e5ff",
}: StatHighlightProps) {
	const figureStyle: CSSProperties = {
		margin: "16px 0",
		padding: "16px 20px",
		background: "#1e293b",
		borderLeft: \`4px solid \${color}\`,
		borderRadius: "0 10px 10px 0",
	};

	const valueStyle: CSSProperties = {
		fontSize: "1.8rem",
		fontWeight: 800,
		color,
		lineHeight: 1.2,
		marginBottom: 4,
	};

	const labelStyle: CSSProperties = {
		fontSize: "0.9rem",
		color: "#94a3b8",
		lineHeight: 1.4,
	};

	return (
		<figure style={figureStyle} role="img" aria-label={\`\${playerName ? \`\${playerName}: \` : ""}\${value} — \${label}\`}>
			<div style={valueStyle}>{value}</div>
			<figcaption style={labelStyle}>
				{playerName && (
					<strong style={{ color: "#e2e8f0" }}>{playerName}</strong>
				)}
				{playerName ? " \\u2014 " : ""}
				{label}
			</figcaption>
		</figure>
	);
}
` },
  { path: "src/components/nba/index.ts", content: `export { Bar } from "./Bar.js";
export { DonutChart } from "./DonutChart.js";
export { PlayerCard } from "./PlayerCard.js";
export { PlayerCompare } from "./PlayerCompare.js";
export { ShootingSplits } from "./ShootingSplits.js";
export { StatHighlight } from "./StatHighlight.js";
export { LeaderboardTable } from "./LeaderboardTable.js";
export { QuoteBlock } from "./QuoteBlock.js";
export { HeroImage } from "./HeroImage.js";

export type { BarProps } from "./Bar.js";
export type { DonutChartProps } from "./DonutChart.js";
export type { PlayerCardProps } from "./PlayerCard.js";
export type { PlayerCompareProps, PlayerData } from "./PlayerCompare.js";
export type { ShootingSplitsProps } from "./ShootingSplits.js";
export type { StatHighlightProps } from "./StatHighlight.js";
export type { LeaderboardTableProps, LeaderboardEntry } from "./LeaderboardTable.js";
export type { QuoteBlockProps } from "./QuoteBlock.js";
export type { HeroImageProps } from "./HeroImage.js";
` },
  { path: "src/content/config.ts", content: `import { defineCollection, z } from "astro:content";

const posts = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		date: z.string(),
		author: z.string().default("NBA Blog Studio"),
		tags: z.array(z.string()).default([]),
		description: z.string().optional(),
	}),
});

export const collections = { posts };
` },
  { path: "src/content/posts/jokic-vs-embiid.mdx", content: `---
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

The MVP race is heating up, and once again it comes down to the two best centers in the
game: **Nikola Jokic** and **Joel Embiid**. Both are putting up historic numbers,
but the paths to their dominance couldn't be more different.

## The Numbers Don't Lie

<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring while averaging a near triple-double"
  playerName="Nikola Jokic"
  color="#FDB927"
/>

Jokic continues to rewrite what's possible for a center. His court vision is
unmatched — averaging 9.0 assists per game while still pulling down 12.4 boards.
No center in NBA history has sustained this level of all-around production.

<StatHighlight
  value="33.1 PPG"
  label="Led the entire league in scoring, the highest mark by a center since Shaq"
  playerName="Joel Embiid"
  color="#006BB6"
/>

Embiid, meanwhile, is a scoring machine. His 33.1 points per game is the highest
by a center since Shaquille O'Neal's prime. When healthy, he's arguably the most
unstoppable force in basketball.

## Head-to-Head Comparison

<PlayerCompare
  player1={{
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    position: "C",
    height: "6'11\\"",
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
    height: "7'0\\"",
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
  season="2023-24"
/>

## The MVP Landscape

<LeaderboardTable
  title="MVP Voting Frontrunners (PPG)"
  statLabel="PPG"
  entries={[
    { rank: 1, name: "Joel Embiid", team: "PHI", value: 33.1 },
    { rank: 2, name: "Luka Doncic", team: "DAL", value: 32.4 },
    { rank: 3, name: "Giannis Antetokounmpo", team: "MIL", value: 30.4 },
    { rank: 4, name: "Shai Gilgeous-Alexander", team: "OKC", value: 30.1 },
    { rank: 5, name: "Nikola Jokic", team: "DEN", value: 26.4 }
  ]}
/>

While Embiid leads in raw scoring, the MVP conversation has always been about more
than just points. Jokic's team success and all-around impact often tip the scales
in his favor.

<QuoteBlock attribution="Charles Barkley, Inside the NBA">
  The Joker does things that no big man has ever done. He makes everyone around
  him better. But Embiid? When he's healthy and locked in, there's nobody on
  Earth who can guard that man.
</QuoteBlock>

## The Verdict

This MVP race is too close to call. If you value pure scoring dominance and
two-way impact, Embiid is your pick. If you value basketball IQ, playmaking,
and making your teammates better, it's Jokic all day.

One thing's for certain — we're witnessing the golden age of center play,
and these two titans are leading the charge.
` },
  { path: "src/layouts/BlogPost.astro", content: `---
interface Props {
	title: string;
	date: string;
	author: string;
}

const { title, date, author } = Astro.props;
---

<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="color-scheme" content="dark" />
		<title>{title} | NBA Blog</title>
		<link rel="stylesheet" href="/styles/global.css" />
	</head>
	<body>
		<a href="#main-content" class="skip-link">Skip to main content</a>
		<nav aria-label="Main navigation">
			<div class="nav-inner">
				<a href="/" class="nav-brand">NBA Blog</a>
			</div>
		</nav>
		<main id="main-content">
			<article class="post">
				<slot />
			</article>
		</main>
		<footer>
			<p>
				Built with <a href="https://github.com/tonyjmartinez/nba-mdx-mcp">NBA Blog Studio</a>
				&middot; Powered by Astro
			</p>
		</footer>
	</body>
</html>

<style>
	.skip-link {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 100;
		padding: 8px 16px;
		background: #ff2d78;
		color: white;
		font-weight: 700;
	}
	.skip-link:focus {
		left: 0;
	}
	nav {
		border-bottom: 1px solid #1e293b;
		padding: 12px 0;
	}
	.nav-inner {
		max-width: 720px;
		margin: 0 auto;
		padding: 0 16px;
	}
	.nav-brand {
		color: #f1f5f9;
		text-decoration: none;
		font-weight: 800;
		font-size: 1.1rem;
		letter-spacing: -0.02em;
	}
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px;
	}
	footer {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px;
		border-top: 1px solid #1e293b;
		text-align: center;
		font-size: 0.82rem;
		color: #64748b;
	}
	footer a {
		color: #94a3b8;
	}
</style>
` },
  { path: "src/pages/index.astro", content: `---
import { getCollection } from "astro:content";

const posts = (await getCollection("posts")).sort(
	(a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);
---

<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="color-scheme" content="dark" />
		<title>NBA Blog</title>
		<link rel="stylesheet" href="/styles/global.css" />
	</head>
	<body>
		<a href="#main-content" class="skip-link">Skip to main content</a>
		<header class="site-header">
			<h1>NBA Blog</h1>
			<p>Data-driven NBA content with interactive visualizations</p>
		</header>
		<main id="main-content">
			{posts.length === 0 ? (
				<div class="empty">
					<p>No posts yet. Use the NBA Blog Studio MCP server with Claude to write your first post!</p>
				</div>
			) : (
				<ul class="post-list">
					{posts.map((post) => (
						<li>
							<a href={\`/posts/\${post.slug}\`}>
								<article>
									<h2>{post.data.title}</h2>
									<div class="meta">
										<time datetime={post.data.date}>{post.data.date}</time>
										<span>&middot;</span>
										<span>{post.data.author}</span>
									</div>
									{post.data.description && <p>{post.data.description}</p>}
									{post.data.tags.length > 0 && (
										<div class="tags">
											{post.data.tags.map((tag) => (
												<span class="tag">{tag}</span>
											))}
										</div>
									)}
								</article>
							</a>
						</li>
					))}
				</ul>
			)}
		</main>
		<footer>
			<p>
				Built with <a href="https://github.com/tonyjmartinez/nba-mdx-mcp">NBA Blog Studio</a>
			</p>
		</footer>
	</body>
</html>

<style>
	.skip-link {
		position: absolute;
		left: -9999px;
		top: 0;
		z-index: 100;
		padding: 8px 16px;
		background: #ff2d78;
		color: white;
		font-weight: 700;
	}
	.skip-link:focus {
		left: 0;
	}
	.site-header {
		max-width: 720px;
		margin: 0 auto;
		padding: 40px 16px 24px;
		text-align: center;
	}
	.site-header h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #f1f5f9;
		margin: 0 0 8px;
		letter-spacing: -0.03em;
	}
	.site-header p {
		color: #94a3b8;
		font-size: 1rem;
		margin: 0;
	}
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 0 16px 40px;
	}
	.empty {
		text-align: center;
		padding: 40px 0;
		color: #94a3b8;
	}
	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.post-list li {
		margin-bottom: 16px;
	}
	.post-list a {
		display: block;
		text-decoration: none;
		padding: 16px 20px;
		background: #1e293b;
		border-radius: 10px;
		border: 1px solid #334155;
		transition: border-color 0.2s;
	}
	.post-list a:hover {
		border-color: #ff2d78;
	}
	.post-list h2 {
		margin: 0 0 6px;
		font-size: 1.15rem;
		font-weight: 700;
		color: #f1f5f9;
	}
	.meta {
		font-size: 0.82rem;
		color: #64748b;
		display: flex;
		gap: 6px;
	}
	.meta time {
		color: #94a3b8;
	}
	.post-list p {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: #94a3b8;
	}
	.tags {
		display: flex;
		gap: 6px;
		margin-top: 8px;
	}
	.tag {
		font-size: 0.75rem;
		padding: 2px 8px;
		border-radius: 12px;
		background: #0f172a;
		color: #94a3b8;
		border: 1px solid #334155;
	}
	footer {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px;
		border-top: 1px solid #1e293b;
		text-align: center;
		font-size: 0.82rem;
		color: #64748b;
	}
	footer a {
		color: #94a3b8;
	}
</style>
` },
  { path: "src/pages/posts/[...slug].astro", content: `---
import { getCollection } from "astro:content";
import BlogPost from "../../layouts/BlogPost.astro";
import * as nba from "../../components/nba/index.js";

export async function getStaticPaths() {
	const posts = await getCollection("posts");
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { post },
	}));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogPost title={post.data.title} date={post.data.date} author={post.data.author}>
	<Content components={{
		Bar: nba.Bar,
		DonutChart: nba.DonutChart,
		PlayerCard: nba.PlayerCard,
		PlayerCompare: nba.PlayerCompare,
		ShootingSplits: nba.ShootingSplits,
		StatHighlight: nba.StatHighlight,
		LeaderboardTable: nba.LeaderboardTable,
		QuoteBlock: nba.QuoteBlock,
		HeroImage: nba.HeroImage,
	}} />
</BlogPost>
` },
  { path: "src/styles/global.css", content: `/* NBA Blog — Global Styles */

*,
*::before,
*::after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

html {
	font-size: 16px;
	color-scheme: dark;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
	background: #1e293b;
	color: #e2e8f0;
	line-height: 1.7;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

/* Typography */
h1 { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; margin: 24px 0 12px; line-height: 1.2; letter-spacing: -0.02em; }
h2 { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin: 20px 0 10px; line-height: 1.3; }
h3 { font-size: 1.1rem; font-weight: 600; color: #cbd5e1; margin: 16px 0 8px; }
h4 { font-size: 0.95rem; font-weight: 600; color: #94a3b8; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 0.05em; }

p { margin: 0 0 14px; color: #cbd5e1; }
strong { color: #f1f5f9; }
em { color: #94a3b8; }

a { color: #60a5fa; text-decoration: underline; text-underline-offset: 2px; }
a:hover { color: #93c5fd; }
a:focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; border-radius: 2px; }

/* Lists */
ul, ol { margin: 0 0 14px; padding-left: 24px; color: #cbd5e1; }
li { margin-bottom: 4px; }

/* Code */
code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #e2e8f0; }
pre { background: #1e293b; padding: 14px; border-radius: 8px; overflow-x: auto; margin: 0 0 14px; }
pre code { background: none; padding: 0; }

/* Horizontal rule */
hr { border: none; border-top: 1px solid #334155; margin: 24px 0; }

/* Images */
img { max-width: 100%; height: auto; border-radius: 8px; }

/* Tables (for markdown tables) */
table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 0.9rem; }
th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #334155; color: #94a3b8; font-weight: 600; }
td { padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }

/* Print styles */
@media print {
	body { background: white; color: #333; }
	h1, h2, h3, h4, strong { color: black; }
	p, li, td { color: #333; }
	a { color: #333; text-decoration: underline; }
	nav, footer, .skip-link { display: none; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		transition-duration: 0.01ms !important;
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
	}
}
` },
  { path: "tsconfig.json", content: `{
	"extends": "astro/tsconfigs/strict",
	"compilerOptions": {
		"jsx": "react-jsx"
	}
}
` },
];
