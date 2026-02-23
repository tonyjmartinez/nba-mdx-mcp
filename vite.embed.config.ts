/**
 * Vite config for the standalone embed iframe page.
 * Builds embed.html → dist-embed/embed.html (single inlined file).
 * Run via: npm run build:embed
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	plugins: [react(), viteSingleFile()],
	build: {
		rollupOptions: {
			input: "embed.html",
		},
		outDir: "dist-embed",
		emptyOutDir: true,
	},
});
