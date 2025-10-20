<script setup lang="ts">
import router from "@src/router";
import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  StopCircleIcon,
} from "@heroicons/vue/24/outline";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import Button from "@src/ui/inputs/Button.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { useDebounceFn } from "@vueuse/core";
import { computed, inject, ref, type Ref } from "vue";
import { useToast } from "@src/shared/composables/useToast";
import type { EntityType } from "@src/shared/types/common";
import VuePopper from "@kalimahapps/vue-popper";
import LeadActionModal from "./LeadActionModal.vue";
import { useMessenger } from "@src/features/chat/composables/useMessengerSelection";

const entity = inject<Ref<EntityType>>("entity");
const id = inject<Ref<number>>("id");
const contactId = inject<Ref<number>>("contactId");

const store = useStore();
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const { toastSuccess, toastError } = useToast();
const { currentMessenger, messengerOptions } = useMessenger();

const handleCloseConversation = () => {
  const url = store.isWidget
    ? `/widget/${entity?.value}/${id?.value}`
    : "/chat";
  router.push({ path: url });
};

const debouncedFn = useDebounceFn(() => {
  if (!entity?.value || !id?.value || !contactId?.value) return;
  conversationsStore.fetchMessages(entity.value, id.value, contactId.value, {
    page: 1,
    search: conversationsStore.messagesFilters.search,
  });
}, 500);

const isEndLoading = ref(false);

const endConversation = async () => {
  if (!entity?.value || !id?.value) return;
  try {
    isEndLoading.value = true;
    await conversationsStore.updateConversation(entity.value, id.value, {
      communication_status_id: 2, // 2 - completed
    });
    toastSuccess("Діалог завершено");
  } catch (error) {
    console.error("Error ending conversation:", error);
    toastError("Не вдалося завершити діалог");
  } finally {
    isEndLoading.value = false;
  }
};

const title = computed(() => {
  return conversationsStore.activeConversation?.name || "Діалог";
});

const cityName = computed(() => {
  const city = conversationsStore.activeConversation?.cities?.at(0);
  return city?.name_new_ua || city?.name_ua || city?.name || "Невідоме місто";
});

const isActionModalOpen = ref(false);
const currentActionType = ref<"client" | "supplier" | "manager" | "lead">(
  "client",
);

const openActionModal = (
  actionType: "client" | "supplier" | "manager" | "lead",
) => {
  currentActionType.value = actionType;
  isActionModalOpen.value = true;
};
</script>

<template>
  <!--conversation info-->
  <div
    class="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center"
  >
    <div class="flex items-center gap-3 mb-2">
      <Button
        class="md:!hidden"
        variant="text"
        icon-only
        @click="handleCloseConversation"
      >
        <template #icon>
          <ChevronLeftIcon class="w-[1.25rem] h-[1.25rem]" />
        </template>
      </Button>

      <div class="flex grow min-w-0">
        <!--avatar-->
        <button
          class="mr-5 outline-none flex-shrink-0"
          aria-label="profile avatar"
          @click="store.rightSidebarOpen = !store.rightSidebarOpen"
        >
          <ConversationAvatar
            v-if="conversationsStore.activeConversation"
            :conversation="conversationsStore.activeConversation"
            is-active
          />
        </button>

        <div class="flex flex-col min-w-0 flex-1">
          <Button
            variant="ghost"
            size="xs"
            class="w-fit !text-app-text !px-3 !text-[0.813rem] text-left !justify-start min-w-0 max-w-full"
            tabindex="0"
            @click="store.rightSidebarOpen = !store.rightSidebarOpen"
          >
            <span class="truncate">{{ title }}</span>
          </Button>

          <!-- font-size 11px in rem -->
          <p
            class="text-[0.6875rem] text-app-text-secondary px-3 truncate max-w-full"
          >
            {{ cityName }}
          </p>
        </div>
      </div>

      <Button
        variant="text"
        icon-only
        class="sm:!hidden"
        @click="store.rightSidebarOpen = !store.rightSidebarOpen"
      >
        <template #icon> <InformationCircleIcon /> </template>
      </Button>
    </div>

    <div class="relative flex gap-4 justify-end flex-shrink-0">
      <SearchInput
        v-model="conversationsStore.messagesFilters.search"
        size="sm"
        variant="filled"
        class="w-auto min-w-[8rem] sm:w-[13.563rem] flex-shrink-0"
        @update:model-value="debouncedFn"
      />

      <Button
        v-if="
          messengerOptions.length === 1 && currentMessenger?.label === 'Chaport'
        "
        class="whitespace-nowrap flex-shrink-0 color-white"
        size="sm"
        icon-only
        title="Синхронізцувати"
        variant="text"
      >
        <template #icon>
          <ArrowPathIcon />
        </template>
      </Button>

      <Button
        class="whitespace-nowrap flex-shrink-0 color-white"
        size="sm"
        icon-only
        :loading="isEndLoading"
        title="Завершити діалог"
        variant="text"
        @click="endConversation"
      >
        <template #icon>
          <StopCircleIcon />
        </template>
      </Button>

      <VuePopper placement="bottom-end" :show-arrow="false">
        <Button variant="text" icon-only class="flex-shrink-0">
          <template #icon>
            <EllipsisVerticalIcon />
          </template>
        </Button>

        <template #content>
          <ul>
            <li>
              <Button block variant="ghost" @click="openActionModal('lead')">
                Додати в існуючого ліда
              </Button>
            </li>
            <li>
              <Button
                v-if="authStore.currentUser?.roleId !== 7"
                block
                variant="ghost"
                @click="openActionModal('client')"
              >
                Додати в існуючого клієнта
              </Button>
            </li>
            <li>
              <Button
                v-if="authStore.currentUser?.roleId !== 7"
                block
                variant="ghost"
                @click="openActionModal('supplier')"
              >
                Додати в існуючого постачальника
              </Button>
            </li>
            <li>
              <Button block variant="ghost" @click="openActionModal('manager')">
                Змінити менеджера
              </Button>
            </li>
          </ul>
        </template>
      </VuePopper>

      <Button
        variant="text"
        icon-only
        class="!hidden md:!flex flex-shrink-0"
        @click="store.rightSidebarOpen = !store.rightSidebarOpen"
      >
        <template #icon>
          <ChevronRightIcon v-if="store.rightSidebarOpen" />
          <ChevronLeftIcon v-else />
        </template>
      </Button>
    </div>
  </div>

  <LeadActionModal
    :open="isActionModalOpen"
    :close-modal="() => (isActionModalOpen = false)"
    :action-type="currentActionType"
    :lead-name="title"
    :lead-id="id as number"
  />
</template>
