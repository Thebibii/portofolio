import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

// eslint-config-next 15.x ships legacy (eslintrc) configs, so ESLint 9 flat
// config needs to load it through FlatCompat.
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
  {
    files: ["src/lib/auth.ts"],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored shadcn/ui + Plate primitives (upstream code, not hand-edited).
    "src/components/ui/**",
  ]),
]);

export default eslintConfig;
