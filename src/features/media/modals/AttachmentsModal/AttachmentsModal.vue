<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { IAttachment } from "@src/shared/types/types";

import Attachment from "@src/features/media/modals/AttachmentsModal/Attachment.vue";
import Button from "@src/ui/inputs/Button.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";
import { useMessageSending } from "@src/features/chat/composables/useMessageSending";
import { useToast } from "@src/shared/composables/useToast";
import { useMediaQuery } from "@vueuse/core";
import {
  formatFileSize,
  getFileType,
  validateFile,
  revokeBlobURL,
} from "@src/shared/utils";

const MAX_ATTACHMENTS = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES =
  "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.zip,.rar";

const props = defineProps<{
  messengerId: number;
  open: boolean;
  closeModal: () => void;
}>();

const { sendMessageWithFile } = useMessageSending();
const { toastError: showError } = useToast();

const isMobile = computed(() => useMediaQuery("(max-width: 767px)").value);

const attachments = ref<IAttachment[]>([]);
const caption = ref("");
const fileInputRef = ref<HTMLInputElement>();
const isDragging = ref(false);

const createAttachmentFromFile = (file: File): IAttachment => {
  return {
    id: Date.now() + Math.random(),
    type: getFileType(file),
    name: file.name,
    size: formatFileSize(file.size),
    url: URL.createObjectURL(file),
    thumbnail: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
    file: file,
  };
};

const revokeAttachmentURLs = (attachment: IAttachment): void => {
  revokeBlobURL(attachment.url);
  revokeBlobURL(attachment.thumbnail);
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    if (attachments.value.length >= MAX_ATTACHMENTS) {
      if (target) {
        target.value = "";
      }
      return;
    }

    const file = files[0];
    const validation = validateFile(file, MAX_FILE_SIZE);

    if (!validation.valid) {
      showError(validation.error || "Помилка валідації файлу");
      if (target) {
        target.value = "";
      }
      return;
    }

    const attachment = createAttachmentFromFile(file);
    attachments.value.push(attachment);
  }

  // Reset input
  if (target) {
    target.value = "";
  }
};

const removeAttachment = (id: number) => {
  const index = attachments.value.findIndex((att) => att.id === id);
  if (index !== -1) {
    const attachment = attachments.value[index];
    revokeAttachmentURLs(attachment);
    attachments.value.splice(index, 1);
  }
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const clean = () => {
  attachments.value.forEach(revokeAttachmentURLs);
  attachments.value = [];
  caption.value = "";
  props.closeModal();
};

const hasAttachments = computed(() => attachments.value.length > 0);

async function sendMessage() {
  if (!attachments.value.length) {
    console.warn("⚠️ Attempted to send message without attachments");
    return;
  }

  const attachment = attachments.value[0];
  const captionText = caption.value;
  clean();
  try {
    await sendMessageWithFile(attachment, captionText, props.messengerId);
  } catch (error) {
    console.error("Error sending message with attachment:", error);
  }
}

const replaceAttachment = (id: number) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ACCEPTED_FILE_TYPES;

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const validation = validateFile(file, MAX_FILE_SIZE);

      if (!validation.valid) {
        showError(validation.error || "Помилка валідації файлу");
        return;
      }

      const index = attachments.value.findIndex((att) => att.id === id);

      if (index !== -1) {
        const oldAttachment = attachments.value[index];
        revokeAttachmentURLs(oldAttachment);

        const newAttachment = createAttachmentFromFile(file);
        attachments.value[index] = newAttachment;
      }
    }
  };

  input.click();
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;

  if (event.dataTransfer && event.dataTransfer.files) {
    if (attachments.value.length >= MAX_ATTACHMENTS) {
      return;
    }

    const file = event.dataTransfer.files[0];
    const validation = validateFile(file, MAX_FILE_SIZE);

    if (!validation.valid) {
      showError(validation.error || "Помилка валідації файлу");
      return;
    }

    const attachment = createAttachmentFromFile(file);
    attachments.value.push(attachment);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    hasAttachments.value &&
    props.open
  ) {
    event.preventDefault();
    sendMessage();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div
        :class="[
          'bg-app-bg rounded',
          isMobile ? 'w-full py-4' : 'w-[25rem] py-6',
        ]"
      >
        <!-- modal title -->
        <h3
          :class="[
            'text-lg font-semibold mb-4',
            isMobile ? 'px-4' : 'px-5 mb-5',
          ]"
        >
          Додати вкладення
        </h3>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          :accept="ACCEPTED_FILE_TYPES"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- attachments list -->
        <div
          v-if="hasAttachments"
          :class="[
            'max-h-[8.75rem] overflow-y-auto overflow-x-hidden',
            isMobile ? 'px-4' : 'px-5',
          ]"
        >
          <Attachment
            v-for="(attachment, index) in attachments"
            :key="index"
            :class="isMobile ? 'mt-4' : 'mt-5'"
            :attachment="attachment"
            @remove="removeAttachment"
            @replace="replaceAttachment"
          />
        </div>

        <!-- Drag and drop area -->
        <div
          v-else
          :class="[
            'border-2 border-dashed rounded-md cursor-pointer transition-all duration-200',
            isMobile ? 'px-4 py-6 mx-4' : 'px-5 py-8 mx-5',
            isDragging ? 'border-primary bg-primary/10' : 'border-app-border',
          ]"
          @click="openFileDialog"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <p v-if="!isMobile" class="text-app-text-secondary text-center">
            Перетягніть файли сюди або
            <span class="font-semibold text-primary"> оберіть файл </span>
            с комп'ютера
          </p>
          <p v-else class="text-app-text-secondary text-center">
            <span class="font-semibold text-primary">Оберіть файл</span>
            з пристрою
          </p>
        </div>

        <!--Caption input-->
        <TextInput
          v-model="caption"
          placeholder="Підпис"
          type="text"
          variant="bordered"
          :class="isMobile ? 'mx-4 my-4' : 'mx-5 my-6'"
        />

        <!--Action buttons-->
        <div :class="['flex w-full', isMobile ? 'px-4' : 'px-5']">
          <div class="grow flex justify-start">
            <Button
              v-if="!hasAttachments"
              variant="outline"
              @click="openFileDialog"
            >
              Обрати файл
            </Button>
          </div>

          <Button
            variant="text"
            :class="isMobile ? 'mr-2' : 'mr-4'"
            @click="props.closeModal"
          >
            Скасувати
          </Button>

          <Button :disabled="!hasAttachments" @click="sendMessage">
            Відправити
          </Button>
        </div>
        <div
          :class="[
            'text-app-text-secondary text-xs text-left',
            isMobile ? 'px-4 mt-4' : 'px-5 mt-6',
          ]"
        >
          *1 файл на одне повідомлення
        </div>
      </div>
    </template>
  </Modal>
</template>
