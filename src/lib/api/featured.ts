import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRouteHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { parseJsonBody } from "@/lib/validate";
import z from "zod";

const featuredSchema = z.object({
  featured: z.boolean(),
});

type Context = { params: Promise<{ slug: string }> };

type FeaturedToggleConfig<T> = {
  logTag: string;
  notFoundMessage: string;
  revalidatePaths: string[];
  find: (slug: string) => Promise<{ id: string } | null>;
  update: (slug: string, featured: boolean) => Promise<T>;
};

export function createFeaturedToggleHandler<T>(
  config: FeaturedToggleConfig<T>
) {
  return withRouteHandler<Context>(
    config.logTag,
    async (req, { params }) => {
      const { response } = await requireAdmin();
      if (response) return response;

      const { slug } = await params;
      const parsed = await parseJsonBody(req, featuredSchema);
      if (!parsed.ok) return parsed.response;
      const body = parsed.data;

      const existing = await config.find(slug);
      if (!existing) {
        return NextResponse.json(
          { error: config.notFoundMessage },
          { status: 404 }
        );
      }

      const data = await config.update(slug, body.featured);

      config.revalidatePaths.forEach((path) => revalidatePath(path));

      return NextResponse.json(
        { data, success: true, message: "Featured status updated" },
        { status: 200 }
      );
    }
  );
}
