import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const apiPort = env.PORT || "5020";
  const apiTarget = `http://localhost:${apiPort}`;

  return {
    envDir: repoRoot,
    envPrefix: ["VITE_"],
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/health": { target: apiTarget, changeOrigin: true },
        "/api": { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
