import { defineCollection, z } from "astro:content";

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
