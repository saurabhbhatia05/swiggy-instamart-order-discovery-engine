import { NextResponse } from "next/server";
import { loadHypotheses } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ hypotheses: loadHypotheses() });
}
