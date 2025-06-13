<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type { Ref } from "vue";

import { onMounted, ref, watch, computed } from "vue";

// import useStore from "@src/shared/store/store"; // Removed old store
import { useConversationsStore } from "@src/features/conversations/store/conversations-store"; // Added new store
import { getName } from "@src/shared/utils/utils"; // Removed getActiveConversationId as it's not used

import { PencilSquareIcon } from "@heroicons/vue/24/outline";
import ComposeModal from "@src/features/conversations/modals/ComposeModal/ComposeModal.vue";
import NoConversation from "@src/ui/states/empty-states/NoConversation.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
// import ArchivedButton from "@src/features/conversations/components/ArchivedButton.vue"; // Removed archive-related component
import ConversationsList from "@src/features/conversations/components/ConversationsList.vue";
import SidebarHeader from "@src/layout/sidebar/SidebarHeader.vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";

// active tab name
const TAB = {
  open: "open",
  all: "all",
} as const;
type TabName = (typeof TAB)[keyof typeof TAB];
const activeTab = ref<TabName>(TAB.all);
const TAB_ORDER: (typeof TAB)[keyof typeof TAB][] = [TAB.open, TAB.all];

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
  const direction = directionMap[key] ?? "LEFT";

  animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
});

const conversationsStore = useConversationsStore();

const keyword: Ref<string> = ref("");
const composeOpen = ref(false);

const allConversationsFromStore = computed(
  () => conversationsStore.allConversations,
);

// the filtered list of conversations.
const filteredConversations: Ref<IConversation[]> = ref([]);

// filter the list of conversation based on search text.
watch(
  [keyword, allConversationsFromStore, activeTab], // Added activeTab
  () => {
    let conversationsToFilter: IConversation[] = [];

    // Determine which list of conversations to use based on the active tab
    // For now, 'open' tab uses the same list as 'all'.
    // This will need to be updated when 'open' tab has its own logic.
    if (activeTab.value === TAB.all || activeTab.value === TAB.open) {
      conversationsToFilter = allConversationsFromStore.value || [];
    }
    // Removed archive-related logic

    if (conversationsToFilter) {
      filteredConversations.value = conversationsToFilter.filter(
        (conversation) =>
          getName(conversation)
            ?.toLowerCase()
            .includes(keyword.value.toLowerCase()),
      );
    } else {
      filteredConversations.value = [];
    }
  },
  { immediate: true, deep: true }, // Added deep: true for allConversationsFromStore
);

// (event) close the compose modal.
const closeComposeModal = () => {
  composeOpen.value = false;
};

onMounted(() => {
  conversationsStore.fetchAllConversations();
});
</script>

<template>
  <div class="bg-theme-conversations">
    <SidebarHeader>
      <!--title-->
      <template v-slot:title>Чаты</template>

      <!--side actions-->
      <template v-slot:actions>
        <IconButton
          class="ic-btn-ghost-primary w-7 h-7"
          @click="composeOpen = true"
          aria-label="compose conversation"
          title="compose conversation"
        >
          <PencilSquareIcon class="w-[1.25rem] h-[1.25rem]" />
        </IconButton>
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
        role="list"
        aria-label="conversations"
        class="w-full h-full scroll-smooth scrollbar-hidden"
        style="overflow-x: visible; overflow-y: scroll"
        v-if="activeTab === TAB.all"
      >
        <Circle2Lines
          v-if="conversationsStore.isLoadingAll"
          v-for="item in 6"
          :key="'loading-all-' + item"
        />

        <div v-else-if="conversationsStore.error.all">
          <p class="text-red-500 p-4">
            Error: {{ conversationsStore.error.all }}
          </p>
        </div>

        <div v-else>
          <!-- <ArchivedButton // Removed archive-related component
            v-if="store.archivedConversations.length > 0"
            :open="openArchive"
            @click="openArchive = !openArchive"
          /> -->

          <div
            v-if="
              !conversationsStore.isLoadingAll &&
              !conversationsStore.error.all &&
              filteredConversations.length > 0
            "
          >
            <FadeTransition>
              <ConversationsList
                :filtered-conversations="filteredConversations"
                key="active"
              />
            </FadeTransition>
          </div>

          <div
            v-else-if="
              !conversationsStore.isLoadingAll && !conversationsStore.error.all
            "
          >
            <NoConversation />
          </div>
        </div>
      </div>

      <div
        role="list"
        aria-label="conversations"
        class="w-full h-full scroll-smooth scrollbar-hidden"
        style="overflow-x: visible; overflow-y: scroll"
        v-if="activeTab === TAB.open"
      >
        <!-- Placeholder for "open" conversations tab. 
             This will need logic to filter conversations based on their status, 
             which is not yet available in the provided IConversation or ApiLead/ApiClient types.
             For now, it will show the same as "all" or be empty.
        -->
        <Circle2Lines
          v-if="
            conversationsStore.isLoadingLeads ||
            conversationsStore.isLoadingClients
          "
          v-for="item in 6"
          :key="'loading-open-' + item"
        />
        <!-- 
          TODO: Implement logic for 'open' conversations. 
          This might involve fetching a different list or filtering 'allConversations'.
          For now, let's assume it might use leadConversations or clientConversations,
          or a filtered version of allConversations.
          Displaying a message until proper logic is implemented.
        -->
        <div
          v-else-if="
            conversationsStore.error.leads || conversationsStore.error.clients
          "
        >
          <p class="text-red-500 p-4">Error loading open conversations.</p>
        </div>
        <div v-else-if="filteredConversations.length > 0">
          <FadeTransition>
            <ConversationsList
              :filtered-conversations="filteredConversations"
              key="open-active"
            />
          </FadeTransition>
        </div>
        <div v-else>
          <NoConversation />
        </div>
      </div>
    </SlideTransition>

    <!--compose modal-->
    <ComposeModal :open="composeOpen" :close-modal="closeComposeModal" />
  </div>
</template>
