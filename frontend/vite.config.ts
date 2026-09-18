import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import { configDefaults } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  if (!Object.values(env).length) {
    throw new Error(
      "File with environment variables in specific mode is probably not loaded!",
    );
  }

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      svgr(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        shared: path.resolve(__dirname, "../packages/shared/src/index.ts"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          credentials: true,
        },
        "/ws": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          credentials: true,
          ws: true,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.ts", "./src/vitest-setup.d.ts"],
      include: ["**/*.test.{ts,tsx}"],
      exclude: [...configDefaults.exclude, "**node_modules/**"],
    },
  };
});
