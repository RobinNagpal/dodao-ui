import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Design-system guardrail: Tailwind `className` should live only in the leaf UI
// layer (`src/components/ui/**`). High-level components (pages + feature
// components) must compose those leaves and stay style-free. Rolled out as
// `warn` first; ratchet individual directories to `error` as they are migrated.
// See docs/insights-ui/ui-leaf-component-system.md.
const noClassNameOutsideLeafLayer = {
  "no-restricted-syntax": [
    "warn",
    {
      selector: "JSXAttribute[name.name='className']",
      message:
        "Tailwind className is only allowed in leaf UI components under src/components/ui/**. " +
        "Compose a styled UI component (or extend one) instead of inlining Tailwind here.",
    },
  ],
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 1) Discourage inline Tailwind in pages + feature components.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: noClassNameOutsideLeafLayer,
  },

  // 2) The leaf UI layer is the one place Tailwind is allowed (later block wins).
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": "off" },
  },
];

export default eslintConfig;
