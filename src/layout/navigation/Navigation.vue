<script setup lang="ts">
import { ref } from "vue";

import useStore from "@src/shared/store/store";
import useTheme from "@src/shared/theme-system/useTheme";

import {
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
    :class="[
      'px-4 flex items-center bg-[var(--color-sidebar-bg)]',
      'py-[0.75rem] px-5',
      'md:w-[3.75rem] md:h-full md:py-7 md:flex-col',
    ]"
  >
    <!--logo-->
    <logoIcon class="md:mb-6" />

    <!--main navigation-->
    <div class="grow w-[2.25rem]">
      <!--separator-->
      <hr
        class="border-[var(--color-sidebar-divider)] xs:hidden w-full md:block mb-6"
      />

      <nav aria-label="Основна навігація">
        <ul class="xs:flex xs:justify-end xs:items-center gap-3 md:block">
          <li>
            <NavLink
              class="flex justify-center"
              :icon="isDarkMode ? SunIcon : MoonIcon"
              title="Нічний режим"
              @click="toggleDarkMode"
            />
          </li>

          <li class="md:mb-4">
            <NavItem
              :active="store.activeSidebarComponent === 'messages'"
              @click="() => handleActiveSidebarComponentChange('messages')"
            >
              <ChatBubbleLeftRightIcon class="w-[20px] h-[20px]" />
            </NavItem>
          </li>
          <!-- <li class="md:mb-4">
            <NavItem
              :active="store.activeSidebarComponent === 'contacts'"
              @click="() => handleActiveSidebarComponentChange('contacts')"
            >
              <UsersIcon />
            </NavItem>
          </li> -->

          <!--settings button small screen-->
          <!-- <li class="xs:inline md:hidden">
            <NavLink
              :icon="Cog6ToothIcon"
              title="Налаштування"
              :active="store.activeSidebarComponent === 'settings'"
              @click="() => handleActiveSidebarComponentChange('settings')"
            />
          </li> -->

          <li class="md:hidden">
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
    <div class="w-[2.25rem] xs:hidden md:block">
      <nav aria-label="Додаткова навігація">
        <ul>
          <!--toggle dark mode button-->
          <li>
            <NavLink
              class="flex justify-center"
              :icon="isDarkMode ? SunIcon : MoonIcon"
              title="Нічний режим"
              @click="toggleDarkMode"
            />
          </li>
          <!--settings button-->
          <!-- <li>
            <NavLink
              class="flex justify-center"
              :icon="Cog6ToothIcon"
              title="Налаштування"
              :active="store.activeSidebarComponent === 'settings'"
              @click="() => handleActiveSidebarComponentChange('settings')"
            />
          </li> -->
        </ul>
      </nav>

      <!--separator-->
      <hr
        class="border-[var(--color-sidebar-divider)] xs:hidden md:block mb-6"
      />

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

<style>
.app-sidebar {
  background-color: var(--color-sidebar-bg);
}

.app-sidebar hr {
  border-color: var(--color-sidebar-divider);
}
</style>
