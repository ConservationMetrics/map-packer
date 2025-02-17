import globals from "globals";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import gitignore from "eslint-config-flat-gitignore";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  gitignore(),
  { files: ["**/*.{js,ts,vue}"] },
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: { parserOptions: { parser: tsParser } },
    rules: {
      "no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
      ],
      "no-undef": "warn",
    },
  },
  {
    files: ["pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    ignores: ["public/"],
  },
);
