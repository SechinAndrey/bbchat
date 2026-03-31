import { ref } from "vue";
import type { OpenParams } from "./types";

const isOpen = ref(false);
const params = ref<OpenParams | null>(null);

export function useSendMessageModal() {
  const open = (p: OpenParams = {}) => {
    params.value = p;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    params.value = null;
  };

  return { isOpen, params, open, close };
}
