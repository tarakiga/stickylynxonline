import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const { handle } = params;
  const url = new URL(request.url);
  const access = url.searchParams.get("access") || "";
  const pin = url.searchParams.get("pin") || "";

  const page = await prisma.page.findUnique({
    where: { handle },
    include: { user: true },
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if ((page.category as any) !== "PROJECT_PORTAL") {
    return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  }

  const p: any = page as any;
  const now = new Date();
  const revoked = !!p.clientAccessRevoked;
  const expired = !!p.clientAccessExpiresAt && now > p.clientAccessExpiresAt;

  let ok = false;
  let val = "";
  if (access && !revoked && !expired && p.clientAccessTokenHash) {
    const hash = sha256Hex(access);
    ok = hash === p.clientAccessTokenHash;
    val = hash;
  } else if (pin && p.clientPinEnabled && p.clientPinHash) {
    const hash = sha256Hex(pin);
    ok = hash === p.clientPinHash;
    val = hash;
  }

  if (!ok) {
    return NextResponse.json({ error: "Invalid access" }, { status: 401 });
  }

  await prisma.page.update({
    where: { id: page.id },
    data: { lastClientAccessAt: now } as any,
  });

  const res = NextResponse.redirect(new URL(`/${handle}`, request.url));
  res.cookies.set(`portal_access_${page.id}`, val, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
