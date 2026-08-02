import { NextRequest, NextResponse } from "next/server";
import { loadProcessedDocuments } from "@/lib/data";
import { analyzeResearchQuestions } from "@/lib/researchQuestions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") ?? "all";
  const docs = loadProcessedDocuments();
  const filtered =
    source !== "all"
      ? docs.filter((d) => (d.source_type ?? "unknown") === source)
      : docs;

  const answers = analyzeResearchQuestions(docs, source);

  return NextResponse.json({
    corpusSize: filtered.length,
    totalCorpusSize: docs.length,
    sourceFilter: source,
    generatedAt: new Date().toISOString(),
    questions: answers,
  });
}