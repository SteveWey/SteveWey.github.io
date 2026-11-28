import { getCollection, type CollectionEntry } from "astro:content";
import { threads, type Thread } from "../data/threads";

export type NoteEntry = CollectionEntry<"notes">;
export type ExcerptEntry = CollectionEntry<"excerpts">;
export type CollectionEntryType = CollectionEntry<"collections">;
export type MusicEntry = CollectionEntry<"music">;

type Sluggable = { id: string; data: { slug?: string } };

export function getEntrySlug(entry: Sluggable): string {
  return entry.data.slug ?? entry.id;
}

function assertUniqueSlugs(entries: Sluggable[], label: string): void {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const slug = getEntrySlug(entry);
    const previous = seen.get(slug);
    if (previous) {
      throw new Error(
        `[${label}] slug 重复：「${previous}」和「${entry.id}」都使用 "${slug}"`
      );
    }
    seen.set(slug, entry.id);
  }
}

export type ActivityItem = {
  type: "音乐" | "笔记" | "摘抄" | "收藏";
  title: string;
  description?: string;
  href: string;
  date: Date;
  tags: string[];
};

const timestamp = (entry: { data: { date: Date; updated?: Date } }) =>
  (entry.data.updated ?? entry.data.date).getTime();

const byDateDesc = <T extends { data: { date: Date; updated?: Date } }>(a: T, b: T) =>
  timestamp(b) - timestamp(a);

export async function getNotes(): Promise<NoteEntry[]> {
  const notes = (await getCollection("notes", ({ data }) => !data.draft)).sort(byDateDesc);
  assertUniqueSlugs(notes, "notes");
  return notes;
}

export async function getExcerpts(): Promise<ExcerptEntry[]> {
  const excerpts = (await getCollection("excerpts")).sort(
    (a, b) => byDateDesc(a, b) || a.data.order - b.data.order
  );
  assertUniqueSlugs(excerpts, "excerpts");
  return excerpts;
}

export async function getCollections(): Promise<CollectionEntryType[]> {
  return (await getCollection("collections")).sort(byDateDesc);
}

export async function getMusic(): Promise<MusicEntry[]> {
  const music = await getCollection("music");
  const collator = new Intl.Collator("zh-Hans-CN", {
    numeric: true,
    sensitivity: "base",
  });
  const sorted = music.sort((a, b) => collator.compare(a.data.title, b.data.title));
  assertUniqueSlugs(sorted, "music");
  return sorted;
}

export async function getFavoriteMusic(): Promise<MusicEntry[]> {
  return (await getMusic()).filter((entry) => entry.data.favorite).slice(0, 2);
}

export async function getThreadsWithNotes(): Promise<
  Array<Thread & { noteEntries: NoteEntry[] }>
> {
  const notes = await getNotes();

  return threads.map((thread) => ({
    ...thread,
    noteEntries: notes.filter((note) => note.data.tags.includes(thread.tag)),
  }));
}

export async function recentActivity(limit = 6): Promise<ActivityItem[]> {
  const [notes, excerpts, collections, music] = await Promise.all([
    getNotes(),
    getExcerpts(),
    getCollections(),
    getMusic(),
  ]);

  const mainlineTags = new Set(threads.map((thread) => thread.tag));
  const outsideNotes = notes.filter(
    (note) => !note.data.tags.some((tag) => mainlineTags.has(tag))
  );

  const items: ActivityItem[] = [
    ...outsideNotes.map((note) => ({
      type: "笔记" as const,
      title: note.data.title,
      description: note.data.description,
      href: `/notes/${getEntrySlug(note)}/`,
      date: note.data.updated ?? note.data.date,
      tags: note.data.tags,
    })),
    ...excerpts.map((excerpt) => ({
      type: "摘抄" as const,
      title: excerpt.data.title,
      description: excerpt.data.source,
      href: `/excerpts/${getEntrySlug(excerpt)}/`,
      date: excerpt.data.updated ?? excerpt.data.date,
      tags: excerpt.data.tags,
    })),
    ...collections.map((collection) => ({
      type: "收藏" as const,
      title: collection.data.title,
      description: collection.data.people.join(" & ") || collection.data.platform,
      href: `/collections/#${collection.id}`,
      date: collection.data.updated ?? collection.data.date,
      tags: collection.data.tags,
    })),
  ];

  if (music.length > 0) {
    const latest = music.reduce((current, track) => {
      const currentDate = current.data.updated ?? current.data.date;
      const trackDate = track.data.updated ?? track.data.date;
      return trackDate > currentDate ? track : current;
    }, music[0]);
    items.push({
      type: "音乐",
      title: music.length > 1 ? `音乐收藏 · ${music.length} 首` : music[0].data.title,
      description: music.map((track) => track.data.title).join(" / "),
      href: "/music/",
      date: latest.data.updated ?? latest.data.date,
      tags: [...new Set(music.flatMap((track) => track.data.tags))],
    });
  }

  const typeOrder = { 音乐: 0, 笔记: 1, 摘抄: 2, 收藏: 3 } as const;
  const sorted = items.sort(
    (a, b) =>
      b.date.getTime() - a.date.getTime() ||
      typeOrder[a.type] - typeOrder[b.type]
  );

  // Keep the feed varied: one latest item from each type first, then fill
  // the remaining slots by date.
  const selected: ActivityItem[] = [];
  for (const type of ["音乐", "笔记", "摘抄", "收藏"] as const) {
    const first = sorted.find((item) => item.type === type);
    if (first) selected.push(first);
  }
  for (const item of sorted) {
    if (selected.length >= limit) break;
    if (!selected.includes(item)) selected.push(item);
  }

  return selected
    .sort(
      (a, b) =>
        b.date.getTime() - a.date.getTime() ||
        typeOrder[a.type] - typeOrder[b.type]
    )
    .slice(0, limit);
}

export function formatDate(date: Date, style: "short" | "full" = "short"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return style === "full" ? `${year}.${month}.${day}` : `${month}.${day}`;
}

export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`\-\[\]()]/g, " ");
  const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(chinese / 300 + words / 220));
}

export function tagCounts(items: Array<{ data: { tags: string[] } }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return new Map([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")));
}
