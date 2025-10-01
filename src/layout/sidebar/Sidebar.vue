<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import useStore from "@src/shared/store/store";

import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import Calls from "@src/layout/sidebar/Calls/Calls.vue";
import Contacts from "@src/features/contacts/components/Contacts.vue";
import Conversations from "@src/features/conversations/components/Conversations.vue";
import Notifications from "@src/features/notifications/components/Notifications.vue";
import Settings from "@src/features/settings/components/Settings.vue";

const store = useStore();
const route = useRoute();

const isChatRoute = computed(() => {
  return route.path.startsWith("/chat");
});

const ActiveComponent = computed(() => {
  if (isChatRoute.value) {
    return Conversations;
  }
  if (store.activeSidebarComponent === "messages") {
    return Conversations;
  } else if (store.activeSidebarComponent === "contacts") {
    return Contacts;
  } else if (store.activeSidebarComponent === "notifications") {
    return Notifications;
  } else if (store.activeSidebarComponent === "phone") {
    return Calls;
  } else if (store.activeSidebarComponent === "settings") {
    return Settings;
  }
  return Conversations;
});
</script>

<template>
  <aside
    class="bg-app-bg-secondary xs:w-full md:min-w-[18.75rem] md:max-w-[18.75rem] h-full p-0 flex flex-col overflow-visible transition-all duration-500"
  >
    <FadeTransition>
      <component :is="ActiveComponent" class="h-full flex flex-col" />
    </FadeTransition>
  </aside>
</template>
