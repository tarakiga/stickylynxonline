import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") || "";
  const pin = url.searchParams.get("pin") || "";

  if (!handle || !pin) {
    return NextResponse.json({ error: "Missing handle or pin" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (page.category !== "PROJECT_PORTAL") {
    return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  }
  const now = new Date();

  let ok = false;
  let val = "";
  if (pin && page.clientPinEnabled && page.clientPinHash) {
    const hash = sha256Hex(pin);
    ok = hash === page.clientPinHash;
    val = hash;
  }

  if (!ok) {
    return NextResponse.json({ error: "Invalid access" }, { status: 401 });
  }

  await prisma.page.update({
    where: { id: page.id },
    data: { lastClientAccessAt: now },
  });

  const res = NextResponse.redirect(new URL(`/${handle}`, request.url));
  res.cookies.set(`portal_access_${page.id}`, val, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
