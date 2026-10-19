import { Prisma } from "@prisma/client";

export type MappedPrismaError = {
  status: number;
  error: string;
  code: string;
};

export function mapPrismaError(e: unknown): MappedPrismaError | null {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return null;

  if (e.code === "P2025") {
    return {
      status: 404,
      error: "Data tidak ditemukan",
      code: "NOT_FOUND",
    };
  }

  if (e.code === "P2002") {
    const target = Array.isArray(e.meta?.target)
      ? e.meta.target.join(", ")
      : "field unik";

    return {
      status: 409,
      error: `Data dengan ${target} tersebut sudah ada`,
      code: "CONFLICT",
    };
  }

  return null;
}
