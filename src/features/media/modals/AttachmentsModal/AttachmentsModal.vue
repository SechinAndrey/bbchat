<script setup lang="ts">
import { ref, computed, inject } from "vue";
import type { IAttachment } from "@src/shared/types/types";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";

import Attachment from "@src/features/media/modals/AttachmentsModal/Attachment.vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";
import ScrollBox from "@src/ui/utils/ScrollBox.vue";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore from "@src/features/conversations/conversations-store";
import type { EntityType } from "@src/shared/types/common";

const props = defineProps<{
  messengerId: number;
  open: boolean;
  closeModal: () => void;
}>();

const entity = inject("entity") as EntityType;
const id = inject("id") as number;
const contragent_type = computed(() => {
  return entity === "leads" ? "lead" : "client";
});

const conversationsStore = useConversationsStore();

const activeConversationInfo = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversationInfo;
});

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
    return;
  }

  const response = await conversationsService.uploadFile(attachments.value[0]);

  await conversationsService.sendMessage({
    phone: activeConversationInfo?.value?.phone || "",
    message: caption.value,
    file_url: response,
    messenger_id: props.messengerId,
    contragent_type: contragent_type.value,
    contragent_id: id,
  });

  clean();
}
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div class="w-[25rem] bg-white dark:bg-gray-800 rounded py-6">
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

        <!-- Empty state -->
        <div
          v-if="!hasAttachments"
          class="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
        >
          <p class="">Файл не вибраний</p>
          <p class="mt-1">Натисніть "Додати" щоб вибрати файл</p>
        </div>

        <!--Caption input-->
        <div class="px-5 py-6">
          <LabeledTextInput
            v-model="caption"
            placeholder="Підпис"
            type="text"
          />
        </div>

        <!--Action buttons-->
        <div class="flex w-full px-5">
          <div class="grow flex justify-start">
            <Button class="" @click="openFileDialog"> Додати </Button>
          </div>

          <Button class="mr-4" @click="props.closeModal"> Скасувати </Button>

          <Button class="" :disabled="!hasAttachments" @click="sendMessage">
            Відправити
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
