import { ref, computed, type ComputedRef, type Ref } from "vue";
import type { SelectedPhoto } from "../types";
import type { InjectionKey } from "vue";

export interface PhotoSelectionContext {
  isSelectionMode: Ref<boolean>;
  selectedPhotos: Ref<Map<string, SelectedPhoto>>;
  selectedPhotosArray: ComputedRef<SelectedPhoto[]>;
  selectedCount: ComputedRef<number>;
  togglePhoto: (url: string, thumbnail: string, messageId: number) => void;
  isPhotoSelected: (url: string) => boolean;
  enterSelectionMode: (
    url: string,
    thumbnail: string,
    messageId: number,
  ) => void;
  exitSelectionMode: () => void;
}

export const photoSelectionKey: InjectionKey<PhotoSelectionContext> =
  Symbol("photoSelection");

export function usePhotoSelection(): PhotoSelectionContext {
  const isSelectionMode = ref(false);

  const selectedPhotos = ref<Map<string, SelectedPhoto>>(new Map());

  const selectedPhotosArray = computed<SelectedPhoto[]>(() =>
    Array.from(selectedPhotos.value.values()),
  );

  const selectedCount = computed(() => selectedPhotos.value.size);

  const togglePhoto = (url: string, thumbnail: string, messageId: number) => {
    const map = new Map(selectedPhotos.value);
    if (map.has(url)) {
      map.delete(url);
    } else {
      map.set(url, { url, thumbnail, messageId });
    }
    selectedPhotos.value = map;
  };

  const isPhotoSelected = (url: string): boolean => {
    return selectedPhotos.value.has(url);
  };

  const enterSelectionMode = (
    url: string,
    thumbnail: string,
    messageId: number,
  ) => {
    isSelectionMode.value = true;
    const map = new Map<string, SelectedPhoto>();
    map.set(url, { url, thumbnail, messageId });
    selectedPhotos.value = map;
  };

  const exitSelectionMode = () => {
    isSelectionMode.value = false;
    selectedPhotos.value = new Map();
  };

  return {
    isSelectionMode,
    selectedPhotos,
    selectedPhotosArray,
    selectedCount,
    togglePhoto,
    isPhotoSelected,
    enterSelectionMode,
    exitSelectionMode,
  };
}
