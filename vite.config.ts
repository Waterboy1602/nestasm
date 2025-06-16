import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    base: isBuild ? "/jagua-rs/" : "/",
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
