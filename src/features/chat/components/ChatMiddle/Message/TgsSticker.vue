<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";
import pako from "pako";

const props = defineProps<{
  stickerUrl: string;
}>();

const animationData = ref<any>(null);
const isLoading = ref(true);
const hasError = ref(false);

const devicePixelRatio = window.devicePixelRatio || 1;

/**
 * Load and decompress .tgs sticker file
 * .tgs files are gzip-compressed Lottie JSON animations
 */
const loadTgsSticker = async (url: string) => {
  try {
    isLoading.value = true;
    hasError.value = false;
    animationData.value = null;

    // Fetch the .tgs file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sticker: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let lottieJson;

    // Check if file is gzipped (starts with 0x1f 0x8b magic bytes)
    const isGzipped = uint8Array[0] === 0x1f && uint8Array[1] === 0x8b;

    if (isGzipped) {
      // Decompress gzip using pako
      const decompressed = pako.inflate(uint8Array, { to: "string" });
      lottieJson = JSON.parse(decompressed);
    } else {
      // Parse as plain JSON (backend already decompressed)
      const text = new TextDecoder().decode(uint8Array);
      lottieJson = JSON.parse(text);
    }

    animationData.value = lottieJson;
  } catch (error) {
    console.error("Error loading TGS sticker:", error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (props.stickerUrl) {
    loadTgsSticker(props.stickerUrl);
  }
});

watch(
  () => props.stickerUrl,
  (newUrl) => {
    if (newUrl) {
      loadTgsSticker(newUrl);
    }
  },
);
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center aspect-square">
    <div
      class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
    ></div>
  </div>

  <div
    v-else-if="hasError"
    class="flex items-center justify-center bg-app-bg-secondary rounded-lg aspect-square"
  >
    <div
      class="text-app-text-secondary whitespace-normal break-keep text-center text-sm"
    >
      Не вдалося завантажити стікер
    </div>
  </div>

  <DotLottieVue
    v-else-if="animationData"
    :data="animationData"
    :autoplay="true"
    :loop="true"
    :render-config="{
      devicePixelRatio: devicePixelRatio,
    }"
    class="rounded-lg aspect-square"
  />
</template>
