import { NextResponse } from "next/server";
import { runUXSimulation } from "@/lib/uxAgent";

export async function POST(req: Request) {
  const body = await req.json();

  const url = String(body.url || "");
  const goal = String(body.goal || "");

  if (!url.startsWith("http")) {
    return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
  }
  if (goal.trim().length < 5) {
    return NextResponse.json({ error: "Goal is too short" }, { status: 400 });
  }

  const result = await runUXSimulation({ url, goal });

  return NextResponse.json({
    mode: body.mode || "before_release",
    confidence_score: result.score,
    ux_frictions: result.frictions,
  });
}