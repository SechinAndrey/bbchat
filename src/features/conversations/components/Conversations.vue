<script setup lang="ts">
import type { Ref } from "vue";
import type { ConversationParams } from "../conversations-service";
import type { CreateLeadRequest } from "@src/api/types";

import { ref, watch, computed } from "vue";
import { useInfiniteScroll, useDebounceFn } from "@vueuse/core";

import { useGlobalDataStore } from "@src/shared/store/global-data-store";
import conversationsService from "@src/features/conversations/conversations-service";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import { useAuthStore } from "@src/features/auth/store/auth-store";

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
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
// import ArchivedButton from "@src/features/conversations/components/ArchivedButton.vue";
import ConversationsList from "@src/features/conversations/components/ConversationsList.vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import Select from "@src/ui/inputs/Select.vue";
import flemeIcon from "@src/ui/icons/flemeIcon.vue";
import clientIcon from "@src/ui/icons/clientIcon.vue";
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
const authStore = useAuthStore();
const globalDataStore = useGlobalDataStore();
const conversationsStore = useConversationsStore();

// State refs
const selectedUser = ref<number | "all">("all");
const selectedFilter = ref<EntityType>(
  (route.params.entity as EntityType) || "leads",
);
const keyword: Ref<string> = ref("");
const composeOpen = ref(false);
const newLeadModalOpen = ref(false);
const openArchive = ref(false);

const TAB = {
  all: "all",
  open: "open",
};
const activeTab = ref(TAB.all);

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
  })),
]);

const filterOptions = computed(() => {
  const options = [{ value: "leads", label: "Ліди" }];
  if (
    authStore.currentUser?.roleId === 1 ||
    authStore.currentUser?.roleId === 2
  ) {
    options.push({ value: "clients", label: "Клієнти" });
  }
  return options;
});

const conversationsList = computed(() => {
  return conversationsStore.conversations[selectedFilter.value] || [];
});

const isLoading = computed(() => {
  return conversationsStore.loading[selectedFilter.value] || false;
});

const hasMore = computed(() => {
  return conversationsStore.hasMore(selectedFilter.value);
});

const debouncedFetch = useDebounceFn(async () => {
  const params: ConversationParams = {
    page: 1,
    search: keyword.value || undefined,
    user_id: selectedUser.value === "all" ? undefined : selectedUser.value,
    communication_status_id: activeTab.value === TAB.open ? 1 : undefined,
  };
  await fetchConversations(selectedFilter.value, params);
}, 500);

watch([selectedUser, selectedFilter, activeTab], debouncedFetch, {
  immediate: true,
});

watch(keyword, debouncedFetch);

watch(
  () => route.params.entity,
  async (newEntity) => {
    if (newEntity && newEntity !== selectedFilter.value) {
      selectedFilter.value = newEntity as EntityType;

      const params: ConversationParams = {
        page: 1,
        search: keyword.value || undefined,
        user_id: selectedUser.value === "all" ? undefined : selectedUser.value,
        communication_status_id: activeTab.value === TAB.open ? 1 : undefined,
      };

      await fetchConversations(selectedFilter.value, params);
    }
  },
  { immediate: true },
);

const leadClientIcon = computed(() => {
  return selectedFilter.value === "leads" ? flemeIcon : clientIcon;
});

// Infinite scroll
const scrollContainer = ref<HTMLElement | null>(null);

const loadMore = () => {
  loadMoreConversations(selectedFilter.value);
};

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

watch(activeTab, (newTab, oldTab) => {
  const directionMap: Record<string, "LEFT" | "RIGHT"> = {
    "all->open": "LEFT",
    "open->all": "RIGHT",
  };
  const key = `${oldTab}->${newTab}`;
  const direction = directionMap[key] ?? "LEFT";
  animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
});

// Initial data fetch
globalDataStore.fetchGlobalData();

// Error handling
watch(
  () => conversationsStore.errors[selectedFilter.value],
  (error) => {
    if (error) {
      console.error(
        `Communications store error for ${selectedFilter.value}:`,
        error,
      );
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

const handleNewLeadSubmit = async (leadData: CreateLeadRequest) => {
  try {
    const newLead = await conversationsService.createLead(leadData);

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
  } catch (error) {
    console.error("Failed to create lead:", error);
  }
};
</script>

<template>
  <div class="bg-theme-conversations">
    <SidebarHeader>
      <!--title-->
      <template #title>
        <div>Чати</div>
      </template>

      <!--side actions-->
      <template #actions>
        <div class="flex items-center gap-3">
          <Select
            v-if="authStore.currentUser?.roleId === 1"
            v-model="selectedUser"
            :options="userOptions"
            placeholder="Список менеджерiв"
            :icon="UserIcon"
            class="w-12"
            size="sm"
          />

          <Select
            v-if="route.params.entity !== 'suppliers'"
            v-model="selectedFilter"
            :options="filterOptions"
            size="sm"
            :class="{ 'w-10': authStore.currentUser?.roleId === 1 }"
            :icon="leadClientIcon"
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
                <PencilSquareIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </SidebarHeader>

    <!--search bar-->
    <div class="px-5 pb-4">
      <SearchInput v-model="keyword" />
    </div>

    <Tabs class="mx-5 mb-4">
      <Tab
        :active="activeTab === TAB.all"
        name="Всі"
        @click="activeTab = TAB.all"
      />
      <Tab
        :active="activeTab === TAB.open"
        name="Відкриті"
        @click="activeTab = TAB.open"
      />
    </Tabs>

    <!--conversations-->
    <SlideTransition :animation="animation">
      <div
        ref="scrollContainer"
        :key="activeTab"
        role="list"
        aria-label="conversations"
        class="w-full h-full scroll-smooth scrollbar-hidden"
        style="overflow-x: visible; overflow-y: scroll"
      >
        <div v-if="isLoading && conversationsList.length === 0">
          <Circle2Lines v-for="item in 8" :key="item" />
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
      @submit="handleNewLeadSubmit"
    />
  </div>
</template>
