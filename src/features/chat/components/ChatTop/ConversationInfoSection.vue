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
  LinkIcon,
} from "@heroicons/vue/24/outline";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import Button from "@src/ui/inputs/Button.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { useDebounceFn, useMediaQuery } from "@vueuse/core";
import { computed, inject, ref, watch, type Ref } from "vue";
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
const { isOneEnabledMessenger } = useMessenger();

const isMobile = useMediaQuery("(max-width: 968px)");
watch(isMobile, (newValue) => {
  if (newValue) {
    store.rightSidebarOpen = false;
  }
});

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

const currentEntity = computed(() => {
  return conversationsStore.activeConversation?.entity;
});

const isLead = computed(() => {
  return currentEntity.value === "leads";
});

const isSupplier = computed(() => {
  return currentEntity.value === "suppliers";
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

const copyLink = async () => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.error("Error copying link:", error);
    toastError("Не вдалося скопіювати посилання");
  }
};
</script>

<template>
  <!--conversation info-->
  <div
    class="w-full flex flex-col xl:flex-row xl:justify-between xl:items-center"
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

        <div
          class="flex flex-col min-w-[6rem]"
          :class="
            store.rightSidebarOpen
              ? 'max-w-[calc(100vw-31rem-42.563rem)]'
              : 'max-w-[calc(100vw-26rem-23.81rem)]'
          "
        >
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
        v-if="isOneEnabledMessenger('Chaport')"
        class="whitespace-nowrap flex-shrink-0 color-white xl:!hidden"
        size="sm"
        icon-only
        title="Синхронізцувати"
        variant="text"
      >
        <template #icon>
          <ArrowPathIcon class="w-6 h-6" />
        </template>
      </Button>

      <Button
        class="whitespace-nowrap flex-shrink-0 color-white xl:!hidden"
        size="sm"
        icon-only
        title="Скопіювати посилання на діалог"
        variant="text"
        @click="copyLink"
      >
        <template #icon>
          <LinkIcon class="w-6 h-6" />
        </template>
      </Button>

      <Button
        class="whitespace-nowrap flex-shrink-0 color-white xl:!hidden"
        size="sm"
        icon-only
        :loading="isEndLoading"
        title="Завершити діалог"
        variant="text"
        @click="endConversation"
      >
        <template #icon>
          <StopCircleIcon class="w-6 h-6" />
        </template>
      </Button>

      <VuePopper v-if="!isSupplier" placement="bottom-end" :show-arrow="false">
        <Button variant="text" icon-only class="flex-shrink-0 xl:!hidden">
          <template #icon>
            <EllipsisVerticalIcon class="w-6 h-6" />
          </template>
        </Button>

        <template #content>
          <ul>
            <li v-if="isLead">
              <Button block variant="text" @click="openActionModal('lead')">
                Додати в існуючого ліда
              </Button>
            </li>
            <li v-if="authStore.currentUser?.roleId !== 7 && isLead">
              <Button block variant="text" @click="openActionModal('client')">
                Додати в існуючого клієнта
              </Button>
            </li>
            <li v-if="authStore.currentUser?.roleId !== 7 && isLead">
              <Button block variant="text" @click="openActionModal('supplier')">
                Додати в існуючого постачальника
              </Button>
            </li>
            <li v-if="authStore.currentUser?.roleId === 1">
              <Button block variant="text" @click="openActionModal('manager')">
                Змінити менеджера
              </Button>
            </li>
          </ul>
        </template>
      </VuePopper>

      <Button
        variant="text"
        icon-only
        class="md:!hidden"
        @click="store.rightSidebarOpen = !store.rightSidebarOpen"
      >
        <template #icon> <InformationCircleIcon class="w-6 h-6" /> </template>
      </Button>

      <Button
        variant="text"
        icon-only
        class="flex-shrink-0 !hidden md:!block xl:!hidden"
        @click="store.rightSidebarOpen = !store.rightSidebarOpen"
      >
        <template #icon>
          <ChevronRightIcon v-if="store.rightSidebarOpen" class="w-6 h-6" />
          <ChevronLeftIcon v-else class="w-6 h-6" />
        </template>
      </Button>
    </div>

    <div class="relative flex gap-4 justify-end flex-shrink-0 hidden xl:flex">
      <SearchInput
        v-model="conversationsStore.messagesFilters.search"
        size="sm"
        variant="filled"
        title="pc-search"
        class="w-auto min-w-[8rem] sm:w-[13.563rem] flex-shrink-0"
        @update:model-value="debouncedFn"
      />

      <Button
        v-if="isOneEnabledMessenger('Chaport')"
        class="whitespace-nowrap flex-shrink-0 color-white"
        size="sm"
        icon-only
        title="Синхронізцувати"
        variant="text"
      >
        <template #icon>
          <ArrowPathIcon class="w-6 h-6" />
        </template>
      </Button>

      <Button
        class="whitespace-nowrap flex-shrink-0 color-white"
        size="sm"
        icon-only
        title="Скопіювати посилання на діалог"
        variant="text"
        @click="copyLink"
      >
        <template #icon>
          <LinkIcon class="w-6 h-6" />
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
          <StopCircleIcon class="w-6 h-6" />
        </template>
      </Button>

      <VuePopper placement="bottom-end" :show-arrow="false">
        <Button variant="text" icon-only class="flex-shrink-0">
          <template #icon>
            <EllipsisVerticalIcon class="w-6 h-6" />
          </template>
        </Button>

        <template #content>
          <ul>
            <li>
              <Button block variant="text" @click="openActionModal('lead')">
                Додати в існуючого ліда
              </Button>
            </li>
            <li>
              <Button
                v-if="authStore.currentUser?.roleId !== 7"
                block
                variant="text"
                @click="openActionModal('client')"
              >
                Додати в існуючого клієнта
              </Button>
            </li>
            <li>
              <Button
                v-if="authStore.currentUser?.roleId !== 7"
                block
                variant="text"
                @click="openActionModal('supplier')"
              >
                Додати в існуючого постачальника
              </Button>
            </li>
            <li>
              <Button block variant="text" @click="openActionModal('manager')">
                Змінити менеджера
              </Button>
            </li>
          </ul>
        </template>
      </VuePopper>

      <Button
        variant="text"
        icon-only
        class="flex-shrink-0"
        @click="store.rightSidebarOpen = !store.rightSidebarOpen"
      >
        <template #icon>
          <ChevronRightIcon v-if="store.rightSidebarOpen" class="w-6 h-6" />
          <ChevronLeftIcon v-else class="w-6 h-6" />
        </template>
      </Button>
    </div>

    <SearchInput
      v-model="conversationsStore.messagesFilters.search"
      size="sm"
      variant="filled"
      class="xl:!hidden"
      title="mobile-search"
      @update:model-value="debouncedFn"
    />
  </div>

  <LeadActionModal
    :open="isActionModalOpen"
    :close-modal="() => (isActionModalOpen = false)"
    :action-type="currentActionType"
    :lead-name="title"
    :lead-id="id as number"
    :current-contact-id="contactId"
  />
</template>
