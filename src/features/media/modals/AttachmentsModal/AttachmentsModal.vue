<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

import Attachment from "@src/features/media/modals/AttachmentsModal/Attachment.vue";
import Button from "@src/ui/inputs/Button.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";
import { useMessageSending } from "@src/features/chat/composables/useMessageSending";
import { useToast } from "@src/shared/composables/useToast";
import { useMediaQuery } from "@vueuse/core";
import { validateFile } from "@src/shared/utils";
import {
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
  ACCEPTED_FILE_TYPES,
} from "@src/shared/constants/attachments";
import {
  createAttachmentFromFile,
  revokeAttachmentURLs,
} from "@src/shared/utils/attachment-helpers";
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  XCircleIcon as ErrorIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  messengerId: number;
  open: boolean;
  closeModal: () => void;
}>();

const {
  queue,
  isProcessing,
  hasFiles,
  hasPendingFiles,
  allFilesSent,
  addToQueue,
  removeFromQueue,
  processQueue,
  clearQueue,
  retryFile,
} = useMessageSending();
const { toastError, toastSuccess } = useToast();

const isMobile = computed(() => useMediaQuery("(max-width: 767px)").value);

const caption = ref("");
const fileInputRef = ref<HTMLInputElement>();
const isDragging = ref(false);
const isSending = ref(false);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      if (queue.value.length >= MAX_ATTACHMENTS) {
        toastError(`Максимум ${MAX_ATTACHMENTS} файлів за раз`);
        return;
      }

      const validation = validateFile(file, MAX_FILE_SIZE);

      if (!validation.valid) {
        toastError(validation.error || "Помилка валідації файлу");
        return;
      }

      const attachment = createAttachmentFromFile(file);
      addToQueue(attachment, caption.value);
    });
  }

  if (target) {
    target.value = "";
  }
};

const removeAttachment = (id: number) => {
  const file = queue.value.find((f) => f.id === id);
  if (file) {
    revokeAttachmentURLs(file);
    removeFromQueue(id);
  }
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const clean = () => {
  queue.value.forEach(revokeAttachmentURLs);
  clearQueue();
  caption.value = "";
  isSending.value = false;
  props.closeModal();
};

async function sendMessage() {
  if (!queue.value.length || isSending.value) {
    console.warn(
      "⚠️ Attempted to send message without attachments or already sending",
    );
    return;
  }

  isSending.value = true;

  try {
    queue.value.forEach((file) => {
      file.caption = caption.value;
    });

    await processQueue(props.messengerId);

    if (allFilesSent.value) {
      toastSuccess(
        queue.value.length === 1
          ? "Файл успішно відправлено"
          : `${queue.value.length} файлів успішно відправлено`,
      );
      setTimeout(() => {
        clean();
      }, 1000);
    }
  } catch (error) {
    console.error("Error sending messages with attachments:", error);
  } finally {
    isSending.value = false;
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
        toastError(validation.error || "Помилка валідації файлу");
        return;
      }

      const index = queue.value.findIndex((att) => att.id === id);

      if (index !== -1) {
        const oldAttachment = queue.value[index];
        revokeAttachmentURLs(oldAttachment);

        const newAttachment = createAttachmentFromFile(file);
        queue.value[index] = { ...newAttachment, status: "pending" };
      }
    }
  };

  input.click();
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.stopPropagation();
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  if (event.dataTransfer && event.dataTransfer.files) {
    Array.from(event.dataTransfer.files).forEach((file) => {
      if (queue.value.length >= MAX_ATTACHMENTS) {
        toastError(`Максимум ${MAX_ATTACHMENTS} файлів за раз`);
        return;
      }

      const validation = validateFile(file, MAX_FILE_SIZE);

      if (!validation.valid) {
        toastError(validation.error || "Помилка валідації файлу");
        return;
      }

      const attachment = createAttachmentFromFile(file);
      addToQueue(attachment, caption.value);
    });
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    hasFiles.value &&
    !isSending.value &&
    props.open
  ) {
    event.preventDefault();
    sendMessage();
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return ClockIcon;
    case "uploading":
      return ArrowPathIcon;
    case "sent":
      return CheckCircleIcon;
    case "error":
      return ErrorIcon;
    default:
      return ClockIcon;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-app-text-secondary";
    case "uploading":
      return "text-primary";
    case "sent":
      return "text-success";
    case "error":
      return "text-danger";
    default:
      return "text-app-text-secondary";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Очікує";
    case "uploading":
      return "Відправляється...";
    case "sent":
      return "Відправлено";
    case "error":
      return "Помилка";
    default:
      return "";
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && fileInputRef.value) {
      fileInputRef.value.setAttribute("multiple", "true");
    }
  },
);

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
          multiple
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- attachments list -->
        <div
          v-if="hasFiles"
          :class="[
            'max-h-[55vh] overflow-y-auto overflow-x-hidden scrollbar-thin--bg-app-bg',
            isMobile ? 'px-4' : 'px-5',
          ]"
        >
          <Attachment
            v-for="file in queue"
            :key="file.id"
            :class="isMobile ? 'mt-4' : 'mt-5'"
            :attachment="file"
            @remove="removeAttachment"
            @replace="replaceAttachment"
          >
            <template #status>
              <div class="flex items-center gap-1">
                <component
                  :is="getStatusIcon(file.status)"
                  :class="[
                    'w-3.5 h-3.5',
                    getStatusColor(file.status),
                    file.status === 'uploading' ? 'animate-spin' : '',
                  ]"
                />
                <span :class="['text-xs', getStatusColor(file.status)]">
                  {{ getStatusText(file.status) }}
                </span>
                <button
                  v-if="file.status === 'error'"
                  class="text-xs text-primary hover:underline"
                  @click="retryFile(file.id, props.messengerId)"
                >
                  Повторити
                </button>
              </div>
            </template>
          </Attachment>
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
            <span class="font-semibold text-primary"> оберіть файли </span>
            с комп'ютера
          </p>
          <p v-else class="text-app-text-secondary text-center">
            <span class="font-semibold text-primary">Оберіть файли</span>
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
            <Button v-if="!hasFiles" variant="outline" @click="openFileDialog">
              Обрати файли
            </Button>
            <Button
              v-else
              variant="outline"
              :disabled="isSending || isProcessing"
              @click="openFileDialog"
            >
              Додати ще
            </Button>
          </div>

          <Button
            variant="text"
            :class="isMobile ? 'mr-2' : 'mr-4'"
            :disabled="isSending || isProcessing"
            @click="clean"
          >
            Скасувати
          </Button>

          <Button
            :disabled="!hasPendingFiles || isSending || isProcessing"
            :loading="isSending || isProcessing"
            @click="sendMessage"
          >
            {{ isSending || isProcessing ? "Відправляється..." : "Відправити" }}
          </Button>
        </div>
        <div
          :class="[
            'text-app-text-secondary text-xs text-left',
            isMobile ? 'px-4 mt-4' : 'px-5 mt-6',
          ]"
        >
          <p>
            *Файли відправляються по одному (до {{ MAX_ATTACHMENTS }} файлів)
          </p>
          <p v-if="hasFiles" class="mt-1">
            Вибрано: {{ queue.length }}
            {{ queue.length === 1 ? "файл" : "файлів" }}
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>
