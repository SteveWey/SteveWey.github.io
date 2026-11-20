import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const entryId = ({ entry }: { entry: string }) =>
  entry.replace(/\/index\.md$/, "").replace(/\.md$/, "");

const notes = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./src/content/notes",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: z.string(),
    kind: z.enum(["tech", "study"]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).optional(),
    status: z.string().default("已整理"),
    draft: z.boolean().default(false),
  }),
});

const excerpts = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./src/content/excerpts",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    text: z.string().optional(),
    source: z.string(),
    sourceTitle: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.string().default("已归档"),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    order: z.number().default(0),
  }),
});

const collectionEntries = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./src/content/collections",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    platform: z.string(),
    url: z.union([z.url(), z.literal("")]),
    people: z.array(z.string()).default([]),
    note: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    status: z.string().default("已收藏"),
  }),
});

const music = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./src/content/music",
    generateId: entryId,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    artist: z.string(),
    album: z.string().default(""),
    genre: z.string().default(""),
    audio: z.string(),
    lyrics: z.string().optional(),
    cover: z.string().optional(),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    favorite: z.boolean().default(false),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { notes, excerpts, collections: collectionEntries, music };
