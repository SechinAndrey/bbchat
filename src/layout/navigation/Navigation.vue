<script setup lang="ts">
import { ref } from "vue";

import useStore from "@src/shared/store/store";
import { useTheme } from "@src/shared/components/theme/useTheme";

import {
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
} from "@heroicons/vue/24/solid";
import AccountDropdown from "@src/layout/navigation/AccountDropdown.vue";
import logoIcon from "@src/shared/icons/logoIcon.vue";
import NavLink from "@src/layout/navigation/NavLink.vue";
import NavItem from "@src/layout/navigation/NavItem.vue";

const store = useStore();
const { toggleDarkMode, isDarkMode } = useTheme();

const showDropdown = ref(false);

// (event) change the active sidebar component when clicking on a NavLink
const handleActiveSidebarComponentChange = (value: string) => {
  store.activeSidebarComponent = value;
};
</script>

<template>
  <div
    class="xs:w-full md:w-[3.75rem] md:h-full md:py-7 xs:py-5 px-4 flex xs:flex-row md:flex-col items-center transition-all duration-500 bg-theme-nav"
  >
    <!--logo-->
    <logoIcon class="xs:hidden md:block mb-6" />

    <!--main navigation-->
    <div class="grow w-full">
      <!--separator-->
      <hr
        class="xs:hidden w-full md:block mb-6 border-neutral dark:border-neutral"
      />

      <nav aria-label="Main navigation">
        <ul class="xs:flex md:block xs:justify-between xs:items-center">
          <li class="md:mb-4">
            <NavItem
              :active="store.activeSidebarComponent === 'messages'"
              text-color="text-white"
              @click="() => handleActiveSidebarComponentChange('messages')"
            >
              <ChatBubbleLeftRightIcon />
            </NavItem>
          </li>
          <li class="md:mb-4">
            <NavItem
              :active="store.activeSidebarComponent === 'contacts'"
              text-color="text-white"
              @click="() => handleActiveSidebarComponentChange('contacts')"
            >
              <UsersIcon />
            </NavItem>
          </li>

          <!--settings button small screen-->
          <li class="xs:inline md:hidden">
            <NavLink
              :icon="Cog6ToothIcon"
              title="Settings"
              :active="store.activeSidebarComponent === 'settings'"
              @click="() => handleActiveSidebarComponentChange('settings')"
            />
          </li>

          <li>
            <!--user avatar PC-->
            <AccountDropdown
              id="profile-menu"
              class="xs:flex md:hidden flex w-full"
              aria-labelledby="profile-menu-button"
              :show-dropdown="showDropdown"
              :handle-show-dropdown="() => (showDropdown = true)"
              :handle-close-dropdown="() => (showDropdown = false)"
            />
          </li>
        </ul>
      </nav>
    </div>

    <!--secondary navigation-->
    <div class="md:w-full">
      <nav aria-label="Extra navigation" class="xs:hidden md:block">
        <ul>
          <!--toggle dark mode button-->
          <li>
            <NavLink
              class="flex justify-center"
              :icon="isDarkMode?.value ? SunIcon : MoonIcon"
              title="Night mode"
              @click="toggleDarkMode"
            />
          </li>
          <!--settings button-->
          <li>
            <NavLink
              class="flex justify-center"
              :icon="Cog6ToothIcon"
              title="Settings"
              :active="store.activeSidebarComponent === 'settings'"
              @click="() => handleActiveSidebarComponentChange('settings')"
            />
          </li>
        </ul>
      </nav>

      <!--separator-->
      <hr class="xs:hidden md:block mb-6 border-neutral dark:border-neutral" />

      <!--user avatar MOBILE-->
      <AccountDropdown
        id="profile-menu"
        class="xs:hidden md:flex flex w-full"
        aria-labelledby="profile-menu-button"
        :show-dropdown="showDropdown"
        :handle-show-dropdown="() => (showDropdown = true)"
        :handle-close-dropdown="() => (showDropdown = false)"
      />
    </div>
  </div>
</template>
