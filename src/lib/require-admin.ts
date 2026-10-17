import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type RequireAdminResult =
  | { session: Session; response: null }
  | { session: null; response: NextResponse };

/**
 * Guard untuk route admin: memastikan request punya sesi login yang valid.
 *
 * Pemakaian:
 *   const { session, response } = await requireAdmin();
 *   if (response) return response;
 *   // ...lanjut pakai `session`
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const session = await getServerSession(authOptions);

  // `id` hanya diisi oleh callback session saat token valid.
  // Sesi yang di-invalidasi (tokenVersion tidak cocok) tidak punya `id`.
  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}
