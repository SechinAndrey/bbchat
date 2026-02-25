<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

import Navigation from "@src/layout/navigation/Navigation.vue";
import Sidebar from "@src/layout/sidebar/Sidebar.vue";
import { getActiveConversationId } from "@src/shared/utils/utils";

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const isSettingsPageActive = computed(() => {
  const routeName = route.name?.toString();
  return routeName?.startsWith("Settings") && routeName !== "Settings";
});

const shouldShowMainContent = computed(() => {
  return getActiveConversationId() || isSettingsPageActive.value;
});

const mainContentStyle = computed(() => {
  if (!isMobile.value) return {};
  return { height: "calc(100% - 3.875rem - env(safe-area-inset-top, 0px))" };
});
</script>

<template>
  <KeepAlive>
    <div
      class="xs:relative md:static h-full flex xs:flex-col md:flex-row overflow-hidden"
    >
      <!--navigation-bar-->
      <Navigation />
      <!--sidebar-->
      <Sidebar
        class="xs:grow-1 md:grow-0 xs:overflow-y-scroll md:overflow-visible scrollbar-hidden"
      />
      <!--main content-->
      <div
        id="mainContent"
        class="bg-app-bg grow md:h-full scrollbar-hidden transition-all duration-500 xs:w-full xs:absolute xs:z-10 md:static md:w-fit bottom-0"
        :class="
          shouldShowMainContent
            ? ['xs:left-[0rem]', 'xs:static']
            : ['xs:left-[62.5rem]']
        "
        :style="mainContentStyle"
        role="region"
      >
        <router-view />
      </div>
    </div>
  </KeepAlive>
</template>
