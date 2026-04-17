import { ref } from "vue";
import type { Ref } from "vue";

import type { PhotoSlotType, SelectedPhoto } from "../types";

type SlotAssignment = {
  type: PhotoSlotType;
  photo_url: string;
};

export function usePhotoViewerEditorSession({
  isReadonly,
  localPhotos,
  assignments,
  assignmentKey,
}: {
  isReadonly: () => boolean | undefined;
  localPhotos: Ref<SelectedPhoto[]>;
  assignments: Ref<Map<string, SlotAssignment>>;
  assignmentKey: (boardId: number, slotType: PhotoSlotType) => string;
}) {
  const photoEditorOpen = ref(false);
  const photoEditorUrl = ref("");
  const photoEditorBoardId = ref(0);
  const photoEditorSlotType = ref<PhotoSlotType>("near");
  const photoEditorEditable = ref(false);

  const openPhotoEditor = (
    boardId: number,
    slotType: PhotoSlotType,
    photoUrl: string,
  ) => {
    photoEditorBoardId.value = boardId;
    photoEditorSlotType.value = slotType;
    photoEditorUrl.value = photoUrl;
    photoEditorEditable.value = !isReadonly();
    photoEditorOpen.value = true;
  };

  const closePhotoEditor = () => {
    photoEditorOpen.value = false;
  };

  const applyEditedPhoto = (blob: Blob) => {
    const file = new File([blob], `edited_${Date.now()}.jpeg`, {
      type: "image/jpeg",
    });
    const url = URL.createObjectURL(file);

    localPhotos.value = [
      ...localPhotos.value,
      {
        url,
        thumbnail: url,
        messageId: -(Date.now() + Math.floor(Math.random() * 1e6)),
        file,
      },
    ];

    const map = new Map(assignments.value);
    const key = assignmentKey(
      photoEditorBoardId.value,
      photoEditorSlotType.value,
    );
    const existing = map.get(key);
    map.set(key, {
      type: existing?.type ?? photoEditorSlotType.value,
      photo_url: url,
    });
    assignments.value = map;

    closePhotoEditor();
  };

  return {
    photoEditorOpen,
    photoEditorUrl,
    photoEditorEditable,
    openPhotoEditor,
    closePhotoEditor,
    applyEditedPhoto,
  };
}
