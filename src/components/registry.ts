/**
 * Component registry — maps component names to their descriptions, prop types,
 * and MDX usage examples. Used by the `list_components` tool to give Claude
 * full awareness of what's available when composing blog posts.
 */

export type ComponentInfo = {
	name: string;
	description: string;
	props: { name: string; type: string; required: boolean; description: string }[];
	mdxExample: string;
};

export const componentRegistry: ComponentInfo[] = [
	{
		name: "PlayerCompare",
		description:
			"Side-by-side player comparison with stat bars and shooting splits. The main visualization component.",
		props: [
			{ name: "player1", type: "{ name, team, position, height?, weight?, stats?: { ppg?, rpg?, apg?, spg?, bpg?, fg_pct?, fg3_pct?, ft_pct? } }", required: true, description: "First player data with stats" },
			{ name: "player2", type: "same as player1", required: true, description: "Second player data with stats" },
			{ name: "season", type: "string", required: false, description: "Season label (e.g. '2024-25')" },
		],
		mdxExample: `<PlayerCompare
  player1={{
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    position: "C",
    height: "6'11\\"",
    weight: "284 lbs",
    stats: { ppg: 26.4, rpg: 12.4, apg: 9.0, fg_pct: 58.3, fg3_pct: 35.9, ft_pct: 81.7 }
  }}
  player2={{
    name: "Joel Embiid",
    team: "Philadelphia 76ers",
    position: "C",
    height: "7'0\\"",
    weight: "280 lbs",
    stats: { ppg: 33.1, rpg: 10.2, apg: 4.2, fg_pct: 52.9, fg3_pct: 38.8, ft_pct: 88.3 }
  }}
  season="2023-24"
/>`,
	},
	{
		name: "PlayerCard",
		description:
			"Single player info card showing name, team, position, and physical attributes.",
		props: [
			{ name: "name", type: "string", required: true, description: "Player's full name" },
			{ name: "team", type: "string", required: true, description: "Team full name" },
			{ name: "position", type: "string", required: true, description: "Position (PG, SG, SF, PF, C)" },
			{ name: "height", type: "string", required: false, description: "Height (e.g. 6'11\")" },
			{ name: "weight", type: "string", required: false, description: "Weight (e.g. 284 lbs)" },
			{ name: "color", type: "string", required: false, description: "Accent color (default: #ff2d78)" },
		],
		mdxExample: `<PlayerCard
  name="LeBron James"
  team="Los Angeles Lakers"
  position="SF"
  height="6'9\\""
  weight="250 lbs"
/>`,
	},
	{
		name: "StatHighlight",
		description:
			"Callout box highlighting a single impressive stat. Use for standout numbers.",
		props: [
			{ name: "value", type: "string", required: true, description: "The stat value (e.g. '26.4 PPG')" },
			{ name: "label", type: "string", required: true, description: "Context or description" },
			{ name: "playerName", type: "string", required: false, description: "Player name for attribution" },
			{ name: "color", type: "string", required: false, description: "Accent color (default: #00e5ff)" },
		],
		mdxExample: `<StatHighlight
  value="26.4 PPG"
  label="Led all centers in scoring for the third consecutive season"
  playerName="Nikola Jokic"
/>`,
	},
	{
		name: "LeaderboardTable",
		description:
			"Ranked table showing players ordered by a specific stat. Great for top-5 or top-10 lists.",
		props: [
			{ name: "title", type: "string", required: true, description: "Table title" },
			{ name: "statLabel", type: "string", required: true, description: "Column header for the stat" },
			{ name: "entries", type: "{ rank, name, team, value }[]", required: true, description: "Array of ranked entries" },
			{ name: "highlightColor", type: "string", required: false, description: "Color for #1 rank (default: gold)" },
		],
		mdxExample: `<LeaderboardTable
  title="Points Per Game Leaders"
  statLabel="PPG"
  entries={[
    { rank: 1, name: "Joel Embiid", team: "PHI", value: 33.1 },
    { rank: 2, name: "Luka Doncic", team: "DAL", value: 32.4 },
    { rank: 3, name: "Giannis Antetokounmpo", team: "MIL", value: 30.4 },
    { rank: 4, name: "Shai Gilgeous-Alexander", team: "OKC", value: 30.1 },
    { rank: 5, name: "Kevin Durant", team: "PHX", value: 27.1 }
  ]}
/>`,
	},
	{
		name: "QuoteBlock",
		description:
			"Styled pull-quote for editorial commentary or player/analyst quotes.",
		props: [
			{ name: "children", type: "string", required: true, description: "The quote text (passed as JSX children)" },
			{ name: "attribution", type: "string", required: false, description: "Who said it" },
			{ name: "color", type: "string", required: false, description: "Accent color (default: #ff2d78)" },
		],
		mdxExample: `<QuoteBlock attribution="Charles Barkley, TNT">
  He's not just the best center in the league, he's the best player in the league. Period.
</QuoteBlock>`,
	},
	{
		name: "HeroImage",
		description:
			"Blog post header with title, subtitle, and gradient background using team colors. Use as the first element in a blog post.",
		props: [
			{ name: "title", type: "string", required: true, description: "Blog post title" },
			{ name: "subtitle", type: "string", required: false, description: "Subtitle or tagline" },
			{ name: "colorLeft", type: "string", required: false, description: "Left gradient color (default: #ff2d78)" },
			{ name: "colorRight", type: "string", required: false, description: "Right gradient color (default: #00e5ff)" },
			{ name: "date", type: "string", required: false, description: "Publication date" },
			{ name: "author", type: "string", required: false, description: "Author name" },
		],
		mdxExample: `<HeroImage
  title="Jokic vs Embiid: The MVP Race Heats Up"
  subtitle="Breaking down the numbers behind the NBA's fiercest rivalry"
  colorLeft="#552583"
  colorRight="#006BB6"
  date="2024-03-15"
  author="NBA Blog Studio"
/>`,
	},
	{
		name: "Bar",
		description:
			"Horizontal stat bar for visual comparison. Usually used inside PlayerCompare, but can be used standalone.",
		props: [
			{ name: "value", type: "number", required: true, description: "Stat value" },
			{ name: "max", type: "number", required: true, description: "Maximum value for scale" },
			{ name: "color", type: "string", required: true, description: "Bar fill color" },
			{ name: "label", type: "string", required: false, description: "Accessible label" },
		],
		mdxExample: `<Bar value={26.4} max={35} color="#ff2d78" label="Jokic PPG: 26.4" />`,
	},
	{
		name: "DonutChart",
		description:
			"Donut/ring chart showing a percentage. Usually used inside ShootingSplits, but can be standalone.",
		props: [
			{ name: "pct", type: "number", required: true, description: "Percentage (0-100)" },
			{ name: "color", type: "string", required: true, description: "Fill color" },
			{ name: "label", type: "string", required: true, description: "Caption text" },
		],
		mdxExample: `<DonutChart pct={58.3} color="#ff2d78" label="Jokic FG%" />`,
	},
	{
		name: "ShootingSplits",
		description:
			"Shooting percentage comparison table with donut charts. Shows FG%, 3P%, and FT% for two players.",
		props: [
			{ name: "player1Name", type: "string", required: true, description: "First player name" },
			{ name: "player2Name", type: "string", required: true, description: "Second player name" },
			{ name: "player1FgPct", type: "number", required: false, description: "Player 1 FG%" },
			{ name: "player1Fg3Pct", type: "number", required: false, description: "Player 1 3P%" },
			{ name: "player1FtPct", type: "number", required: false, description: "Player 1 FT%" },
			{ name: "player2FgPct", type: "number", required: false, description: "Player 2 FG%" },
			{ name: "player2Fg3Pct", type: "number", required: false, description: "Player 2 3P%" },
			{ name: "player2FtPct", type: "number", required: false, description: "Player 2 FT%" },
			{ name: "selected", type: '"fg_pct" | "fg3_pct" | "ft_pct"', required: false, description: "Which split to show donuts for (default: fg_pct)" },
		],
		mdxExample: `<ShootingSplits
  player1Name="Nikola Jokic"
  player2Name="Joel Embiid"
  player1FgPct={58.3}
  player1Fg3Pct={35.9}
  player1FtPct={81.7}
  player2FgPct={52.9}
  player2Fg3Pct={38.8}
  player2FtPct={88.3}
  selected="fg_pct"
/>`,
	},
];
