<script setup lang="ts">
import type { Ref } from "vue";
import type { IContact, IConversation } from "@src/shared/types/types";

import { computed, ref } from "vue";

import ConversationInfoTab from "@src/features/conversations/modals/ConversationInfoModal/ConversationInfoTab/ConversationInfoTab.vue";
import EditGroupInfoTab from "@src/features/conversations/modals/ConversationInfoModal/EditGroupInfoTab.vue";
import ConversationMembersTab from "@src/features/conversations/modals/ConversationInfoModal/ConversationMembersTab.vue";
import SharedMediaTab from "@src/features/conversations/modals/ConversationInfoModal/SharedMediaTab/SharedMediaTab.vue";
import Modal from "@src/ui/modals/Modal.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";

defineEmits(["activePageChange"]);

const props = defineProps<{
  open: boolean;
  conversation: IConversation;
  closeModal: () => void;
}>();

// selected group member
const selectedMember: Ref<IContact | undefined> = ref();

// used to determine whether to slide left or right
const animation = ref("slide-left");

// name of the active modal page
const activePageName = ref("conversation-info");

// the active modal page component
const ActiveTab = computed((): any => {
  if (activePageName.value === "conversation-info") return ConversationInfoTab;
  else if (activePageName.value === "members") return ConversationMembersTab;
  else if (activePageName.value === "group-member") return ConversationInfoTab;
  else if (activePageName.value === "shared-media") return SharedMediaTab;
  else if (activePageName.value === "edit-group") return EditGroupInfoTab;
});

// (event) move between modal pages
const handleChangeActiveTab = (event: {
  tabName: string;
  animationName: string;
  contact?: IContact;
  removeContact?: boolean;
}) => {
  animation.value = event.animationName;
  activePageName.value = event.tabName;

  if (event.contact) {
    selectedMember.value = event.contact;
  }

  if (event.removeContact) {
    selectedMember.value = undefined;
  }
};
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="overflow-x-hidden">
        <div
          class="w-[18.75rem] bg-theme-surface dark:bg-theme-surface rounded py-6"
        >
          <!--content-->
          <SlideTransition :animation="animation">
            <component
              @active-page-change="handleChangeActiveTab"
              :is="ActiveTab"
              :conversation="props.conversation"
              :close-modal="props.closeModal"
              :key="activePageName"
              :contact="selectedMember"
            />
          </SlideTransition>
        </div>
      </div>
    </template>
  </Modal>
</template>
