<script setup lang="ts">
import { onMounted } from "vue";
import useStore from "@src/shared/store/store";

import Sidebar from "@src/layout/sidebar/Sidebar.vue";
import { getActiveConversationId } from "@src/shared/utils/utils";
import { useRoute } from "vue-router";
import type { EntityType } from "@src/shared/types/common";

const store = useStore();

onMounted(() => {
  store.isWidget = true;
  store.widget = {
    entity: useRoute().params.entity as EntityType,
    entityId: Number(useRoute().params.id),
  };
});
</script>

<template>
  <KeepAlive>
    <div
      class="xs:relative md:static h-full flex xs:flex-col md:flex-row overflow-hidden"
    >
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
        <router-view />
      </div>
    </div>
  </KeepAlive>
</template>
