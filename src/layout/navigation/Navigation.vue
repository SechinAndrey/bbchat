<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import useTheme from "@src/shared/theme-system/useTheme";
import { Capacitor } from "@capacitor/core";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

import {
  MoonIcon,
  SunIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  FireIcon,
} from "@heroicons/vue/24/solid";
import AccountDropdown from "@src/layout/navigation/AccountDropdown.vue";
import AccountModal from "@src/layout/navigation/AccountModal.vue";
import logoIcon from "@src/shared/icons/logoIcon.vue";
import NavLink from "@src/layout/navigation/NavLink.vue";
import NavItem from "@src/layout/navigation/NavItem.vue";
import router from "@src/router";
import route from "@src/router";

const store = useStore();
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const { toggleDarkMode, isDarkMode } = useTheme();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

// Add safe-area-inset-top padding for native mobile (status bar overlay fix)
const safeAreaStyle = computed(() => {
  if (!Capacitor.isNativePlatform() || !isMobile.value) return {};
  return { paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" };
});

const showDropdown = ref(false);
const showAccountModal = ref(false);

onMounted(() => {
  conversationsStore.fetchUnreadCounts();
});

// (event) change the active sidebar component when clicking on a NavLink
// const handleActiveSidebarComponentChange = (value: string) => {
//   store.activeSidebarComponent = value;
// };

const openSuppliers = () => {
  router.push({
    path: "/chat/suppliers",
  });
};

const openLeads = () => {
  router.push({
    path: "/chat/leads",
  });
};

const openClients = () => {
  router.push({
    path: "/chat/clients",
  });
};
</script>

<template>
  <div
    :class="[
      'px-4 flex items-center bg-[var(--color-sidebar-bg)]',
      'py-[0.75rem] px-5',
      'md:w-[3.75rem] md:h-full md:py-7 md:flex-col',
    ]"
    :style="safeAreaStyle"
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
          <li class="md:hidden">
            <NavLink
              class="flex justify-center"
              :icon="isDarkMode ? SunIcon : MoonIcon"
              title="Нічний режим"
              @click="toggleDarkMode"
            />
          </li>

          <li v-if="!store.isWidget" class="md:mb-4">
            <NavItem
              :active="route.currentRoute.value.path.includes('/chat/leads')"
              :unread-count="conversationsStore.unreadByEntity.leads"
              title="Ліди"
              @click="openLeads"
            >
              <FireIcon class="w-[22px] h-[22px]" />
            </NavItem>
          </li>
          <li
            v-if="!store.isWidget && authStore.currentUser?.roleId !== 7"
            class="md:mb-4"
          >
            <NavItem
              :active="route.currentRoute.value.path.includes('/chat/clients')"
              :unread-count="conversationsStore.unreadByEntity.clients"
              title="Клієнти"
              @click="openClients"
            >
              <ChatBubbleLeftRightIcon class="w-[20px] h-[20px]" />
            </NavItem>
          </li>
          <li
            v-if="!store.isWidget && authStore.currentUser?.roleId !== 7"
            class="md:mb-4"
          >
            <NavItem
              :active="
                route.currentRoute.value.path.includes('/chat/suppliers')
              "
              :unread-count="conversationsStore.unreadByEntity.suppliers"
              title="Постачальники"
              @click="openSuppliers"
            >
              <UsersIcon class="w-[20px] h-[20px]" />
            </NavItem>
          </li>

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
            <!--user avatar mobile - opens modal-->
            <button
              class="rounded-full active:scale-110 focus:outline-none focus:scale-110 transition duration-200 ease-out flex items-center justify-center"
              aria-label="toggle profile menu"
              @click="showAccountModal = true"
            >
              <div
                :style="{
                  backgroundImage: `url(${authStore.currentUser?.avatar})`,
                }"
                class="w-[2.25rem] h-[2.25rem] rounded-full bg-cover bg-center"
              >
                <span
                  v-if="!authStore.currentUser?.avatar"
                  class="flex items-center justify-center w-full h-full text-sm font-semibold text-primary bg-primary rounded-full"
                >
                  {{ authStore.currentUser?.firstName?.[0]
                  }}{{ authStore.currentUser?.lastName?.[0] }}
                </span>
              </div>
            </button>
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

      <!--user avatar PC-->
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

  <!-- Account modal for mobile -->
  <AccountModal
    :open="showAccountModal"
    :close-modal="() => (showAccountModal = false)"
  />
</template>

<style>
.app-sidebar {
  background-color: var(--color-sidebar-bg);
}

.app-sidebar hr {
  border-color: var(--color-sidebar-divider);
}
</style>
