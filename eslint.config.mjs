import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    {
        ignores: ["public/", ".next/", "node_modules/", "tailwind.config.js", "src/shared/lib/compose-refs.ts", "src/shared/components/ui/morphing-popover.tsx", "src/shared/components/ui/file-upload.tsx", "src/shared/components/ui/logo-carousel.tsx"],
    },
    {
        extends: [...nextCoreWebVitals, ...nextTypescript],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-require-imports": "off",
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "warn",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/use-memo": "off",
            "react-hooks/static-components": "off",
            "prefer-const": "warn",
            "@next/next/no-img-element": "warn"
        }
    }
]);