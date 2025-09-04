<script setup lang="ts">
import type { ICall } from "@src/shared/types/types";
import type { SlideAnimationType } from "@src/ui/transitions/types";

import { computed, ref } from "vue";

import CallInfoTab from "@src/features/calls/modals/CallInfoModal/CallInfoTab.vue";
import CallMembersTab from "@src/features/calls/modals/CallInfoModal/CallMembersTab.vue";
import Button from "@src/ui/inputs/Button.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import Modal from "@src/ui/modals/Modal.vue";

defineEmits(["activePageChange"]);

const props = defineProps<{
  call: ICall;
  open: boolean;
  closeModal: () => void;
}>();

const activePageName = ref("call-info");

const animation = ref<SlideAnimationType>("slide-left");

const ActivePage = computed((): any => {
  if (activePageName.value === "call-info") {
    return CallInfoTab;
  } else if (activePageName.value === "call-members") {
    return CallMembersTab;
  }
});

// (event) move between modal pages
const handleChangeActiveTab = (event: {
  tabName: string;
  animationName: SlideAnimationType;
}) => {
  animation.value = event.animationName;
  activePageName.value = event.tabName;
};
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div
        class="w-[18.75rem] py-6 overflow-x-hidden rounded bg-surface dark:bg-surface"
      >
        <!--modal content-->
        <SlideTransition :animation="animation">
          <component
            :is="ActivePage"
            :call="props.call"
            :close-modal="closeModal"
            @active-page-change="handleChangeActiveTab"
          />
        </SlideTransition>

        <!--Call again button-->
        <div class="px-5">
          <Button class="w-full"> Call again </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
