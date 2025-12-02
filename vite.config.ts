import { defineConfig, loadEnv } from "vite";
import alias from "@rollup/plugin-alias";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      alias(),
      VitePWA({
        registerType: "autoUpdate",
        // devOptions: {
        //   enabled: true,
        // },
        workbox: {
          globIgnores: ["**/firebase-messaging-sw.js"],
          runtimeCaching: [
            // todo: investigate caching strategies
          ],
        },
        manifest: {
          name: "Billboards Комунікації",
          short_name: "BB Chat",
          description: "Усі канали зв'язку Billboards в одному місці",
          theme_color: "#3d445c",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "pwa-logos/pwa-logo-48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-120.png",
              sizes: "120x120",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-152.png",
              sizes: "152x152",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-180.png",
              sizes: "180x180",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-256.png",
              sizes: "256x256",
              type: "image/png",
            },
            {
              src: "pwa-logos/pwa-logo-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@src": resolve(rootDir, "src"),
        "@custom_types": resolve(rootDir, "src/@custom_types"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("firebase")) {
                return "firebase";
              }

              if (id.includes("video.js") || id.includes("wavesurfer")) {
                return "video";
              }

              if (id.includes("@vueuse")) {
                return "vueuse";
              }

              if (
                id.includes("vue") ||
                id.includes("pinia") ||
                id.includes("vue-router")
              ) {
                return "vue-core";
              }

              if (
                id.includes("@heroicons") ||
                id.includes("popper") ||
                id.includes("lottie") ||
                id.includes("toastify")
              ) {
                return "ui-libs";
              }

              if (
                id.includes("axios") ||
                id.includes("pusher") ||
                id.includes("marked") ||
                id.includes("linkify") ||
                id.includes("pako") ||
                id.includes("zod")
              ) {
                return "utils";
              }

              return "vendor";
            }
          },
        },
      },
    },
    server: {
      allowedHosts: [env.VITE_ALLOWED_HOSTS],
    },
  };
});
