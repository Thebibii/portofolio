/**
 * Tanda tangan "Bibi" — satu sumber untuk beranda dan /about, supaya
 * keduanya tidak bisa berbeda lagi. SVG-nya dekorasi, jadi aria-hidden.
 * Ukuran/warna diatur lewat className dari pemakai.
 */
export default function BibiSignature({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 168 80"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M13 60 C19 46 25 26 29 15 C31 7 42 5 44 14 C46 24 33 31 27 35 C36 33 47 39 45 49 C43 59 32 63 25 56 M57 41 C53 47 51 54 53 59 M58 34 L59 34 M68 59 C72 45 76 29 78 17 C79 10 88 11 87 19 C86 28 78 37 74 44 C72 50 76 56 82 54 C89 52 91 42 88 38 M100 41 C96 47 94 54 96 59 M101 34 L102 34 M60 66 C90 74 130 72 156 58"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
