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
      // Uncommect this next line to directly extract classes from
      // the local shared components module when developing
      "../gc-shared-components/**/*.{vue,html,jsx,tsx}",
    ],
  },
});
