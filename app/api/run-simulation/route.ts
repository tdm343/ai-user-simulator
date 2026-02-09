import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    mode: body.mode,
    confidence_score: 61,
    ux_frictions: [
      "Primary action is unclear on first screen.",
      "User hesitated: too many choices before first success.",
      "CTA text does not explain what happens next.",
      "User had to scroll to understand the product value.",
    ],
  });
}