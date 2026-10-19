export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  if (Array.isArray(error)) {
    const messages = error.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
    return messages.length > 0 ? messages.join(", ") : fallback;
  }

  if (error instanceof Error) {
    return error.message.trim() || fallback;
  }

  return fallback;
}
