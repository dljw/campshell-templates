import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: "dataforseo-ui",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        paths: {
          react: "/shims/react.js",
          "react-dom": "/shims/react-dom.js",
          "react/jsx-runtime": "/shims/react-jsx-runtime.js",
        },
      },
    },
  },
});
