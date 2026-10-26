export type ErrorWithStatus = Error & { status?: number };

/** Reads the HTTP status carried by an error thrown from an API request. */
export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }

  return undefined;
}

/** Builds an Error carrying the HTTP status, so retry policy can inspect it. */
export function createHttpError(
  message: string,
  status: number
): ErrorWithStatus {
  const error = new Error(message) as ErrorWithStatus;
  error.status = status;
  return error;
}

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
