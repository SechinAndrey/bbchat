import router from "@src/router";
import "@src/style.css";
import "@src/shared/assets/styles/common.scss";
import { createPinia } from "pinia";
import { createApp } from "vue";
import vClickOutside from "click-outside-vue3";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import App from "@src/App.vue";

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(vClickOutside)
  .use(Vue3Toastify, {
    autoClose: 3000,
  } as ToastContainerOptions)
  .mount("#app");
