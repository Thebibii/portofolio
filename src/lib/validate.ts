import type { NextRequest } from "next/server";
import { z, type ZodType } from "zod";
import { errors } from "@/lib/api-error";

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: ReturnType<typeof errors.badRequest> };

function parseWith<T>(schema: ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    response: errors.badRequest(
      result.error.issues.map((issue) => issue.message)
    ),
  };
}

export async function parseJsonBody<T>(
  req: NextRequest,
  schema: ZodType<T>
) {
  return parseWith(schema, await req.json());
}

export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodType<T>
) {
  return parseWith(schema, Object.fromEntries(searchParams));
}

export function parseId(value: unknown): number | null {
  const result = z.coerce.number().int().positive().safeParse(value);
  return result.success ? result.data : null;
}
