import type { CSSProperties } from "react";

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
		background: `linear-gradient(135deg, ${colorLeft}22 0%, #0f172a 40%, #0f172a 60%, ${colorRight}22 100%)`,
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
