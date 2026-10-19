type Serialized<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Date
    ? string
    : T[P] extends Date | null
      ? string | null
      : T[P];
};

export function serializeDates<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Serialized<T, K> {
  const result = { ...obj } as Record<string, unknown>;

  for (const key of keys) {
    const value = obj[key];
    result[key as string] = value instanceof Date ? value.toISOString() : value;
  }

  return result as Serialized<T, K>;
}

export function serializePost<T extends { createdAt: Date; updatedAt: Date }>(
  post: T
): Serialized<T, "createdAt" | "updatedAt"> {
  return serializeDates(post, ["createdAt", "updatedAt"]);
}

export function serializeProject<
  T extends {
    startDate: Date | null;
    endDate: Date | null;
    updatedAt: Date;
  }
>(project: T): Serialized<T, "startDate" | "endDate" | "updatedAt"> {
  return serializeDates(project, ["startDate", "endDate", "updatedAt"]);
}
