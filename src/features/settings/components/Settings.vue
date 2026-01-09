<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";
import {
  UserCircleIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  BookmarkIcon,
} from "@heroicons/vue/24/solid";

const route = useRoute();

const settingsLinks = [
  {
    name: "SettingsProfile",
    label: "Профіль",
    icon: UserCircleIcon,
  },
  {
    name: "SettingsMessagesTemplates",
    label: "Шаблони",
    icon: BookmarkIcon,
  },
  // Add more settings pages here
  // {
  //   name: "SettingsNotifications",
  //   label: "Сповіщення",
  //   icon: BellIcon,
  // },
  // {
  //   name: "SettingsPrivacy",
  //   label: "Приватність",
  //   icon: ShieldCheckIcon,
  // },
  // {
  //   name: "SettingsAppearance",
  //   label: "Вигляд",
  //   icon: PaintBrushIcon,
  // },
];

const isActiveRoute = (routeName: string) => {
  return route.name === routeName;
};
</script>

<template>
  <div class="flex flex-col h-full">
    <SidebarHeader class="max-h-[60px] h-[60px] pt-5">
      <template #title>
        <div class="text-xl">Налаштування</div>
      </template>
    </SidebarHeader>

    <div
      class="w-full flex-1 scroll-smooth scrollbar-hidden overflow-y-auto mt-2"
    >
      <nav class="flex flex-col">
        <RouterLink
          v-for="link in settingsLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="flex items-center text-md px-5 py-4 transition-all duration-200 hover:bg-app-bg mr-1"
          :class="{
            'bg-app-bg': isActiveRoute(link.name),
          }"
        >
          <component
            :is="link.icon"
            class="w-[20px] h-[20px] mr-4 flex-shrink-0"
            :class="{
              'text-primary': isActiveRoute(link.name),
              'text-app-text-secondary': !isActiveRoute(link.name),
            }"
          />
          <span
            class="text-base"
            :class="{
              'text-primary font-medium': isActiveRoute(link.name),
              'text-app-text': !isActiveRoute(link.name),
            }"
          >
            {{ link.label }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div class="text-xs text-app-text-secondary p-5 text-center">
      Version 0.6.4
    </div>
  </div>
</template>
