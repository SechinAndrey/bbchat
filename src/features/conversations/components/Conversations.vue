<script setup lang="ts">
import type { ConversationParams } from "../conversations-service";
import type { ApiCommunicationLead } from "@src/api/types";

import { ref, watch, computed, nextTick, watchEffect } from "vue";
import { useInfiniteScroll, useDebounceFn } from "@vueuse/core";

import { useGlobalDataStore } from "@src/shared/store/global-data-store";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import useStore from "@src/shared/store/store";

import {
  PencilSquareIcon,
  UserIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/vue/24/outline";
import ComposeModal from "@src/features/conversations/modals/ComposeModal/ComposeModal.vue";
import NewLeadModal from "@src/features/conversations/modals/NewLeadModal.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import Button from "@src/ui/inputs/Button.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import SwitchInput from "@src/ui/inputs/SwitchInput.vue";
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
// import ArchivedButton from "@src/features/conversations/components/ArchivedButton.vue";
import ConversationsList from "@src/features/conversations/components/ConversationsList.vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import Select from "@src/ui/inputs/Select.vue";
import { useRoute, useRouter } from "vue-router";
import type { EntityType } from "@src/shared/types/common";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import { useToast } from "@src/shared/composables/useToast";

const route = useRoute();
const router = useRouter();
const id = ref<number | null>(null);
const entity = ref<EntityType>("leads");
const { toastSuccess } = useToast();

const initializeFromRoute = () => {
  if (route.params.id) {
    id.value = Number(route.params.id);
  }
  if (route.params.entity) {
    entity.value = route.params.entity as EntityType;
  }
};

initializeFromRoute();

// Store instances
const store = useStore();
const authStore = useAuthStore();
const globalDataStore = useGlobalDataStore();
const conversationsStore = useConversationsStore();

const composeOpen = ref(false);
const newLeadModalOpen = ref(false);
const openArchive = ref(false);

const selectedUserUI = computed({
  get: () => conversationsStore.filters.user_id ?? "all",
  set: (val) => {
    conversationsStore.filters.user_id = val === "all" ? undefined : val;
  },
});

const keywordUI = computed({
  get: () => conversationsStore.filters.search || "",
  set: (val) => {
    conversationsStore.filters.search = val;
  },
});

const showOnlyUnread = computed({
  get: () => conversationsStore.filters.unread === 1,
  set: (val) => {
    conversationsStore.filters.unread = val ? 1 : undefined;
  },
});

const fetchConversations = (
  entity: EntityType,
  params?: ConversationParams,
) => {
  return conversationsStore.fetch(entity, params);
};

const loadMoreConversations = (entity: EntityType) => {
  return conversationsStore.loadMore(entity);
};

// Computed properties
const userOptions = computed(() => [
  { value: "all", label: "Всі" },
  ...globalDataStore.allUsers.map((user) => ({
    value: user.id,
    label: user.name,
    showIndicator: conversationsStore.unreadByManager[user.id] || false,
  })),
]);

const conversationsList = computed(() => {
  return conversationsStore.conversations[entity.value] || [];
});

const isLoading = computed(() => {
  return conversationsStore.loading[entity.value] || false;
});

const hasMore = computed(() => {
  return conversationsStore.hasMore(entity.value);
});

const debouncedFetch = useDebounceFn(async () => {
  const params: ConversationParams = {
    page: 1,
    search: conversationsStore.filters.search || undefined,
    user_id: conversationsStore.filters.user_id,
    communication_status_id: conversationsStore.filters.communication_status_id,
    unread: conversationsStore.filters.unread,
  };
  await fetchConversations(entity.value, params);
}, 500);

const switching = ref(false);

watch(
  [
    selectedUserUI,
    entity,
    () => conversationsStore.filters.communication_status_id,
    () => conversationsStore.filters.unread,
  ],
  async () => {
    switching.value = true;
    await debouncedFetch();
    switching.value = false;
  },
  {
    immediate: true,
  },
);

watch(selectedUserUI, () => {
  router.push({
    name: "EntityChat",
    params: { entity: entity.value },
  });
  scrollContainer.value?.scrollTo({ top: 0 });
});

watch(keywordUI, debouncedFetch);

watch(
  () => route.params.entity,
  async (newEntity) => {
    if (newEntity && newEntity !== entity.value) {
      entity.value = newEntity as EntityType;

      const params: ConversationParams = {
        page: 1,
        search: conversationsStore.filters.search || undefined,
        user_id: conversationsStore.filters.user_id,
        communication_status_id:
          conversationsStore.filters.communication_status_id,
      };

      await fetchConversations(entity.value, params);
    }
  },
  { immediate: true },
);

watch(
  () => conversationsStore.filters.user_id,
  (newUserId) => {
    if (newUserId === undefined) {
      conversationsStore.clearAllManagerIndicators();
    } else {
      conversationsStore.clearManagerIndicator(newUserId);
    }
  },
);

// Infinite scroll
const scrollContainer = ref<HTMLElement | null>(null);

const loadMore = () => {
  loadMoreConversations(entity.value);
};

const scrollToActiveConversation = async () => {
  await nextTick();
  const contactId = route.params.contactId;
  if (!contactId || !scrollContainer.value) return;

  setTimeout(() => {
    const activeConversation = scrollContainer.value?.querySelector(
      `[data-contact-id="${contactId}"]`,
    );
    if (activeConversation) {
      activeConversation.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 150);
};

watchEffect(() => {
  const contactId = route.params.contactId;
  const conversations = conversationsList.value;

  if (contactId && conversations.length > 0 && scrollContainer.value) {
    scrollToActiveConversation();
  }
});

useInfiniteScroll(
  scrollContainer,
  () => {
    loadMore();
  },
  {
    distance: 300,
    canLoadMore: () => hasMore.value && !isLoading.value,
  },
);

// Slide animation for tabs
const SLIDE = {
  left: "slide-left",
  right: "slide-right",
} as const;

type SlideType = (typeof SLIDE)[keyof typeof SLIDE];
const animation = ref<SlideType>(SLIDE.right);

watch(
  () => conversationsStore.filters.communication_status_id,
  (newStatus, oldStatus) => {
    const directionMap: Record<string, "LEFT" | "RIGHT"> = {
      "undefined->1": "LEFT",
      "1->undefined": "RIGHT",
    };
    const key = `${oldStatus}->${newStatus}`;
    const direction = directionMap[key] ?? "LEFT";
    animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
  },
);

// Initial data fetch
globalDataStore.fetchGlobalData();

// Error handling
watch(
  () => conversationsStore.errors[entity.value],
  (error) => {
    if (error) {
      console.error(`Communications store error for ${entity.value}:`, error);
    }
  },
);

// Modal control
const closeComposeModal = () => {
  composeOpen.value = false;
};

const closeNewLeadModal = () => {
  newLeadModalOpen.value = false;
};

const handleNewLeadSuccess = async (newLead: ApiCommunicationLead) => {
  conversationsStore.addNewConversation("leads", newLead);

  closeNewLeadModal();

  if (newLead.contacts && newLead.contacts.length > 0) {
    const firstContact = newLead.contacts[0];
    await router.push({
      name: "Chat",
      params: {
        entity: "leads",
        id: newLead.id.toString(),
        contactId: firstContact.id.toString(),
      },
    });

    toastSuccess("Лід успішно створений");
  }
};
</script>

<template>
  <div class="bg-theme-conversations overflow-y-hidden">
    <SidebarHeader>
      <!--title-->
      <template #title>
        <div>Чати</div>
      </template>

      <!--side actions-->
      <template v-if="!store.isWidget" #actions>
        <div class="flex items-center gap-3">
          <Select
            v-if="authStore.currentUser?.roleId === 1"
            v-model="selectedUserUI"
            :options="userOptions"
            :show-indicator="conversationsStore.hasAnyUnreadForManagers"
            placeholder="Список менеджерiв"
            :icon="UserIcon"
            class="max-w-[11rem]"
            size="sm"
          />

          <div title="Додати ліда">
            <Button
              class="w-7 h-7"
              aria-label="Додати нового ліда"
              title="Додати нового ліда"
              :icon-only="true"
              variant="ghost"
              size="xs"
              @click="newLeadModalOpen = true"
            >
              <template #icon>
                <PencilSquareIcon class="w-6 h-6" />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </SidebarHeader>

    <!--search bar-->
    <div class="px-5 pb-2 space-y-2">
      <SearchInput v-model="keywordUI" class="!pb-3" />

      <div class="flex items-center gap-4 pb-2">
        <SwitchInput v-model="showOnlyUnread" size="sm" />
        <label
          class="text-sm text-app-text-secondary cursor-pointer select-none"
          @click="showOnlyUnread = !showOnlyUnread"
        >
          Чати без відповіді
        </label>
      </div>
    </div>

    <Tabs v-if="!store.isWidget" class="mx-5 mb-4">
      <Tab
        :active="
          conversationsStore.filters.communication_status_id === undefined
        "
        name="Всі"
        @click="conversationsStore.filters.communication_status_id = undefined"
      />
      <Tab
        :active="conversationsStore.filters.communication_status_id === 1"
        name="Відкриті"
        @click="conversationsStore.filters.communication_status_id = 1"
      />
    </Tabs>

    <!--conversations-->
    <SlideTransition :animation="animation">
      <div
        ref="scrollContainer"
        :key="conversationsStore.filters.communication_status_id"
        role="list"
        aria-label="conversations"
        class="w-full scroll-smooth scrollbar-thin pr-[0.125rem] max-h-[calc(100vh-13.75rem)] md:max-h-[calc(100vh-9.688rem)] overflow-y-auto"
      >
        <div v-if="(isLoading && conversationsList.length === 0) || switching">
          <Circle2Lines v-for="item in 12" :key="item" />
        </div>

        <div v-else>
          <!-- <ArchivedButton
            v-if="conversationsStore.archivedConversations?.length > 0"
            :open="openArchive"
            @click="openArchive = !openArchive"
          /> -->

          <div v-if="conversationsList.length > 0">
            <FadeTransition>
              <ConversationsList
                :key="openArchive ? 'archive' : 'active'"
                :filtered-conversations="conversationsList"
              />
            </FadeTransition>
            <Circle2Lines v-if="isLoading" />
          </div>

          <div v-else>
            <EmptyState
              :icon="ChatBubbleBottomCenterIcon"
              bg
              title="Чати не знайдено"
              class="mx-5"
            />
          </div>
        </div>
      </div>
    </SlideTransition>

    <!--compose modal-->
    <ComposeModal :open="composeOpen" :close-modal="closeComposeModal" />

    <!--new lead modal-->
    <NewLeadModal
      :open="newLeadModalOpen"
      :close-modal="closeNewLeadModal"
      @success="handleNewLeadSuccess"
    />
  </div>
</template>
