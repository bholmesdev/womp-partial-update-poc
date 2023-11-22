import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import alpinejs from "@astrojs/alpinejs";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    alpinejs(),
    tailwind(),
    react(),
    {
      name: "simple-partial",
      hooks: {
        "astro:config:setup": ({ config, updateConfig }) => {
          updateConfig({
            vite: {
              define: {
                "import.meta.env.PAGES_DIR": JSON.stringify(
                  new URL("pages", config.srcDir).href
                ),
              },
            },
          });
        },
      },
    },
  ],
});
