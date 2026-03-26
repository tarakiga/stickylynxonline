import { NextResponse } from "next/server";
import { verifyTransport } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await verifyTransport();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: String(result.error || "Unknown error") }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
