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
  PlayCircleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/vue/24/outline";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import Button from "@src/ui/inputs/Button.vue";
import ConversationAvatar from "@src/shared/components/ConversationAvatar.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { useDebounceFn, useMediaQuery } from "@vueuse/core";
import { computed, inject, ref, watch, type Ref } from "vue";
import { useToast } from "@src/shared/composables/useToast";
import type { EntityType } from "@src/shared/types/common";
import { CONTRAGENT_TO_ENTITY_MAP } from "@src/shared/types/common";
import VuePopper from "@kalimahapps/vue-popper";
import LeadActionModal from "./LeadActionModal.vue";
import { useMessenger } from "@src/features/chat/composables/useMessengerSelection";
import leadActionsService from "@src/shared/services/lead-actions-service";
import contactsService from "@src/api/contacts-service";

const entity = inject<Ref<EntityType>>("entity");
const id = inject<Ref<number>>("id");
const contactId = inject<Ref<number>>("contactId");

const store = useStore();
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const { toastSuccess, toastError } = useToast();
const { activeContact } = useMessenger();

const isMobile = useMediaQuery("(max-width: 968px)");
const isSmallMobile = useMediaQuery("(max-width: 620px)");

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

const isSwitchStatusLoading = ref(false);

const switchConversationStatus = async () => {
  if (!entity?.value || !id?.value || !contactId?.value || !activeContact.value)
    return;
  try {
    isSwitchStatusLoading.value = true;
    const currentStatus = activeContact.value.communication_status_id;
    const newStatus = currentStatus === 1 ? 2 : 1; // 1 - active, 2 - stopped

    // Update contact status
    await contactsService.updateCommunicationStatus(
      entity.value,
      id.value,
      contactId.value,
      newStatus,
    );
    activeContact.value.communication_status_id = newStatus;

    toastSuccess(newStatus === 2 ? "Діалог завершено" : "Діалог відновлено");
    closePopperMenu();
  } catch (error) {
    console.error("Error switching conversation status:", error);
    toastError("Не вдалося змінити статус діалогу");
  } finally {
    isSwitchStatusLoading.value = false;
  }
};

const isSyncLoading = ref(false);

