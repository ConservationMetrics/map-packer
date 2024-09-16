import { defineConfig } from "@windicss/plugin-utils";

export default defineConfig({
  /**
   * Write windi classes in html attributes.
   * @see https://windicss.org/features/attributify.html
   */
  attributify: true,
  extract: {
    include: [
      "./**/*.{vue,html,jsx,tsx}",
      // Workaround to get Windi to extract classes from gc-shared-components
      "node_modules/gc-shared-components/**/*.{vue,html,jsx,tsx}",
    ],
  },
});
