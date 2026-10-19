import "server-only";

import { NextRequest, NextResponse } from "next/server";

export const VISITOR_COOKIE = "visitor_id";

const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

export function getVisitorId(request: NextRequest): string | null {
  return request.cookies.get(VISITOR_COOKIE)?.value ?? null;
}

export function setVisitorIdCookie(response: NextResponse, id: string): void {
  response.cookies.set(VISITOR_COOKIE, id, {
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: "lax",
  });
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export function resolveVisitor(request: NextRequest): {
  visitorId: string;
  isNew: boolean;
} {
  const existing = getVisitorId(request);
  return existing
    ? { visitorId: existing, isNew: false }
    : { visitorId: crypto.randomUUID(), isNew: true };
}
