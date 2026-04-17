<script setup lang="ts">
import DOMPurify from "dompurify";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";
import type { SelectedPhoto, PhotoSlotType } from "../types";
import { PHOTO_SLOT_LABELS } from "../types";

defineProps<{
  surfaceName: string;
  surfaceCode: string;
  supplierCode: string;
  slotType: PhotoSlotType;
  availablePhotos: SelectedPhoto[];
  currentPhotoUrl?: string | null;
  showNavigation?: boolean;
  gridClass?: string;
  photoRounding?: string;
  showSlotLabel?: boolean;
  supplierWarning?: string | null;
}>();

const emit = defineEmits<{
  select: [photo: SelectedPhoto];
  clear: [];
  skip: [];
  back: [];
  cancel: [];
  close: [];
  upload: [];
  removePhoto: [url: string];
}>();
</script>

<template>
  <div class="flex items-start justify-between mb-3">
    <div class="min-w-0 pr-2">
      <p class="text-sm font-semibold text-app-text truncate">
        {{ surfaceName }}
      </p>
      <p class="text-xs text-app-text-secondary mt-0.5">
        <template v-if="showSlotLabel"
          >{{ PHOTO_SLOT_LABELS[slotType] }} ·
        </template>
        {{ supplierCode }} · {{ surfaceCode }}
      </p>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <Button
        variant="ghost"
        size="xs"
        icon-only
        :ring="false"
        @click="emit('upload')"
      >
        <template #icon>
          <ArrowUpTrayIcon class="w-4 h-4" />
        </template>
      </Button>
      <Button
        variant="ghost"
        size="xs"
        icon-only
        :ring="false"
        @click="emit('close')"
      >
        <template #icon>
          <XMarkIcon class="w-5 h-5" />
        </template>
      </Button>
    </div>
  </div>

  <div
    v-if="supplierWarning"
    class="bg-secondary-lighter text-app-text mb-3 flex items-start gap-2 rounded-md px-3 py-2 text-xs"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-html="DOMPurify.sanitize(supplierWarning ?? '')"></span>
  </div>

  <div v-if="availablePhotos.length === 0" class="py-6 text-center">
    <p class="text-sm text-app-text-secondary">Немає доступних фото</p>
  </div>

  <div v-else class="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
    <div class="grid gap-2" :class="gridClass || 'grid-cols-3'">
      <div
        v-for="photo in availablePhotos"
        :key="photo.url"
        class="relative aspect-square cursor-pointer overflow-hidden border-2 transition-colors"
        :class="[
          photoRounding || 'rounded-sm',
          currentPhotoUrl === photo.url
            ? 'border-primary'
            : 'border-transparent hover:border-primary',
        ]"
        @click="emit('select', photo)"
      >
        <img :src="photo.thumbnail" alt="" class="w-full h-full object-cover" />
        <div
          v-if="photo.file"
          class="absolute bottom-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
          style="background: rgba(0, 0, 0, 0.6)"
        >
          <ArrowUpTrayIcon class="w-3 h-3 text-white" />
        </div>
        <Button
          v-if="photo.file"
          variant="ghost"
          icon-only
          class="absolute top-0.5 right-0.5 z-10"
          @click.stop="emit('removePhoto', photo.url)"
        >
          <template #icon>
            <XMarkIcon class="w-3.5 h-3.5 text-white" />
          </template>
        </Button>
      </div>
    </div>
  </div>

  <div v-if="currentPhotoUrl" class="mt-3 flex justify-center">
    <Button variant="text" size="xs" @click="emit('clear')"> Очистити </Button>
  </div>

  <div
    v-if="showNavigation"
    class="mt-3 flex items-center justify-center gap-1 border-t border-app-border pt-3"
  >
    <Button variant="ghost" size="xs" :ring="false" @click="emit('back')">
      Назад
    </Button>
    <Button variant="ghost" size="xs" :ring="false" @click="emit('skip')">
      Пропустити
    </Button>
    <div class="w-px h-4 bg-app-border mx-1" />
    <Button variant="ghost" size="xs" :ring="false" @click="emit('cancel')">
      Скасувати
    </Button>
  </div>
</template>
