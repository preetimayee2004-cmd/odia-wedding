import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { headTags } from "./src/config/meta";

/** Writes title / description / Open Graph tags from the wedding config into index.html. */
function weddingMeta(): Plugin {
  return {
    name: "tila-wedding-meta",
    transformIndexHtml: (html) => html.replace("<!-- tila:meta -->", headTags()),
  };
}

export default defineConfig({
  server: { host: "::", port: 8080 },
  plugins: [react(), weddingMeta()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
