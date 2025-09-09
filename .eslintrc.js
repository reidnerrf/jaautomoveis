module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  overrides: [
    {
      files: ["server.ts", "backend/**/*.ts", "seeder.ts"],
      parserOptions: {
        project: ["./tsconfig.server.json"],
        tsconfigRootDir: __dirname,
      },
      env: { node: true, browser: false },
      rules: {
        // Backend code: allow console and broad types during ops/logging
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      files: [
        "components/**/*.{ts,tsx}",
        "pages/**/*.{ts,tsx}",
        "utils/**/*.{ts,tsx}",
        "index.tsx",
        "App.tsx",
        "hooks/**/*.{ts,tsx}",
        "contexts/**/*.{ts,tsx}",
      ],
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      env: { browser: true, node: false },
    },
    {
      files: ["tests/**/*.ts", "tests/**/*.tsx", "scripts/**/*.ts"],
      rules: {
        // Tests/scripts: allow console and any for flexibility
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },
  ],
  plugins: ["react", "@typescript-eslint", "react-hooks"],
  rules: {
    // Performance-related rules
    "react/jsx-no-bind": [
      "error",
      {
        allowArrowFunctions: true,
        allowBind: false,
        ignoreRefs: true,
      },
    ],
    // Relax some strict performance-centric rules to avoid CI friction
    "react/jsx-no-leaked-render": "warn",
    "react/jsx-no-useless-fragment": "warn",
    "react/no-array-index-key": "warn",
    "react/no-unstable-nested-components": "warn",
    "react/prefer-stateless-function": "error",
    "react/prop-types": "off",

    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",

    // General rules
    "no-empty": ["error", { allowEmptyCatch: true }],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": "error",
    "no-alert": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "arrow-spacing": "error",
    "no-duplicate-imports": "warn",
    "no-useless-rename": "error",
    "prefer-destructuring": [
      "warn",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["dist/", "node_modules/", "*.config.js", "*.config.ts"],
};
