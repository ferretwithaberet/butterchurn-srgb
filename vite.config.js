import { defineConfig } from "vite";
import inline from "@zhoumutou/vite-plugin-inline";

export default defineConfig({
  plugins: [inline()],
});
