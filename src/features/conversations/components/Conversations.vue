<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type { Ref } from "vue";
import type { GetCommunicationsParams } from "../conversations-service";

import { onMounted, ref, watch, computed, onUnmounted } from "vue";
import { useInfiniteScroll } from "@vueuse/core";

import useStore from "@src/shared/store/store";
import { useGlobalDataStore } from "@src/shared/store/global-data-store";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import { getActiveConversationId, getName } from "@src/shared/utils/utils";

import { PencilSquareIcon, UserIcon } from "@heroicons/vue/24/outline";
import ComposeModal from "@src/features/conversations/modals/ComposeModal/ComposeModal.vue";
import NoConversation from "@src/ui/states/empty-states/NoConversation.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import ArchivedButton from "@src/features/conversations/components/ArchivedButton.vue";
import ConversationsList from "@src/features/conversations/components/ConversationsList.vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import Select from "@src/ui/inputs/Select.vue";

const selectedUser = ref<number | "all">("all");
const selectedFilter = ref("leads");

const userOptions = computed(() => [
  { value: "all", label: "Всі" },
  ...globalDataStore.allUsers.map((user) => ({
    value: user.id,
    label: user.name,
  })),
]);

const filterOptions = ref([
  { value: "leads", label: "🔥 Ліди" },
  { value: "clients", label: "👨‍💼 Клієнти" },
]);

const conversationsStore = useConversationsStore();
const { fetchLeads, fetchClients, loadMoreLeads, loadMoreClients } =
  conversationsStore;
const keyword: Ref<string> = ref("");
const composeOpen = ref(false);

const apiConversations = computed(() => {
  return selectedFilter.value === "leads"
    ? conversationsStore.leads
    : conversationsStore.clients;
});

const currentConversations = computed(() => {
  return apiConversations.value.map(
    (conv) =>
      ({
        ...(conv as any),
        type: conv.type || "",
      }) as IConversation,
  );
});

const isLoading = computed(() => {
  return selectedFilter.value === "leads"
    ? conversationsStore.isLoadingLeads
    : conversationsStore.isLoadingClients;
});

const hasMore = computed(() => {
  return selectedFilter.value === "leads"
    ? conversationsStore.hasMoreLeads
    : conversationsStore.hasMoreClients;
});

watch(
  [keyword, selectedUser, selectedFilter],
  () => {
    const params: GetCommunicationsParams = {
      page: 1,
      search: keyword.value,
      user_id: selectedUser.value === "all" ? undefined : selectedUser.value,
    };

    if (selectedFilter.value === "leads") {
      fetchLeads(params);
    } else {
      fetchClients(params);
    }
  },
  { immediate: true },
);

const scrollContainer = ref<HTMLElement | null>(null);

const loadMore = () => {
  if (selectedFilter.value === "leads") {
    loadMoreLeads();
  } else {
    loadMoreClients();
  }
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

// active tab name
const TAB = {
  open: "open",
  all: "all",
} as const;
type TabName = (typeof TAB)[keyof typeof TAB];
const activeTab = ref<TabName>(TAB.all);

// slide animation
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
  const direction = directionMap[key] ?? "LEFT"; // fallback

  animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
});

const store = useStore();
const globalDataStore = useGlobalDataStore();
globalDataStore.fetchGlobalData();

// determines whether the archive is open or not
const openArchive = ref(false);

// Handle errors from communications store
watch(
  () => conversationsStore.error,
  (hasError) => {
    if (hasError) {
      console.error("Communications store error:", conversationsStore.error);
      // You can add toast notification or other error handling here
    }
  },
);

// (event) close the compose modal.
const closeComposeModal = () => {
  composeOpen.value = false;
};

// if the active conversation is in the archive
// then open the archive
onMounted(async () => {
  // Initialize conversations from the new communications store

  // const success = await conversationsStore.fetchConversations();

  let conversation = store.archivedConversations.find(
    (conversation) => conversation.id === getActiveConversationId(),
  );
  if (conversation) openArchive.value = true;
});
</script>

<template>
  <div class="bg-theme-conversations">
    <SidebarHeader>
      <!--title-->
      <template v-slot:title>
        <div @click="apiClient.get('/communications/clients')">Чаты</div>
      </template>

      <!--side actions-->
      <template v-slot:actions>
        <div class="flex items-center gap-3">
          <Select
            v-model="selectedUser"
            :options="userOptions"
            placeholder="Список менеджерiв"
            :icon="UserIcon"
            class="w-12"
            size="sm"
          />

          <Select
            v-model="selectedFilter"
            :options="filterOptions"
            placeholder="🔥"
            :icon="null"
            size="sm"
            class="w-10"
          />

          <div title="Comming soon">
            <IconButton
              class="disabled ic-btn-ghost-primary w-7 h-7"
              @click="composeOpen = true"
              aria-label="compose conversation"
              title="compose conversation"
            >
              <PencilSquareIcon class="w-[1.25rem] h-[1.25rem]" />
            </IconButton>
          </div>
        </div>
      </template>
    </SidebarHeader>

    <!--search bar-->
    <div class="px-5 pb-4">
      <SearchInput
        @value-changed="
          (value) => {
            keyword = value;
          }
        "
        :value="keyword"
      />
    </div>

    <Tabs class="mx-5 mb-4">
      <Tab
        :active="activeTab === TAB.all"
        name="Все"
        @click="activeTab = TAB.all"
      />
      <Tab
        :active="activeTab === TAB.open"
        name="Открытые"
        @click="activeTab = TAB.open"
      />
    </Tabs>

    <!--conversations-->
    <SlideTransition :animation="animation">
      <div
        ref="scrollContainer"
        role="list"
        aria-label="conversations"
        class="w-full h-full scroll-smooth scrollbar-hidden"
        style="overflow-x: visible; overflow-y: scroll"
        :key="activeTab"
      >
        <Circle2Lines
          v-if="isLoading && currentConversations.length === 0"
          v-for="item in 6"
        />

        <div v-else>
          <ArchivedButton
            v-if="store.archivedConversations.length > 0"
            :open="openArchive"
            @click="openArchive = !openArchive"
          />

          <div v-if="currentConversations.length > 0">
            <FadeTransition>
              <ConversationsList
                :filtered-conversations="currentConversations"
                :key="openArchive ? 'archive' : 'active'"
              />
            </FadeTransition>
            <Circle2Lines v-if="isLoading" />
          </div>

          <div v-else>
            <NoConversation v-if="store.archivedConversations.length === 0" />
          </div>
        </div>
      </div>
    </SlideTransition>

    <!--compose modal-->
    <ComposeModal :open="composeOpen" :close-modal="closeComposeModal" />
  </div>
</template>
