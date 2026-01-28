import path from "path";
import { defineConfig } from "vite";
import inline from "@zhoumutou/vite-plugin-inline";

export default defineConfig({
  plugins: [inline()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
