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
import { inject, ref } from "vue";
import { toast, type ToastOptions } from "vue3-toastify";

const entity = inject<"leads" | "clients">("entity");
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
      entity as "leads" | "clients",
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
</script>

<template>
  <!--conversation info-->
  <div class="w-full flex justify-center items-center">
    <div class="group mr-4 md:hidden">
      <IconButton
        class="ic-btn-ghost-primary w-7 h-7"
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
        />
      </button>

      <div class="flex flex-col">
        <p
          class="w-fit heading-2 text-color cursor-pointer"
          tabindex="0"
          @click="store.rightSidebarOpen = true"
        >
          {{ conversationsStore?.activeConversationInfo?.id }}
        </p>

        <!-- font-size 11px in rem -->
        <p class="text-[0.6875rem] text-neutral-active">Запорожье</p>
      </div>
    </div>

    <div class="flex">
      <div class="relative flex items-center gap-4">
        <SearchInput
          v-model="conversationsStore.messagesFilters.search"
          input-class="bg-theme-conversations"
          size="small"
          @update:model-value="debouncedFn"
        />

        <Button
          class="contained-primary contained-text whitespace-nowrap"
          size="small"
          :loading="isLoading"
          @click="endConversation"
        >
          Завершити діалог
        </Button>

        <IconButton
          class="ic-btn-ghost-primary open-top-menu group w-7 h-7"
          @click="store.rightSidebarOpen = !store.rightSidebarOpen"
        >
          <ChevronRightIcon
            v-if="store.rightSidebarOpen"
            class="open-top-menu w-[1.25rem] h-[1.25rem]"
          />
          <ChevronLeftIcon
            v-else
            class="open-top-menu w-[1.25rem] h-[1.25rem]"
          />
        </IconButton>
      </div>
    </div>
  </div>
</template>
