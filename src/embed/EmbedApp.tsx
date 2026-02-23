/**
 * NBA Stats Embed — iframe app.
 *
 * Reads URL search params, calls /api/stats on the same origin, then renders
 * the matching component. Designed to be embedded as an <iframe> on any CMS
 * (Hashnode, WordPress, Ghost, Substack, etc.).
 *
 * URL format:
 *   /embed?component=player-compare&player1=Nikola+Jokic&player2=SGA&season=2024-25
 *   /embed?component=leaderboard&stat=ppg&season=2024-25
 *   /embed?component=stat-highlight&player1=Nikola+Jokic&stat=ppg&season=2024-25
 *   /embed?component=player-card&player1=LeBron+James&season=2024-25
 */

import { StrictMode, useState, useEffect, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { PlayerCompare } from "../components/PlayerCompare.js";
import { LeaderboardTable } from "../components/LeaderboardTable.js";
import { StatHighlight } from "../components/StatHighlight.js";
import { PlayerCard } from "../components/PlayerCard.js";

// ── Types mirroring stats API responses ──────────────────────────────────────

type ComponentType = "player-compare" | "leaderboard" | "stat-highlight" | "player-card";

// ── Styles ────────────────────────────────────────────────────────────────────

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    -webkit-font-smoothing: antialiased;
    height: 100%;
  }
  #root { padding: 12px; }
`;

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingState({ component }: { component: string }) {
	const skeletonStyle: CSSProperties = {
		background: "#1e293b",
		borderRadius: 12,
		padding: 20,
		animation: "pulse 1.5s ease-in-out infinite",
	};
	const lineStyle = (w: string, h = 16): CSSProperties => ({
		background: "#334155",
		borderRadius: 4,
		height: h,
		width: w,
		marginBottom: 12,
	});

	const heights: Record<string, number[]> = {
		"player-compare": [200, 60, 60, 60, 60],
		"leaderboard": [40, 40, 40, 40, 40],
		"stat-highlight": [120],
		"player-card": [80],
	};

	return (
		<>
			<style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
			<div style={skeletonStyle}>
				<div style={lineStyle("60%", 20)} />
				{(heights[component] ?? [80, 60]).map((h, i) => (
					<div key={i} style={lineStyle("100%", h)} />
				))}
			</div>
		</>
	);
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
	return (
		<div
			style={{
				background: "#1e293b",
				border: "1px solid #ef4444",
				borderRadius: 12,
				padding: 20,
				color: "#fca5a5",
				fontSize: "0.9rem",
			}}
		>
			<strong style={{ color: "#f87171", display: "block", marginBottom: 6 }}>
				Could not load stats
			</strong>
			{message}
		</div>
	);
}

// ── Component renderer ────────────────────────────────────────────────────────

function ComponentRenderer({ component, data }: { component: ComponentType; data: unknown }) {
	switch (component) {
		case "player-compare":
			return <PlayerCompare {...(data as React.ComponentProps<typeof PlayerCompare>)} />;
		case "leaderboard":
			return <LeaderboardTable {...(data as React.ComponentProps<typeof LeaderboardTable>)} />;
		case "stat-highlight":
			return <StatHighlight {...(data as React.ComponentProps<typeof StatHighlight>)} />;
		case "player-card":
			return <PlayerCard {...(data as React.ComponentProps<typeof PlayerCard>)} />;
		default:
			return <ErrorState message={`Unknown component type: "${component}"`} />;
	}
}

// ── Root App ──────────────────────────────────────────────────────────────────

function EmbedApp() {
	const params = new URLSearchParams(window.location.search);
	const component = (params.get("component") ?? "") as ComponentType;

	const [data, setData] = useState<unknown>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!component) {
			setError('Missing required "component" URL parameter.');
			setLoading(false);
			return;
		}

		// Same origin as this page — works because the embed page is served by
		// the same Worker that exposes /api/stats.
		const apiUrl = new URL("/api/stats", window.location.origin);
		params.forEach((v, k) => apiUrl.searchParams.set(k, v));

		fetch(apiUrl.toString())
			.then((r) => {
				if (!r.ok) {
					return r.json().then((body: { error?: string }) => {
						throw new Error(body.error ?? `HTTP ${r.status}`);
					});
				}
				return r.json();
			})
			.then((json) => {
				setData(json);
				setLoading(false);

				// Notify parent frame of content height so it can resize the iframe
				const height = document.getElementById("root")?.scrollHeight;
				if (height && window.parent !== window) {
					window.parent.postMessage({ type: "nba-embed-resize", height }, "*");
				}
			})
			.catch((err: Error) => {
				setError(err.message);
				setLoading(false);
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: globalStyles }} />
			{loading && <LoadingState component={component} />}
			{error && <ErrorState message={error} />}
			{!loading && !error && data && (
				<ComponentRenderer component={component} data={data} />
			)}
		</>
	);
}

// ── Mount ─────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<EmbedApp />
	</StrictMode>,
);
