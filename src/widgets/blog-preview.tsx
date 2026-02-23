/**
 * Blog preview widget — MCP App resource that renders MDX blog posts
 * with all NBA visualization components.
 *
 * Receives MDX content via the MCP Apps postMessage protocol and
 * renders it using @mdx-js/mdx evaluate() with the full component library.
 */
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { evaluate } from "@mdx-js/mdx";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

// Import all NBA components
import { Bar } from "../components/Bar.js";
import { DonutChart } from "../components/DonutChart.js";
import { PlayerCard } from "../components/PlayerCard.js";
import { PlayerCompare } from "../components/PlayerCompare.js";
import { ShootingSplits } from "../components/ShootingSplits.js";
import { StatHighlight } from "../components/StatHighlight.js";
import { LeaderboardTable } from "../components/LeaderboardTable.js";
import { QuoteBlock } from "../components/QuoteBlock.js";
import { HeroImage } from "../components/HeroImage.js";

// Component map for MDX rendering
const components = {
	Bar,
	DonutChart,
	PlayerCard,
	PlayerCompare,
	ShootingSplits,
	StatHighlight,
	LeaderboardTable,
	QuoteBlock,
	HeroImage,
};

// ── Styles ───────────────────────────────────────────────────────────────────

const blogStyles = `
	* { box-sizing: border-box; margin: 0; padding: 0; }
	html { font-size: 18px; }
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		background: #0f172a;
		color: #e2e8f0;
		line-height: 1.7;
		padding: 16px;
		-webkit-font-smoothing: antialiased;
	}
	#root {
		max-width: 860px;
		margin: 0 auto;
	}
	h1 { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; margin: 24px 0 12px; line-height: 1.2; }
	h2 { font-size: 1.3rem; font-weight: 700; color: #f1f5f9; margin: 20px 0 10px; line-height: 1.3; }
	h3 { font-size: 1.1rem; font-weight: 600; color: #cbd5e1; margin: 16px 0 8px; }
	p { margin: 0 0 14px; color: #cbd5e1; }
	strong { color: #f1f5f9; }
	em { color: #94a3b8; }
	a { color: #60a5fa; text-decoration: underline; }
	ul, ol { margin: 0 0 14px; padding-left: 24px; color: #cbd5e1; }
	li { margin-bottom: 4px; }
	hr { border: none; border-top: 1px solid #334155; margin: 24px 0; }
	code { background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
	pre { background: #1e293b; padding: 14px; border-radius: 8px; overflow-x: auto; margin: 0 0 14px; }
	pre code { background: none; padding: 0; }
	@media print {
		body { background: white; color: black; }
		h1, h2, h3, strong { color: black; }
		p, li { color: #333; }
	}
	@media (prefers-reduced-motion: reduce) {
		* { transition: none !important; animation: none !important; }
	}
`;

// ── MDX Renderer ─────────────────────────────────────────────────────────────

function MDXRenderer({ mdxContent }: { mdxContent: string }) {
	const [Content, setContent] = useState<React.ComponentType<any> | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function compileMDX() {
			try {
				// Strip frontmatter before evaluating
				const stripped = mdxContent.replace(/^---[\s\S]*?---\n?/, "");

				const result = await evaluate(stripped, {
					Fragment,
					jsx: jsx as any,
					jsxs: jsxs as any,
					development: false,
				});

				if (!cancelled) {
					setContent(() => result.default);
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err));
					setContent(null);
				}
			}
		}

		compileMDX();
		return () => { cancelled = true; };
	}, [mdxContent]);

	if (error) {
		return (
			<div style={{ background: "#7f1d1d", borderRadius: 8, padding: 16, margin: "16px 0" }}>
				<div style={{ fontWeight: 700, color: "#fca5a5", marginBottom: 8 }}>MDX Compilation Error</div>
				<pre style={{ color: "#fecaca", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{error}</pre>
			</div>
		);
	}

	if (!Content) {
		return (
			<div style={{ textAlign: "center", color: "#94a3b8", padding: "36px 0" }}>
				Compiling MDX...
			</div>
		);
	}

	return <Content components={components} />;
}

// ── App Wrapper ──────────────────────────────────────────────────────────────

function BlogPreviewApp() {
	const [mdxContent, setMdxContent] = useState<string | null>(null);
	const [dataError, setDataError] = useState<string | null>(null);

	const { isConnected, error } = useApp({
		appInfo: { name: "NBA Blog Preview", version: "1.0.0" },
		capabilities: {},
		onAppCreated: (app) => {
			app.ontoolresult = (result) => {
				// Find the JSON content item containing the MDX payload
				const jsonContent = result.content
					?.filter(
						(c): c is typeof c & { type: "text"; text: string } =>
							c.type === "text" && "text" in c,
					)
					.find((c) => {
						try {
							const parsed = JSON.parse(c.text);
							return typeof parsed === "object" && "mdx" in parsed;
						} catch {
							return false;
						}
					});

				if (jsonContent) {
					try {
						const payload = JSON.parse(jsonContent.text) as { mdx: string };
						setMdxContent(payload.mdx);
					} catch {
						setDataError("Failed to parse blog post data");
					}
				}
			};
			app.onerror = (e) => setDataError(e.message);
		},
	});

	// Standalone demo mode: render demo data directly, before checking for MCP errors.
	// useApp() will fail with -32601 when there is no MCP client present (e.g. landing
	// page), so we must handle this case before surfacing that error.
	const demoData = (window as Window & { __DEMO_DATA__?: { mdx: string } }).__DEMO_DATA__;
	if (demoData?.mdx && !isConnected) {
		return (
			<>
				<style dangerouslySetInnerHTML={{ __html: blogStyles }} />
				<MDXRenderer mdxContent={demoData.mdx} />
			</>
		);
	}

	if (error ?? dataError) {
		return (
			<div style={{ textAlign: "center", color: "#f87171", padding: "36px 0" }}>
				Error: {(error?.message ?? dataError) ?? "Unknown error"}
			</div>
		);
	}

	if (!isConnected || !mdxContent) {
		return (
			<div style={{ textAlign: "center", color: "#94a3b8", padding: "36px 0" }}>
				Waiting for blog post content...
			</div>
		);
	}

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: blogStyles }} />
			<MDXRenderer mdxContent={mdxContent} />
		</>
	);
}

// ── Mount ─────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BlogPreviewApp />
	</StrictMode>,
);
