<script setup lang="ts">
import type { MessageTemplate } from "./types";
import Modal from "@src/ui/modals/Modal.vue";
import TemplatePickerList from "./TemplatePickerList.vue";

interface Props {
  templates: MessageTemplate[];
  open: boolean;
}

interface Emits {
  select: [template: MessageTemplate];
  close: [];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSelect = (template: MessageTemplate) => {
  emit("select", template);
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <Modal :open="open" :close-modal="handleClose">
    <template #content>
      <div
        class="w-full sm:w-[80vw] bg-app-bg flex flex-col h-[80vh] md:rounded-lg overflow-hidden"
      >
        <TemplatePickerList
          v-if="open"
          :key="String(open)"
          :templates="templates"
          @select="handleSelect"
          @cancel="handleClose"
        />
      </div>
    </template>
  </Modal>
</template>
