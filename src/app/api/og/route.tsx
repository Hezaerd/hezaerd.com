import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const colors = {
	background: "#111111",
	foreground: "#f2f2f2",
	brand: "#ffe0c2",
	mutedForeground: "#c4c4c4",
};

const portfolioName = "Hezaerd";
const primaryHeadline = "Software Engineer";
const secondaryText = "Crafting high-performance web experiences with precision.";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get("title") || primaryHeadline;
	const description = searchParams.get("description") || secondaryText;

	return new ImageResponse(
		<div
			style={{
				background: colors.background,
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "60px 80px",
				fontFamily: "sans-serif",
				boxSizing: "border-box",
			}}
		>
			<div style={{ display: "flex", alignItems: "center" }}>
				<span
					style={{
						fontSize: "64px",
						color: colors.brand,
						fontWeight: "700",
						letterSpacing: "-0.03em",
					}}
				>
					{portfolioName}
				</span>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "24px",
					marginBottom: "40px",
				}}
			>
				<h1
					style={{
						fontSize: "82px",
						fontWeight: "800",
						color: colors.foreground,
						margin: 0,
						lineHeight: 1,
						letterSpacing: "-0.04em",
						maxWidth: "900px",
					}}
				>
					{title}
				</h1>
				<p
					style={{
						fontSize: "30px",
						color: colors.mutedForeground,
						margin: 0,
						lineHeight: 1.3,
						maxWidth: "750px",
					}}
				>
					{description}
				</p>
			</div>

			<div
				style={{
					display: "flex",
					width: "100%",
					height: "2px",
					background: "#2a2a2a",
					position: "absolute",
					bottom: "60px",
					left: "0",
					marginLeft: "80px",
				}}
			/>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}