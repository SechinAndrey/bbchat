<script setup lang="ts">
import type { ICall } from "@src/core/types/types.ts";

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

const animation = ref("slide-left");

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
  animationName: string;
}) => {
  animation.value = event.animationName;
  activePageName.value = event.tabName;
};
</script>

<template>
  <Modal :open="props.open" :closeModal="props.closeModal">
    <template v-slot:content>
      <div
        class="w-[18.75rem] py-6 overflow-x-hidden rounded bg-white dark:bg-gray-800"
      >
        <!--modal content-->
        <SlideTransition :animation="animation">
          <component
            @active-page-change="handleChangeActiveTab"
            :is="ActivePage"
            :call="props.call"
            :close-modal="closeModal"
          />
        </SlideTransition>

        <!--Call again button-->
        <div class="px-5">
          <Button class="contained-success contained-text w-full">
            Call again
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
