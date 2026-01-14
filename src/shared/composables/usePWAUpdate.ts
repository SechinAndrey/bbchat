import { ref, onMounted } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { Capacitor } from "@capacitor/core";

export function usePWAUpdate() {
  const needRefresh = ref(false);
  const updateServiceWorker = ref<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null);
  let dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  const isPWA = () => {
    if (Capacitor.isNativePlatform()) {
      return false;
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    return isStandalone;
  };

  onMounted(() => {
    if (!isPWA()) {
      return;
    }

    const { needRefresh: swNeedRefresh, updateServiceWorker: swUpdate } =
      useRegisterSW({
        onNeedRefresh() {
          needRefresh.value = true;
        },

        onRegisteredSW(swUrl, r) {
          if (!r) return;

          const checkForUpdates = async () => {
            if (!r.installing && navigator.onLine) {
              await r.update();
            }
          };

          document.addEventListener("visibilitychange", async () => {
            if (document.visibilityState === "visible") {
              await checkForUpdates();
            }
          });

          window.addEventListener("focus", async () => {
            await checkForUpdates();
          });

          setInterval(
            async () => {
              if (r.installing || !navigator.onLine) return;

              const resp = await fetch(swUrl, {
                cache: "no-store",
                headers: { "cache-control": "no-cache" },
              });

              if (resp?.status === 200) {
                await r.update();
              }
            },
            60 * 60 * 1000,
          );
        },
      });

    needRefresh.value = swNeedRefresh.value;
    updateServiceWorker.value = swUpdate;
  });

  const updateApp = async () => {
    if (updateServiceWorker.value) {
      await updateServiceWorker.value(true);
    }
  };

  const dismissUpdate = () => {
    needRefresh.value = false;

    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
    }

    dismissTimeout = setTimeout(() => {
      needRefresh.value = true;
    }, 60 * 1000); // 1 minute
  };

  const showUpdatePrompt = () => {
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      dismissTimeout = null;
    }
    needRefresh.value = true;
  };

  return {
    needRefresh,
    updateApp,
    dismissUpdate,
    showUpdatePrompt,
    isPWA: isPWA(),
  };
}
