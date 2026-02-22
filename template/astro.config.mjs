import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "static",
	integrations: [mdx(), react()],
	adapter: cloudflare(),
});
