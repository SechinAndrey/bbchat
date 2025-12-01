<script setup lang="ts">
import { ref, watch } from "vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Button from "@src/ui/inputs/Button.vue";
import type { MessageTemplate } from "./types";

interface Props {
  editingTemplate?: MessageTemplate | null;
  loading?: boolean;
}

interface Emits {
  save: [text: string];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isFormVisible = ref(false);
const messageText = ref("");

watch(
  () => props.editingTemplate,
  (template) => {
    if (template) {
      messageText.value = template.text;
      isFormVisible.value = true;
    }
  },
);

watch(
  () => props.loading,
  (isLoading, wasLoading) => {
    if (wasLoading && !isLoading && isFormVisible.value) {
      messageText.value = "";
      isFormVisible.value = false;
    }
  },
);

const showForm = () => {
  isFormVisible.value = true;
  messageText.value = "";
};

const handleSave = () => {
  if (messageText.value.trim() && !props.loading) {
    emit("save", messageText.value);
  }
};

const handleCancel = () => {
  messageText.value = "";
  isFormVisible.value = false;
  emit("cancel");
};

const isEditing = () => {
  return props.editingTemplate !== null && props.editingTemplate !== undefined;
};
</script>

<template>
  <div class="w-full">
    <!-- Initial state: btn -->
    <Button v-if="!isFormVisible" variant="text" size="sm" @click="showForm">
      + Додати збережене повідомлення
    </Button>

    <!-- Form state: textarea and buttons -->
    <div v-else class="flex flex-col gap-2">
      <Textarea
        v-model="messageText"
        placeholder="+ Додати збережене повідомлення"
        :rows="5"
        variant="bordered"
        block
      />

      <div class="flex items-center justify-end gap-4 mt-4">
        <Button
          variant="text"
          size="sm"
          :disabled="loading"
          @click="handleCancel"
        >
          Відмінити
        </Button>
        <Button
          size="sm"
          :loading="loading"
          :disabled="loading"
          @click="handleSave"
        >
          {{ isEditing() ? "Оновити" : "Зберегти" }}
        </Button>
      </div>
    </div>
  </div>
</template>
