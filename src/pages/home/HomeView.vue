<script setup lang="ts">
import useStore from "@src/shared/store/store";

import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
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
      <!-- <Navigation class="xs:order-1 md:-order-none" /> -->
      <Navigation />
      <!--sidebar-->
      <Sidebar
        class="xs:grow-1 md:grow-0 xs:overflow-y-scroll md:overflow-visible scrollbar-hidden"
      />
      <!--chat-->
      <div
        id="mainContent"
        class="bg-app-bg grow md:h-full scrollbar-hidden transition-all duration-500 xs:mt-[3.75rem] xs:w-full xs:absolute xs:z-10 md:static md:w-fit mt-9 md:mt-0 h-[calc(100%-3rem)]"
        :class="
          getActiveConversationId()
            ? ['xs:left-[0rem]', 'xs:static']
            : ['xs:left-[62.5rem]']
        "
        role="region"
      >
        <router-view v-slot="{ Component }">
          <FadeTransition name="fade" mode="out-in">
            <component :is="Component" :key="getActiveConversationId()" />
          </FadeTransition>
        </router-view>
      </div>
    </div>
  </KeepAlive>
</template>
