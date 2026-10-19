import { NextResponse, type NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { errors } from "@/lib/api-error";
import { AppError } from "@/lib/app-error";
import { mapPrismaError } from "@/lib/prisma-error";

export function withRouteHandler<Ctx = unknown>(
  tag: string,
  handler: (req: NextRequest, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      unstable_rethrow(error);

      if (error instanceof AppError) return errors.fromAppError(error);
      if (error instanceof ZodError) {
        return errors.badRequest(error.issues.map((issue) => issue.message));
      }

      const mapped = mapPrismaError(error);
      if (mapped) return errors.mapped(mapped);

      console.error(`[${tag}] unhandled:`, error);
      throw error;
    }
  };
}
