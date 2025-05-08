<script setup lang="ts">
import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useRouter } from "vue-router";

import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import Dropdown from "@src/ui/navigation/Dropdown/Dropdown.vue";
import DropdownLink from "@src/ui/navigation/Dropdown/DropdownLink.vue";
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

// Handle logout
const handleLogout = () => {
  authStore.logout();
  props.handleCloseDropdown();
  router.push('/access/sign-in/');
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
      class="bg-white rounded-full active:scale-110 focus:outline-none focus:scale-110 transition duration-200 ease-out"
      :style="{
        'box-shadow': !store.settings.darkMode
          ? '0 .125rem .3125rem rgba(193, 202, 255, 0.5),.125rem 0 .3125rem rgba(193, 202, 255, 0.5),-0.125rem 0 .3125rem rgba(193, 202, 255, 0.5),0 -0.125rem .3125rem rgba(193, 202, 255, 0.5)'
          : '0 .125rem .3125rem rgba(0, 70, 128, 0.5),.125rem 0 .3125rem rgba(0, 70, 128, 0.5),-0.125rem 0 .3125рем rgba(0, 70, 128, 0.5),0 -0.125rem .3125рем rgba(0, 70, 128, 0.5)',
      }"
      :aria-expanded="showDropdown"
      aria-controls="profile-menu"
      aria-label="toggle profile menu"
    >
      <div
        id="user-avatar"
        :style="{ backgroundImage: `url(${store.user?.avatar})` }"
        class="w-7 h-7 rounded-full bg-cover bg-center"
      ></div>
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
        'bottom-[3.125rem]',
        'left-[-4.8125rem]',
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
