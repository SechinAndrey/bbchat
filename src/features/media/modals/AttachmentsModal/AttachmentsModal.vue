<script setup lang="ts">
import { ref, computed } from "vue";
import type { IAttachment } from "@src/shared/types/types";

import Attachment from "@src/features/media/modals/AttachmentsModal/Attachment.vue";
import Button from "@src/ui/inputs/Button.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";
import ScrollBox from "@src/ui/utils/ScrollBox.vue";
import { useMessageSending } from "@src/features/chat/composables/useMessageSending";

const props = defineProps<{
  messengerId: number;
  open: boolean;
  closeModal: () => void;
}>();

const { sendMessageWithFile } = useMessageSending();

const emit = defineEmits<{
  send: [attachments: IAttachment[], caption: string];
}>();

const attachments = ref<IAttachment[]>([]);
const caption = ref("");
const fileInputRef = ref<HTMLInputElement>();

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (file: File): string => {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";

  return "file";
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
    Array.from(files).forEach((file, index) => {
      const attachment: IAttachment = {
        id: Date.now() + index,
        type: getFileType(file),
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        file: file,
      };

      attachments.value.push(attachment);
    });
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
    // Clean up object URLs
    if (attachment.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }
    if (attachment.thumbnail && attachment.thumbnail.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.thumbnail);
    }
    attachments.value.splice(index, 1);
  }
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const clean = () => {
  attachments.value.forEach((attachment) => {
    if (attachment.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }
    if (attachment.thumbnail && attachment.thumbnail.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.thumbnail);
    }
  });

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

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer && event.dataTransfer.files) {
    Array.from(event.dataTransfer.files).forEach((file, index) => {
      const attachment: IAttachment = {
        id: Date.now() + index,
        type: getFileType(file),
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        file: file,
      };

      attachments.value.push(attachment);
    });
  }
};
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div class="w-[25rem] bg-app-bg rounded py-6">
        <!-- modal title -->
        <h3 class="text-lg font-semibold px-5 mb-5">Додати вкладення</h3>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          class="hidden"
          @change="handleFileSelect"
        />

        <!--attachments list-->
        <ScrollBox
          v-if="hasAttachments"
          class="max-h-[8.75rem] overflow-y-scroll"
        >
          <Attachment
            v-for="(attachment, index) in attachments"
            :key="index"
            :attachment="attachment"
            @remove="removeAttachment"
          />
        </ScrollBox>

        <!-- Drag and drop area -->
        <div
          v-else
          class="px-5 py-8 border-2 mx-5 border-dashed border-app-border rounded-md cursor-pointer"
          @click="openFileDialog"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <p class="text-center text-app-text-secondary">
            Перетягніть файли сюди або
            <span class="font-semibold text-primary"> оберіть файл </span>
            с комп'ютера
          </p>
        </div>

        <!--Caption input-->
        <!-- <div class="px-5 py-6"> -->
        <TextInput
          v-model="caption"
          placeholder="Підпис"
          type="text"
          variant="bordered"
          class="mx-5 my-6"
        />
        <!-- </div> -->

        <!--Action buttons-->
        <div class="flex w-full px-5">
          <div class="grow flex justify-start">
            <Button variant="outline" @click="openFileDialog">
              Обрати файл
            </Button>
          </div>

          <Button variant="text" class="mr-4" @click="props.closeModal">
            Скасувати
          </Button>

          <Button :disabled="!hasAttachments" @click="sendMessage">
            Відправити
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
