import { NextRequest, NextResponse } from "next/server";
import { loadProcessedDocuments } from "@/lib/data";
import { analyzeResearchQuestions, RESEARCH_QUESTION_OPTIONS } from "@/lib/researchQuestions";
import { formatSourceLabel } from "@/lib/sources";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const source = (body.source as string) ?? "all";
  const questionId = (body.question as string) ?? "Q1";

  const docs = loadProcessedDocuments();
  if (!docs.length) {
    return NextResponse.json(
      {
        error: "Corpus not found. Run npm run build locally or check Vercel data bundle.",
        corpusSize: 0,
        totalCorpusSize: 0,
      },
      { status: 503 }
    );
  }

  const filtered =
    source !== "all"
      ? docs.filter((d) => (d.source_type ?? "unknown") === source)
      : docs;

  const allAnswers = analyzeResearchQuestions(docs, source);
  const answer = allAnswers.find((a) => a.id === questionId);

  if (!answer) {
    return NextResponse.json({ error: `Unknown question: ${questionId}` }, { status: 400 });
  }

  const questionMeta = RESEARCH_QUESTION_OPTIONS.find((q) => q.value === questionId);

  return NextResponse.json({
    sourceFilter: source,
    sourceLabel: source === "all" ? "all sources" : formatSourceLabel(source),
    questionId,
    questionLabel: questionMeta?.label ?? questionId,
    corpusSize: filtered.length,
    totalCorpusSize: docs.length,
    generatedAt: new Date().toISOString(),
    result: answer,
  });
}
