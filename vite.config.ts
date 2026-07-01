import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
;

export default defineConfig({
  plugins: [tanstackStart(), react(), tsConfigPaths(), tailwindcss()],
  server: {
    host: "::",
    port: 8080,
  },
});
