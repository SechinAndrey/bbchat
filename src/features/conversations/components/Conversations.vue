<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type { Ref } from "vue";

import { onMounted, ref, watch } from "vue";

import useStore from "@src/shared/store/store";
import { getActiveConversationId, getName } from "@src/shared/utils/utils";

import { PencilSquareIcon } from "@heroicons/vue/24/outline";
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

// active tab name
const TAB = {
  open: "open",
  all: "all",
} as const;
type TabName = (typeof TAB)[keyof typeof TAB];
const activeTab = ref<TabName>(TAB.open);
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
  const direction = directionMap[key] ?? "LEFT"; // fallback

  animation.value = direction === "LEFT" ? SLIDE.left : SLIDE.right;
});

const store = useStore();

const keyword: Ref<string> = ref("");

const composeOpen = ref(false);

// determines whether the archive is open or not
const openArchive = ref(false);

// the filtered list of conversations.
const filteredConversations: Ref<IConversation[]> = ref(store.conversations);

// filter the list of conversation based on search text.
watch([keyword, openArchive], () => {
  if (openArchive.value) {
    // search conversations
    filteredConversations.value =
      store.archivedConversations?.filter((conversation) =>
        getName(conversation)
          ?.toLowerCase()
          .includes(keyword.value.toLowerCase()),
      ) || [];
  } else {
    // search archived conversations
    filteredConversations.value =
      store.conversations?.filter((conversation) =>
        getName(conversation)
          ?.toLowerCase()
          .includes(keyword.value.toLowerCase()),
      ) || [];
  }
});

// (event) close the compose modal.
const closeComposeModal = () => {
  composeOpen.value = false;
};

// if the active conversation is in the archive
// then open the archive
onMounted(() => {
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
          v-if="store.status === 'loading' || store.delayLoading"
          v-for="item in 6"
        />

        <div v-else>
          <ArchivedButton
            v-if="store.archivedConversations.length > 0"
            :open="openArchive"
            @click="openArchive = !openArchive"
          />

          <div
            v-if="
              store.status === 'success' &&
              !store.delayLoading &&
              filteredConversations.length > 0
            "
          >
            <FadeTransition>
              <ConversationsList
                :filtered-conversations="filteredConversations"
                :key="openArchive ? 'archive' : 'active'"
              />
            </FadeTransition>
          </div>

          <div v-else>
            <NoConversation v-if="store.archivedConversations.length === 0" />
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
        <Circle2Lines
          v-if="store.status === 'loading' || store.delayLoading"
          v-for="item in 6"
        />

        <div v-else>
          <ArchivedButton
            v-if="store.archivedConversations.length > 0"
            :open="openArchive"
            @click="openArchive = !openArchive"
          />

          <div
            v-if="
              store.status === 'success' &&
              !store.delayLoading &&
              filteredConversations.length > 0
            "
          >
            <FadeTransition>
              <ConversationsList
                :filtered-conversations="filteredConversations"
                :key="openArchive ? 'archive' : 'active'"
              />
            </FadeTransition>
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
