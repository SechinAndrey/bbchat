import { defineConfig, loadEnv } from "vite";
import alias from "@rollup/plugin-alias";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const rootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), alias()],
    resolve: {
      alias: {
        "@src": resolve(rootDir, "src"),
        "@custom_types": resolve(rootDir, "src/@custom_types"),
      },
    },
    server: {
      allowedHosts: [env.VITE_ALLOWED_HOSTS],
    },
  };
});
