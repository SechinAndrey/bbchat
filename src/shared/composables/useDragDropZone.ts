import { ref } from "vue";

type DragDropHandler = (files: FileList, event: DragEvent) => void;

interface UseDragDropZoneOptions {
  disabled?: () => boolean;
  requireFiles?: boolean;
  onFilesDrop?: DragDropHandler;
}

const hasFilesInTransfer = (event: DragEvent) =>
  event.dataTransfer?.types.includes("Files") ?? false;

export function useDragDropZone(options: UseDragDropZoneOptions = {}) {
  const isDragging = ref(false);
  const dragCounter = ref(0);

  const isDisabled = () => options.disabled?.() ?? false;
  const requireFiles = options.requireFiles ?? true;

  const shouldHandleEvent = (event: DragEvent) => {
    if (isDisabled()) return false;
    if (!requireFiles) return true;
    return hasFilesInTransfer(event);
  };

  const resetDragging = () => {
    dragCounter.value = 0;
    isDragging.value = false;
  };

  const handleDragEnter = (event: DragEvent) => {
    if (!shouldHandleEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounter.value += 1;
    isDragging.value = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    if (!shouldHandleEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounter.value = Math.max(0, dragCounter.value - 1);

    if (dragCounter.value === 0) {
      isDragging.value = false;
    }
  };

  const handleDragOver = (event: DragEvent) => {
    if (!shouldHandleEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (event: DragEvent) => {
    if (!shouldHandleEvent(event)) {
      resetDragging();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    resetDragging();

    if (!files || files.length === 0) return;
    options.onFilesDrop?.(files, event);
  };

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetDragging,
  };
}
