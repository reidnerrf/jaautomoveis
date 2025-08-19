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
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
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
