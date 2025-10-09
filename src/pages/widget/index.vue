<script setup lang="ts">
import { onMounted, computed } from "vue";
import useStore from "@src/shared/store/store";

import { useRoute } from "vue-router";
import type { EntityType } from "@src/shared/types/common";

import Sidebar from "@src/layout/sidebar/Sidebar.vue";
import Navigation from "@src/layout/navigation/Navigation.vue";

const store = useStore();
const route = useRoute();

const contactId = computed(() => route.params.contactId);

onMounted(() => {
  store.isWidget = true;
  store.widget = {
    entity: route.params.entity as EntityType,
    entityId: Number(route.params.id),
  };
});
</script>

<template>
  <KeepAlive>
    <div
      class="xs:relative md:static h-full flex xs:flex-col md:flex-row overflow-hidden"
    >
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
          contactId ? ['xs:left-[0rem]', 'xs:static'] : ['xs:left-[62.5rem]']
        "
        role="region"
      >
        <router-view />
      </div>
    </div>
  </KeepAlive>
</template>
