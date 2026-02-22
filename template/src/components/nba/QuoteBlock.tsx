import type { CSSProperties } from "react";

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
		borderLeft: `4px solid ${color}`,
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
