import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    base: "/nestasm",
    plugins: [
      react(),
      svgr({
        include: "**/*.svg?react", // Dit is belangrijk!
        svgrOptions: {
          ref: true,
        },
      }),
      wasm(),
    ],
  };
});
