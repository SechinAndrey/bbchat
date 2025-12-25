<script setup lang="ts">
import useStore from "@src/shared/store/store";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { provide, toRef } from "vue";

import type { EntityType } from "@src/shared/types/common";

import ChatBottom from "@src/features/chat/components/ChatBottom/ChatBottom.vue";
import ChatMiddle from "@src/features/chat/components/ChatMiddle/ChatMiddle.vue";
import ChatTop from "@src/features/chat/components/ChatTop/ChatTop.vue";
import RightSidebar from "@src/features/right-sidebar/components/RightSidebar.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import { useDragAndDrop } from "@src/features/chat/composables/useDragAndDrop";

const props = defineProps<{
  id: number;
  entity: EntityType;
  contactId: number;
}>();

provide("entity", toRef(props, "entity"));
provide("id", toRef(props, "id"));
provide("contactId", toRef(props, "contactId"));

const store = useStore();
const conversationsStore = useConversationsStore();
conversationsStore.initializeRouteWatchers();

const { isDragging, attachedFiles, removeFile, clearFiles, handleFiles } =
  useDragAndDrop();

provide("attachedFiles", attachedFiles);
provide("removeAttachedFile", removeFile);
provide("clearAttachedFiles", clearFiles);

let dragCounter = 0;

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter++;
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter = 0;
  isDragging.value = false;

  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files);
  }
};
</script>

<template>
  <div class="h-full w-full flex scrollbar-hidden">
    <div class="h-full flex flex-col w-full scrollbar-hidden">
      <Spinner
        v-if="
          conversationsStore.isLoadingConversation &&
          !conversationsStore.activeConversation &&
          contactId
        "
      />

      <div
        v-else-if="conversationsStore.activeConversation && contactId"
        class="h-full flex flex-col scrollbar-hidden relative"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleDrop"
      >
        <div
          v-if="isDragging"
          class="absolute inset-0 z-50 bg-primary/10 border-4 border-dashed border-primary flex items-center justify-center backdrop-blur-sm pointer-events-none"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-primary mb-2">
              Перетягніть файли сюди
            </div>
            <div class="text-sm text-app-text-secondary">
              Відпустіть, щоб прикріпити до повідомлення
            </div>
          </div>
        </div>

        <ChatTop />
        <ChatMiddle />
        <ChatBottom />
      </div>

      <NoChatSelected
        v-else-if="!conversationsStore.isLoadingConversation && !contactId"
      />
    </div>

    <RightSidebar
      v-if="
        store.rightSidebarOpen &&
        conversationsStore.activeConversation &&
        contactId
      "
      class="xs:absolute md:static"
      @close="store.rightSidebarOpen = false"
    />
  </div>
</template>