const synchronizeConversation = async () => {
  if (!id?.value || !contactId?.value || !entity?.value) return;
  try {
    isSyncLoading.value = true;
    const response = await leadActionsService.synchronize(
      id.value,
      contactId.value,
    );

    if (response.status === 200 && response.data) {
      const { merge_info } = response.data;
      const isMerged = merge_info && merge_info.from_lead_id === id.value;

      if (isMerged) {
        const targetEntity = CONTRAGENT_TO_ENTITY_MAP[merge_info.entity];
        const targetEntityId = merge_info.id;
        const targetContactId = merge_info.contacts_ids[0];

        await conversationsStore.handleChaportSync(response.data);

        if (!store.isWidget) {
          await router.push({
            name: "Chat",
            params: {
              entity: targetEntity,
              id: targetEntityId.toString(),
              contactId: targetContactId.toString(),
            },
          });
        } else {
          await router.push({
            name: "EntityChat",
            params: {
              entity: targetEntity,
              id: targetEntityId.toString(),
            },
          });
        }

        const messageEntityText = {
          leads: "ліда",
          clients: "клієнта",
          suppliers: "постачальника",
        };

        toastSuccess(
          `Синхронізацію виконано. Контакт об'єднано з існуючим контактом ${messageEntityText[targetEntity] || ""}`,
        );
      } else {
        const currentMessages =
          conversationsStore.activeConversation?.messages || [];

        await conversationsStore.fetchConversation(entity.value, id.value);

        if (conversationsStore.activeConversation) {
          conversationsStore.activeConversation.messages = currentMessages;
        }

        await conversationsStore.fetch(entity.value, { page: 1 });

        toastSuccess("Синхронізацію успішно виконано");
      }
      closePopperMenu();
    }
  } catch (error) {
    console.error("Error synchronizing conversation:", error);
    toastError("Не вдалося синхронізувати діалог");
  } finally {
    isSyncLoading.value = false;
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

const isClient = computed(() => {
  return currentEntity.value === "clients";
});

const isSupplier = computed(() => {
  return currentEntity.value === "suppliers";
});

const showActionsBtn = computed(() => {
  if (isLead.value) {
    return true;
  } else if (isClient.value) {
    return authStore.currentUser?.roleId === 1;
  } else if (isSupplier.value) {
    return false;
  } else {
    return authStore.currentUser?.roleId === 1;
  }
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
    toastSuccess("Посилання скопійовано");
    closePopperMenu();
  } catch (error) {
    console.error("Error copying link:", error);
    toastError("Не вдалося скопіювати посилання");
  }
};

const isConversationActive = computed(() => {
  return activeContact.value?.communication_status_id === 1;
});

const clientCrmLink = computed(() => {
  if (!conversationsStore.activeConversation) return "#";

  return `${import.meta.env.VITE_CRM_BASE}/manager/leads/lead2client/${conversationsStore.activeConversation.id}`;
});

const mobileActionsPopperRef = ref<InstanceType<typeof VuePopper> | null>(null);

const closePopperMenu = () => {
  if (
    mobileActionsPopperRef.value &&
    mobileActionsPopperRef.value.toggleTooltip
  ) {
    mobileActionsPopperRef.value.toggleTooltip("close");
  }
};

const titleContainerClasses = computed(() => {
  if (isSmallMobile.value) {
    return "max-w-[calc(100vw-12.5rem)]";
  }

  return store.rightSidebarOpen
    ? "max-w-[calc(100vw-31rem-42.563rem)]"
    : "max-w-[calc(100vw-26rem-23.81rem)]";
});
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
          class="mr-2 outline-none flex-shrink-0"
          aria-label="profile avatar"
          @click="store.rightSidebarOpen = !store.rightSidebarOpen"
        >
          <ConversationAvatar
            v-if="conversationsStore.activeConversation"
            :conversation="conversationsStore.activeConversation"
            is-active
          />
        </button>

        <div class="flex flex-col min-w-[6rem]" :class="titleContainerClasses">
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
        v-if="isLead && activeContact?.chaport_id && !isSmallMobile"
        class="whitespace-nowrap flex-shrink-0 color-white xl:!hidden"
        size="sm"
        icon-only
        :disabled="isSyncLoading"
        title="Синхронізувати"
        variant="text"
        @click="synchronizeConversation"
      >
        <template #icon>
          <ArrowPathIcon
            class="w-6 h-6"
            :class="{ 'animate-spin': isSyncLoading }"
          />
        </template>
      </Button>

      <Button
        v-if="!isSmallMobile"
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
        v-if="!isSmallMobile"
        class="whitespace-nowrap flex-shrink-0 color-white xl:!hidden"
        size="sm"
        icon-only
        :loading="isSwitchStatusLoading"
        :title="isConversationActive ? 'Завершити діалог' : 'Відновити діалог'"
        variant="text"
        @click="switchConversationStatus"
      >
        <template #icon>
          <StopCircleIcon v-if="isConversationActive" class="w-6 h-6" />
          <PlayCircleIcon v-else class="w-6 h-6" />
        </template>
      </Button>

      <VuePopper
        v-if="showActionsBtn || isSmallMobile"
        ref="mobileActionsPopperRef"
        placement="bottom-end"
        :show-arrow="false"
      >
        <Button variant="text" icon-only class="flex-shrink-0 xl:!hidden">
          <template #icon>
            <EllipsisVerticalIcon class="w-6 h-6" />
          </template>
        </Button>

        <template #content>
          <ul>
            <template v-if="isSmallMobile">
              <li v-if="isLead && activeContact?.chaport_id">
                <Button
                  block
                  variant="text"
                  :disabled="isSyncLoading"
                  @click="synchronizeConversation"
                >
                  <ArrowPathIcon
                    class="w-5 h-5 mr-2"
                    :class="{ 'animate-spin': isSyncLoading }"
                  />
                  Синхронізувати
                </Button>
              </li>
              <li>
                <Button block variant="text" @click="copyLink">
                  <LinkIcon class="w-5 h-5 mr-2" />
                  Скопіювати посилання
                </Button>
              </li>
              <li>
                <Button
                  block
                  variant="text"
                  :disabled="isSwitchStatusLoading"
                  @click="switchConversationStatus"
                >
                  <StopCircleIcon
                    v-if="isConversationActive"
                    class="w-5 h-5 mr-2"
                  />
                  <PlayCircleIcon v-else class="w-5 h-5 mr-2" />
                  {{
                    isConversationActive
                      ? "Завершити діалог"
                      : "Відновити діалог"
                  }}
                </Button>
              </li>

              <li
                v-if="showActionsBtn"
                class="border-t border-app-border my-1"
              ></li>
            </template>

            <template v-if="showActionsBtn">
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
                <a target="_blank" :href="clientCrmLink">
                  <Button
                    block
                    variant="text"
                    class="hover:underline underline-offset-[0.4rem]"
                  >
                    <ArrowTopRightOnSquareIcon
                      class="min-w-5 min-h-5 max-w-5 max-h-5 mr-2"
                    />
                    Перевести в клієнти
                  </Button>
                </a>
              </li>
              <li v-if="authStore.currentUser?.roleId !== 7 && isLead">
                <Button
                  block
                  variant="text"
                  @click="openActionModal('supplier')"
                >
                  Додати в існуючого постачальника
                </Button>
              </li>
              <li v-if="authStore.currentUser?.roleId === 1">
                <Button
                  block
                  variant="text"
                  @click="openActionModal('manager')"
                >
                  Змінити менеджера
                </Button>
              </li>
            </template>
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
        v-if="isLead && activeContact?.chaport_id"
        class="whitespace-nowrap flex-shrink-0 color-white"
        size="sm"
        icon-only
        :disabled="isSyncLoading"
        title="Синхронізувати"
        variant="text"
        @click="synchronizeConversation"
      >
        <template #icon>
          <ArrowPathIcon
            class="w-6 h-6"
            :class="{ 'animate-spin': isSyncLoading }"
          />
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
        :loading="isSwitchStatusLoading"
        :title="isConversationActive ? 'Завершити діалог' : 'Відновити діалог'"
        variant="text"
        @click="switchConversationStatus"
      >
        <template #icon>
          <StopCircleIcon v-if="isConversationActive" class="w-6 h-6" />
          <PlayCircleIcon v-else class="w-6 h-6" />
        </template>
      </Button>

      <VuePopper
        v-if="showActionsBtn"
        placement="bottom-end"
        :show-arrow="false"
      >
        <Button variant="text" icon-only class="flex-shrink-0">
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
