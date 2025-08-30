// lib/helper.ts
export function omitId(obj: any) {
  if (!obj) return null;

  // kalau array → map
  if (Array.isArray(obj)) {
    return obj.map(({ id, ...rest }) => rest);
  }

  // kalau single object
  const { id, ...rest } = obj;
  return rest;
}
