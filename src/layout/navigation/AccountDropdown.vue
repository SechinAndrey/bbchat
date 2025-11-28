<script setup lang="ts">
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAvatarInitials } from "@src/shared/composables/useAvatarInitials";

import {
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  BookmarkIcon,
} from "@heroicons/vue/24/outline";
import Dropdown from "@src/ui/navigation/Dropdown/Dropdown.vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  showDropdown: boolean;
  handleCloseDropdown: () => void;
  handleShowDropdown: () => void;
  id: string;
}>();

const authStore = useAuthStore();
const router = useRouter();

const firstName = computed(() => authStore.currentUser?.firstName);
const lastName = computed(() => authStore.currentUser?.lastName);
const { avatarInitials, avatarColor } = useAvatarInitials(firstName, lastName);

// Handle logout
const handleLogout = () => {
  authStore.logout();
  props.handleCloseDropdown();
  router.push("/access/sign-in/");
};

// (event) close dropdown menu when clicking outside
const handleCloseOnClickOutside = (event: Event) => {
  if (
    !["user-avatar", "profile-menu-button"].includes(
      (event.target as HTMLButtonElement).id,
    )
  ) {
    props.handleCloseDropdown();
  }
};
</script>

<template>
  <div class="relative">
    <!--toggle dropdown button-->
    <button
      :id="props.id + '-button'"
      class="rounded-full active:scale-110 focus:outline-none focus:scale-110 transition duration-200 ease-out"
      :aria-expanded="showDropdown"
      aria-controls="profile-menu"
      aria-label="toggle profile menu"
      @click="handleShowDropdown"
    >
      <div
        id="user-avatar"
        :style="{ backgroundImage: `url(${authStore.currentUser?.avatar})` }"
        class="w-[2.25rem] h-[2.25rem] rounded-full bg-cover bg-center"
        :class="avatarColor"
      >
        <span
          v-if="!authStore.currentUser?.avatar"
          class="flex items-center justify-center w-full h-full text-sm font-semibold text-primary bg-primary rounded-full"
        >
          {{ avatarInitials }}
        </span>
      </div>
    </button>

    <!--dropdown menu-->
    <Dropdown
      :id="props.id + '-dropdown'"
      :aria-labelledby="props.id + '-button'"
      :show="props.showDropdown"
      :position="[
        'md:bottom-0',
        'md:left-0',
        'md:top-auto',
        'md:bottom-[3.125rem]',

        'xs:bottom-[-120px]',
        'xs:left-[auto]',
        'xs:right-[-0.5rem]',
        'overflow-hidden',
      ]"
      :handle-click-outside="handleCloseOnClickOutside"
      :close-dropdown="props.handleCloseDropdown"
    >
      <div>
        <div class="px-4 py-3 border-b border-app-border">
          <p class="text-sm font-medium text-app-text">
            {{ authStore.currentUser?.firstName }}
            {{ authStore.currentUser?.lastName }}
          </p>
          <p class="text-xs text-app-text-secondary">
            {{ authStore.currentUser?.email }}
          </p>
        </div>
      </div>
      <!-- <button
        class="flex items-center w-full px-4 py-3 text-sm text-app-text hover:bg-app-bg-secondary focus:bg-app-bg-secondary focus:outline-none transition-all duration-200"
        aria-label="Show profile information"
        role="menuitem"
        @click="props.handleCloseDropdown"
      >
        <InformationCircleIcon
          class="w-5 h-5 mr-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
        />
        Profile Information
      </button>

      <RouterLink
        to="/reset/"
        class="flex items-center w-full px-4 py-3 text-sm text-app-text hover:bg-app-bg-secondary focus:bg-app-bg-secondary focus:outline-none transition-all duration-200"
        aria-label="change password"
        role="menuitem"
        @click="props.handleCloseDropdown"
      >
        <ArrowPathIcon
          class="w-5 h-5 mr-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
        />
        Password Change
      </RouterLink> -->

      <RouterLink
        :to="{ name: 'SettingsMessagesTemplates' }"
        class="flex items-center w-full px-4 py-3 text-sm hover:bg-app-bg-secondary focus:bg-app-bg-secondary focus:outline-none transition-all duration-200"
        aria-label="templates settings"
        role="menuitem"
        @click="props.handleCloseDropdown"
      >
        <BookmarkIcon
          class="w-5 h-5 mr-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
        />
        Шаблони повідомлень
      </RouterLink>

      <button
        class="flex items-center w-full px-4 py-3 text-sm text-danger hover:bg-app-bg-secondary focus:bg-app-bg-secondary focus:outline-none transition-all duration-200"
        aria-label="logout"
        role="menuitem"
        @click="handleLogout"
      >
        <ArrowLeftStartOnRectangleIcon
          class="w-5 h-5 mr-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
        />
        Вийти
      </button>
    </Dropdown>
  </div>
</template>
