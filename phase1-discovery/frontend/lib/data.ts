import fs from "fs";
import path from "path";
import { formatSourceLabel } from "./sources";

export interface ProcessedDoc {
  source_type?: string;
  source_id?: string;
  published_at?: string;
  clean_body?: string;
  entities?: { brand?: string[]; categories?: string[] };
  dedupe_hash?: string;
}

export interface CorpusStats {
  totalDocuments: number;
  sourceCount: number;
  brandMentions: number;
  sourceDistribution: { source: string; count: number }[];
  summary: string | null;
  dataPath?: string;
}

function firstExistingDir(candidates: string[]): string | null {
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

function resolvePaths() {
  const cwd = process.cwd();
  const processed = firstExistingDir([
    path.join(cwd, "data", "processed"),
    path.join(cwd, "..", "data", "processed"),
  ]);
  const handoff = firstExistingDir([
    path.join(cwd, "data", "handoff"),
    path.join(cwd, "..", "outputs", "handoff"),
  ]);
  return { processed, handoff };
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function getDataPaths() {
  return resolvePaths();
}

export function loadProcessedDocuments(): ProcessedDoc[] {
  const { processed: PROCESSED_DIR } = resolvePaths();
  if (!PROCESSED_DIR) return [];

  const docs: ProcessedDoc[] = [];
  for (const file of fs.readdirSync(PROCESSED_DIR)) {
    if (!file.endsWith("_processed.json")) continue;
    const batch = readJsonFile<ProcessedDoc[]>(path.join(PROCESSED_DIR, file));
    if (batch) docs.push(...batch);
  }
  return docs;
}

export function loadSummary(): string | null {
  const { handoff: HANDOFF_DIR } = resolvePaths();
  if (!HANDOFF_DIR) return null;
  const summaryPath = path.join(HANDOFF_DIR, "PHASE1_SUMMARY.md");
  if (!fs.existsSync(summaryPath)) return null;
  return fs.readFileSync(summaryPath, "utf-8");
}

export function buildCorpusStats(docs: ProcessedDoc[]): CorpusStats {
  const { processed } = resolvePaths();
  const sourceMap = new Map<string, number>();
  let brandMentions = 0;

  for (const doc of docs) {
    const src = doc.source_type ?? "unknown";
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
    brandMentions += doc.entities?.brand?.length ?? 0;
  }

  const sourceDistribution = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalDocuments: docs.length,
    sourceCount: sourceMap.size,
    brandMentions,
    sourceDistribution,
    summary: loadSummary(),
    dataPath: processed ?? undefined,
  };
}

export function searchCorpus(
  docs: ProcessedDoc[],
  query: string,
  limit = 5,
  sourceFilter?: string | null
): ProcessedDoc[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const pool =
    sourceFilter && sourceFilter !== "all"
      ? docs.filter((d) => (d.source_type ?? "unknown") === sourceFilter)
      : docs;

  const scored = pool
    .map((doc) => {
      const text = (doc.clean_body ?? "").toLowerCase();
      const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.doc);
}

export function mockRagAnswer(
  query: string,
  matches: ProcessedDoc[],
  sourceFilter?: string | null
): string {
  const scope =
    sourceFilter && sourceFilter !== "all"
      ? ` in **${formatSourceLabel(sourceFilter)}** reviews`
      : " in the Swiggy Instamart corpus";

  if (!matches.length) {
    return `I could not find relevant documents${scope} for that query. Try keywords like habit, trust, delivery, or category.`;
  }

  const quotes = matches
    .slice(0, 3)
    .map(
      (d) =>
        `*[${d.source_type ?? "unknown"}]* "${(d.clean_body ?? "").slice(0, 120)}..."`
    )
    .join("\n\n");

  return (
    `Based on **${matches.length}** matching documents${scope}, ` +
    `themes around **${query}** point to habit loops, trust barriers, and delivery friction.\n\n` +
    `**Sample evidence:**\n\n${quotes}`
  );
}
