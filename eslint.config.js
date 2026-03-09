import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".wrangler/**",
      "*.config.js",
      "*.config.ts",
      "playwright-report/**",
      "test-results/**",
      "artifacts/**",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.es2022,
        React: "readonly",
        JSX: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./apps/web/tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prettier/prettier": "error",
    },
  },
  {
    files: ["apps/web/src/**/*.test.{ts,tsx}", "apps/web/src/**/*.spec.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        React: "readonly",
        JSX: "readonly",
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        test: "readonly",
      },
    },
  },
  {
    files: [
      "apps/api/src/**/*.{ts,tsx}",
      "packages/**/src/**/*.{ts,tsx}",
    ],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.es2022,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prettier/prettier": "error",
    },
  },
];
