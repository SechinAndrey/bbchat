<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useAvatarInitials } from "@src/shared/composables/useAvatarInitials";
import Button from "@src/ui/inputs/Button.vue";
import {
  ChevronLeftIcon,
  UserIcon,
  EnvelopeIcon,
  HashtagIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => {
  router.push({ name: "Settings" });
};

const firstName = computed(() => authStore.currentUser?.firstName || "");
const lastName = computed(() => authStore.currentUser?.lastName || "");
const { avatarInitials, avatarColor } = useAvatarInitials(firstName, lastName);

const fullName = computed(() => {
  const first = authStore.currentUser?.firstName || "";
  const last = authStore.currentUser?.lastName || "";
  return `${first} ${last}`.trim() || "Не вказано";
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="w-full max-h-fit px-5 py-3 pt-5 md:pt-5 md:pb-3 flex gap-4 items-center"
    >
      <Button class="md:!hidden" variant="text" icon-only @click="goBack">
        <template #icon>
          <ChevronLeftIcon class="w-[1.25rem] h-[1.25rem]" />
        </template>
      </Button>
      <h1 class="text-xl">Інформація профілю</h1>
    </div>

    <!-- Content -->
    <div class="p-5 flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center mb-8 mt-6">
          <div
            :style="{
              backgroundImage: `url(${authStore.currentUser?.avatar})`,
            }"
            class="w-24 h-24 rounded-full bg-cover bg-center mb-4"
            :class="avatarColor"
          >
            <span
              v-if="!authStore.currentUser?.avatar"
              class="flex items-center justify-center w-full h-full text-2xl font-semibold text-primary bg-primary rounded-full"
            >
              {{ avatarInitials }}
            </span>
          </div>
          <h2 class="text-2xl font-semibold text-app-text">{{ fullName }}</h2>
        </div>

        <!-- User Information Cards -->
        <div class="space-y-4">
          <div
            class="bg-app-bg-secondary rounded-sm p-4 border border-app-border"
          >
            <div class="flex items-start gap-3">
              <UserIcon
                class="w-5 h-5 text-app-text-secondary mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <p class="text-sm text-app-text-secondary mb-1">Повне ім'я</p>
                <p class="text-base text-app-text font-medium">
                  {{ fullName }}
                </p>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div
            class="bg-app-bg-secondary rounded-sm p-4 border border-app-border"
          >
            <div class="flex items-start gap-3">
              <EnvelopeIcon
                class="w-5 h-5 text-app-text-secondary mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <p class="text-sm text-app-text-secondary mb-1">Email</p>
                <p class="text-base text-app-text font-medium">
                  {{ authStore.currentUser?.email || "Не вказано" }}
                </p>
              </div>
            </div>
          </div>

          <!-- User ID -->
          <div
            class="bg-app-bg-secondary rounded-sm p-4 border border-app-border"
          >
            <div class="flex items-start gap-3">
              <HashtagIcon
                class="w-5 h-5 text-app-text-secondary mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <p class="text-sm text-app-text-secondary mb-1">
                  ID користувача
                </p>
                <p class="text-base text-app-text font-medium font-mono">
                  {{ authStore.currentUser?.id || "—" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
