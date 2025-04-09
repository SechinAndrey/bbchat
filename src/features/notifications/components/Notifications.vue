<script setup lang="ts">
import type { INotification } from "@src/core/types/types.ts";
import useStore from "@src/core/store/store";

import NoNotifications from "@src/ui/states/empty-states/NoNotifications.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import Notification from "@src/features/notifications/components/Notification.vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";

const store = useStore();
</script>

<template>
  <div>
    <SidebarHeader>
      <template v-slot:title>Notifications</template>
    </SidebarHeader>

    <div
      class="w-full h-full scroll-smooth scrollbar-hidden"
      style="overflow-x: visible; overflow-y: scroll"
    >
      <Circle2Lines
        v-if="
          store.status === 'loading' ||
          (store.delayLoading &&
            (store.notifications as INotification[]).length > 0)
        "
        v-for="item in 6"
      />

      <Notification
        v-else-if="store.status === 'success' && !store.delayLoading"
        v-for="(notification, index) in store.notifications"
        :notification="notification"
        :key="index"
      />

      <NoNotifications v-else />
    </div>
  </div>
</template>
