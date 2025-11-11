import router from "@src/router";
import "@src/style.css";
import "@src/shared/assets/styles/common.scss";
import { createPinia } from "pinia";
import { createApp } from "vue";
import vClickOutside from "click-outside-vue3";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { StatusBar, Style } from "@capacitor/status-bar";

import App from "@src/App.vue";

// Configure StatusBar color
const setStatusBarColor = async () => {
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: "#3d445c" });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (error) {
    // StatusBar is not available on web
    console.log("StatusBar not available:", error);
  }
};

setStatusBarColor();

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(vClickOutside)
  .use(Vue3Toastify, {
    autoClose: 3000,
  } as ToastContainerOptions)
  .mount("#app");
