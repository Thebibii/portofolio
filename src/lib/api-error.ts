import { NextResponse } from "next/server";
import type { AppError } from "@/lib/app-error";

export type ApiErrorBody = { error: string | string[] };

export const jsonError = (status: number, error: string | string[]) =>
  NextResponse.json<ApiErrorBody>({ error }, { status });

export const errors = {
  unauthorized: () => jsonError(401, "Authentication required"),
  forbidden: () => jsonError(403, "Forbidden"),
  badRequest: (issues: string[]) => jsonError(400, issues),
  notFound: (entity = "Data") => jsonError(404, `${entity} tidak ditemukan`),
  conflict: (message: string) => jsonError(409, message),
  server: () => jsonError(500, "Terjadi kesalahan pada server"),
  fromAppError: (e: AppError) => jsonError(e.status, e.message),
  mapped: (e: { status: number; error: string }) => jsonError(e.status, e.error),
};
