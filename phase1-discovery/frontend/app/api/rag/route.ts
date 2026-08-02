import { NextRequest, NextResponse } from "next/server";
import { loadProcessedDocuments, mockRagAnswer, searchCorpus } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const query = (body.query as string)?.trim();
  const source = (body.source as string) ?? "all";

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  const docs = loadProcessedDocuments();
  const matches = searchCorpus(docs, query, 8, source);
  const answer = mockRagAnswer(query, matches, source);

  return NextResponse.json({
    query,
    sourceFilter: source,
    matchCount: matches.length,
    answer,
    sources: matches.slice(0, 3).map((d) => ({
      source_type: d.source_type,
      excerpt: (d.clean_body ?? "").slice(0, 150),
    })),
  });
}
