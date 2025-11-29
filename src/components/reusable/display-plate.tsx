import { InteractiveViewer } from "../interactive-viewer";

function isValidJSON(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

// Komponen untuk menampilkan deskripsi
export function DisplayPlate({ value }: { value: string }) {
  if (!isValidJSON(value)) {
    return <div className="whitespace-pre-wrap">{value}</div>;
  }

  const content = JSON.parse(value);

  return <InteractiveViewer value={content} />;
}
