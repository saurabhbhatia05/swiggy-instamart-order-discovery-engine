import { NextResponse } from "next/server";
import { buildCorpusStats, loadProcessedDocuments } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const docs = loadProcessedDocuments();
  const stats = buildCorpusStats(docs);
  return NextResponse.json(stats);
}
