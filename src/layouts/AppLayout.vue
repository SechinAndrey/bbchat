<script setup lang="ts">
import useStore from "@src/shared/store/store";

import Navigation from "@src/layout/navigation/Navigation.vue";
import Sidebar from "@src/layout/sidebar/Sidebar.vue";
import { getActiveConversationId } from "@src/shared/utils/utils";

const store = useStore();
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
        class="bg-app-bg grow md:h-full scrollbar-hidden transition-all duration-500 xs:w-full xs:absolute xs:z-10 md:static md:w-fit bottom-0 h-[calc(100%-3.875rem)]"
        :class="
          getActiveConversationId()
            ? ['xs:left-[0rem]', 'xs:static']
            : ['xs:left-[62.5rem]']
        "
        role="region"
      >
        <router-view />
      </div>
    </div>
  </KeepAlive>
</template>
