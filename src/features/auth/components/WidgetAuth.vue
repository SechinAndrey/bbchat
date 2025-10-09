<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useIframeMessaging } from "@src/shared/composables/useIframeMessaging";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useRouter } from "vue-router";

const messageFromParent = ref("");
const { on } = useIframeMessaging({
  allowedOrigin: import.meta.env.VITE_IFRAME_PARENT,
});
const authStore = useAuthStore();
const router = useRouter();

on("bb-widget:auth-by-token", (data) => {
  console.log("Received token-auth message:", data);

  if (authStore.isAuthenticated) {
    messageFromParent.value = "Already authenticated";
    router.push({ path: "/widget/clients/1115" });
  } else {
    authStore
      .loginWithToken(data.token)
      .then(() => {
        messageFromParent.value = "Authenticated successfully";
        router.push({ path: "/widget/clients/1115" });
      })
      .catch((error) => {
        messageFromParent.value = "Authentication failed: " + error.message;
      });
  }
});
</script>

<template>
  <div class="w-full h-full flex items-center justify-center dark:bg-gray-800">
    <h1 class="text-2xl font-bold text-center text-gray-600 dark:text-gray-300">
      authentication:
      <pre>{{ messageFromParent }}</pre>
    </h1>
  </div>
</template>
