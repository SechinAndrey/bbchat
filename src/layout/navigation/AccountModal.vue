<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftStartOnRectangleIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/vue/24/outline";
import Modal from "@src/ui/modals/Modal.vue";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useAvatarInitials } from "@src/shared/composables/useAvatarInitials";

interface Props {
  open: boolean;
  closeModal: () => void;
}

const props = defineProps<Props>();

const router = useRouter();
const authStore = useAuthStore();

const { avatarInitials, avatarColor } = useAvatarInitials(
  computed(() => authStore.currentUser?.firstName || ""),
  computed(() => authStore.currentUser?.lastName || ""),
);

const handleTemplatesClick = () => {
  router.push({ name: "SettingsMessagesTemplates" });
  props.closeModal();
};

const handleLogout = () => {
  authStore.logout();
  router.push("/access/sign-in/");
  props.closeModal();
};
</script>

<template>
  <Modal :open="open" :close-modal="closeModal">
    <template #content>
      <div class="w-full xs:w-full bg-app-bg xs:rounded-none md:rounded-lg">
        <!-- User info header -->
        <div class="px-6 py-4 border-b border-app-border">
          <div class="flex items-center gap-4">
            <div
              :style="{
                backgroundImage: `url(${authStore.currentUser?.avatar})`,
              }"
              class="w-14 h-14 rounded-full bg-cover bg-center flex-shrink-0"
              :class="avatarColor"
            >
              <span
                v-if="!authStore.currentUser?.avatar"
                class="flex items-center justify-center w-full h-full text-lg font-semibold text-primary bg-primary rounded-full"
              >
                {{ avatarInitials }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-base font-semibold text-left text-app-text truncate"
              >
                {{ authStore.currentUser?.firstName }}
                {{ authStore.currentUser?.lastName }}
              </p>
              <p class="text-sm text-left text-app-text-secondary truncate">
                {{ authStore.currentUser?.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menu items -->
        <div class="py-2">
          <button
            class="flex items-center w-full px-6 py-4 text-base text-app-text hover:bg-app-bg-secondary active:bg-app-bg-secondary transition-colors duration-200"
            @click="handleTemplatesClick"
          >
            <BookmarkIcon class="w-6 h-6 mr-4 text-app-text-secondary" />
            <span>Шаблони повідомлень</span>
          </button>

          <a
            href="https://drive.google.com/drive/u/1/folders/16YmpXeKsdviRL4t2OsG86gJZxLHy6uHM"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center w-full px-6 py-4 text-base text-app-text hover:bg-app-bg-secondary active:bg-app-bg-secondary transition-colors duration-200"
            @click="closeModal"
          >
            <ArrowTopRightOnSquareIcon
              class="w-6 h-6 mr-4 text-app-text-secondary"
            />
            <span>Довідка</span>
          </a>

          <!-- Separator before logout -->
          <div class="my-2 border-t border-app-border"></div>

          <button
            class="flex items-center w-full px-6 py-4 text-base text-danger hover:bg-danger/10 active:bg-danger/10 transition-colors duration-200"
            @click="handleLogout"
          >
            <ArrowLeftStartOnRectangleIcon class="w-6 h-6 mr-4" />
            <span class="font-medium">Вийти</span>
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>
