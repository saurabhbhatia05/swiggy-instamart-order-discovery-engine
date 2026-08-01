import { NextRequest, NextResponse } from "next/server";
import { loadProcessedDocuments } from "@/lib/data";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
  const source = request.nextUrl.searchParams.get("source");
  let docs = loadProcessedDocuments();

  if (source) {
    docs = docs.filter((d) => d.source_type === source);
  }

  const sample = docs.slice(0, limit).map((d) => ({
    source_type: d.source_type,
    published_at: d.published_at,
    clean_body: (d.clean_body ?? "").slice(0, 300),
    categories: d.entities?.categories ?? [],
  }));

  return NextResponse.json({ total: docs.length, documents: sample });
}
