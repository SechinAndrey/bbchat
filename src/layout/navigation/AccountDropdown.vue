<script setup lang="ts">
import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useUserAvatar } from "@src/shared/composables/useUserAvatar";

import {
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import Dropdown from "@src/ui/navigation/Dropdown/Dropdown.vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  showDropdown: boolean;
  handleCloseDropdown: () => void;
  handleShowDropdown: () => void;
  id: string;
}>();

const store = useStore();
const authStore = useAuthStore();
const router = useRouter();

const firstName = computed(() => store.user?.firstName);
const lastName = computed(() => store.user?.lastName);
const { avatarInitials, avatarColor } = useUserAvatar(firstName, lastName);

const avatarUrl = computed(() => {
  // TODO: wrong path, needs to be fixed on backend side
  return store.user?.avatar;
});

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
      @click="handleShowDropdown"
      class="rounded-full active:scale-110 focus:outline-none focus:scale-110 transition duration-200 ease-out"
      :class="avatarColor"
      :aria-expanded="showDropdown"
      aria-controls="profile-menu"
      aria-label="toggle profile menu"
    >
      <div
        id="user-avatar"
        :style="{ backgroundImage: `url(${avatarUrl})` }"
        class="xs:w-6 xs:h-6 md:w-[2.25rem] md:h-[2.25rem] rounded-full bg-cover bg-center"
      >
        <span
          v-if="!store.user?.avatar"
          class="flex items-center justify-center w-full h-full text-sm font-semibold text-white bg-primary rounded-full"
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
        'md:left-[2.5rem]',
        'md:top-[auto]',
        'md:bottom-[3.125rem]',
        'xs:bottom-[3.7rem]',
        'md:left-[-4.8125rem]',
        'xs:left-[auto]',
        'xs:right-[-0.5rem]',
      ]"
      :handle-click-outside="handleCloseOnClickOutside"
      :close-dropdown="props.handleCloseDropdown"
    >
      <button
        class="dropdown-link dropdown-link-primary"
        aria-label="Show profile information"
        role="menuitem"
        @click="props.handleCloseDropdown"
      >
        <InformationCircleIcon
          class="h-5 w-5 mr-3 text-black opacity-60 dark:text-white dark:opacity-70"
        />
        Profile Information
      </button>

      <RouterLink
        to="/reset/"
        class="dropdown-link dropdown-link-primary"
        aria-label="change password"
        role="menuitem"
        @click="props.handleCloseDropdown"
      >
        <ArrowPathIcon
          class="h-5 w-5 mr-3 text-black opacity-60 dark:text-white dark:opacity-70"
        />
        Password Change
      </RouterLink>

      <button
        class="dropdown-link dropdown-link-danger"
        aria-label="logout"
        role="menuitem"
        @click="handleLogout"
      >
        <ArrowLeftOnRectangleIcon class="h-5 w-5 mr-3" />
        Logout
      </button>
    </Dropdown>
  </div>
</template>
