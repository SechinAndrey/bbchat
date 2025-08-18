<script setup lang="ts">
import router from "@src/router";
import useStore from "@src/shared/store/store";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import Button from "@src/ui/inputs/Button.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { useDebounceFn } from "@vueuse/core";
import { computed, inject, ref } from "vue";
import { toast, type ToastOptions } from "vue3-toastify";
import type { EntityType } from "@src/shared/types/common";

const entity = inject<EntityType>("entity");
const id = inject<number>("id");

const store = useStore();
const conversationsStore = useConversationsStore();

const handleCloseConversation = () => {
  router.push({ path: "/chat/" });
};

const debouncedFn = useDebounceFn(() => {
  if (!entity || !id) return;
  conversationsStore.fetchCommunicationMessages(entity, id, {
    page: 1,
    search: conversationsStore.messagesFilters.search,
  });
}, 500);

const isLoading = ref(false);

const endConversation = async () => {
  if (!entity || !id) return;
  try {
    isLoading.value = true;
    await conversationsStore.updateConversation(
      entity as EntityType,
      id as number,
      {
        communication_status_id: 2, // 2 - completed
      },
    );
    toast("Діалог завершено", {
      autoClose: 2000,
      type: "success",
      position: toast.POSITION.BOTTOM_RIGHT,
      theme: store.settings.darkMode ? "dark" : "light",
    } as ToastOptions);
  } catch (error) {
    console.error("Error ending conversation:", error);
    toast("Не вдалося завершити діалог", {
      position: toast.POSITION.BOTTOM_RIGHT,
      type: "error",
      theme: store.settings.darkMode ? "dark" : "light",
    } as ToastOptions);
  } finally {
    isLoading.value = false;
  }
};

const title = computed(() => {
  return conversationsStore.activeConversationInfo?.name || "Діалог";
});

const cityName = computed(() => {
  const city = conversationsStore.activeConversationInfo?.cities?.at(0);
  return city?.name_new_ua || city?.name_ua || city?.name || "Невідоме місто";
});
</script>

<template>
  <!--conversation info-->
  <div class="w-full flex justify-center items-center">
    <div class="group mr-4 md:hidden">
      <IconButton
        class="w-7 h-7"
        title="close conversation"
        aria-label="close conversation"
        @click="handleCloseConversation"
      >
        <ChevronLeftIcon class="w-[1.25rem] h-[1.25rem]" />
      </IconButton>
    </div>

    <div class="flex grow">
      <!--avatar-->
      <button class="mr-5 outline-none" aria-label="profile avatar">
        <ConversationAvatar
          v-if="conversationsStore.activeConversationInfo"
          :conversation="conversationsStore.activeConversationInfo"
          is-active
        />
      </button>

      <div class="flex flex-col">
        <p
          class="w-fit cursor-pointer"
          tabindex="0"
          @click="store.rightSidebarOpen = true"
        >
          {{ title }}
        </p>

        <!-- font-size 11px in rem -->
        <p class="text-[0.6875rem] text-app-text-secondary">{{ cityName }}</p>
      </div>
    </div>

    <div class="flex">
      <div class="relative flex items-center gap-4">
        <SearchInput
          v-model="conversationsStore.messagesFilters.search"
          size="sm"
          variant="filled"
          class="max-w-[13.563rem]"
          @update:model-value="debouncedFn"
        />

        <Button
          class="whitespace-nowrap"
          size="sm"
          :loading="isLoading"
          @click="endConversation"
        >
          Завершити діалог
        </Button>

        <Button
          variant="text"
          icon-only
          @click="store.rightSidebarOpen = !store.rightSidebarOpen"
        >
          <template #icon>
            <ChevronRightIcon v-if="store.rightSidebarOpen" />
            <ChevronLeftIcon v-else />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
