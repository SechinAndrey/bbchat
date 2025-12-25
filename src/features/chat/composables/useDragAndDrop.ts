import { ref, onUnmounted } from "vue";
import type { QueuedFile } from "@src/features/chat/composables/useMessageSending";
import { validateFile } from "@src/shared/utils";
import { useToast } from "@src/shared/composables/useToast";
import {
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
} from "@src/shared/constants/attachments";
import {
  createAttachmentFromFile,
  revokeAttachmentURLs,
} from "@src/shared/utils/attachment-helpers";

export function useDragAndDrop() {
  const { toastError } = useToast();

  const isDragging = ref(false);
  const attachedFiles = ref<QueuedFile[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (attachedFiles.value.length >= MAX_ATTACHMENTS) {
        toastError(`Максимум ${MAX_ATTACHMENTS} файлів за раз`);
        return;
      }

      const validation = validateFile(file, MAX_FILE_SIZE);

      if (!validation.valid) {
        toastError(validation.error || "Помилка валідації файлу");
        return;
      }

      const attachment = createAttachmentFromFile(file);
      const queuedFile: QueuedFile = {
        ...attachment,
        status: "pending",
      };
      attachedFiles.value.push(queuedFile);
    });
  };

  const removeFile = (id: number) => {
    const index = attachedFiles.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      const file = attachedFiles.value[index];
      revokeAttachmentURLs(file);
      attachedFiles.value.splice(index, 1);
    }
  };

  const clearFiles = () => {
    attachedFiles.value.forEach(revokeAttachmentURLs);
    attachedFiles.value = [];
  };

  onUnmounted(() => {
    clearFiles();
  });

  return {
    isDragging,
    attachedFiles,
    handleFiles,
    removeFile,
    clearFiles,
  };
}
