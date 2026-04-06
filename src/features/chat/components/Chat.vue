<script setup lang="ts">
import { ref, watch } from "vue";
import useStore from "@src/shared/store/store";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { provide, toRef } from "vue";

import type { EntityType } from "@src/shared/types/common";

import ChatBottom from "@src/features/chat/components/ChatBottom/ChatBottom.vue";
import ChatMiddle from "@src/features/chat/components/ChatMiddle/ChatMiddle.vue";
import ChatTop from "@src/features/chat/components/ChatTop/ChatTop.vue";
import RightSidebar from "@src/features/right-sidebar/components/RightSidebar.vue";
import DragDropSurface from "@src/ui/components/DragDropSurface.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import { useDragAndDropAttachments } from "@src/features/chat/composables/useDragAndDropAttachments";
import PhotoSelectionToolbar from "@src/features/photo-reports/components/PhotoSelectionToolbar.vue";
import AssignPhotoReportModal from "@src/features/photo-reports/modals/AssignPhotoReportModal.vue";
import {
  usePhotoSelection,
  photoSelectionKey,
} from "@src/features/photo-reports/composables/usePhotoSelection";

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

const {
  isDragging,
  attachedFiles,
  removeFile,
  clearFiles,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
} = useDragAndDropAttachments();

provide("attachedFiles", attachedFiles);
provide("removeAttachedFile", removeFile);
provide("clearAttachedFiles", clearFiles);

const photoSelection = usePhotoSelection();
provide(photoSelectionKey, photoSelection);

watch(
  () => [props.id, props.entity, props.contactId],
  () => {
    if (photoSelection.isSelectionMode.value) {
      photoSelection.exitSelectionMode();
    }
    if (isAssignModalOpen.value) {
      closeAssignModal();
    }
  },
);

const isAssignModalOpen = ref(false);

const openAssignModal = () => {
  isAssignModalOpen.value = true;
};

const closeAssignModal = () => {
  isAssignModalOpen.value = false;
  photoSelection.exitSelectionMode();
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
        <DragDropSurface
          v-if="isDragging"
          variant="overlay"
          title="Перетягніть файли сюди"
          subtitle="Відпустіть, щоб прикріпити до повідомлення"
        />

        <ChatTop />
        <ChatMiddle />
        <PhotoSelectionToolbar
          v-if="photoSelection.isSelectionMode.value"
          @open-assign-modal="openAssignModal"
        />
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

    <AssignPhotoReportModal
      :open="isAssignModalOpen"
      :photos="photoSelection.selectedPhotosArray.value"
      @close="closeAssignModal"
      @saved="photoSelection.exitSelectionMode()"
    />
  </div>
</template>
