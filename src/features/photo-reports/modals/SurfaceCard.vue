<script setup lang="ts">
import { computed } from "vue";
import { PlusIcon, PhotoIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import Select from "@src/ui/inputs/Select.vue";
import SlotStatusBadge from "../components/SlotStatusBadge.vue";
import type { Board, PhotoSlotType, SlotStatus } from "../types";
import { SLOT_TYPES, PHOTO_SLOT_LABELS } from "../types";

const props = defineProps<{
  board: Board;
  assignments: Map<string, { type: PhotoSlotType; photo_url: string }>;
  selectedSlotTypes: Map<string, PhotoSlotType>;
  activeSlotKey?: string;
  readonly?: boolean;
  slotStatuses?: Map<string, SlotStatus>;
}>();

const emit = defineEmits<{
  slotClick: [boardId: number, slotType: PhotoSlotType];
  typeChange: [
    boardId: number,
    slotType: PhotoSlotType,
    newType: PhotoSlotType,
  ];
  clearSlot: [boardId: number, slotType: PhotoSlotType];
  badgeRetry: [photoUrl: string];
  slotDone: [boardId: number, slotType: PhotoSlotType];
}>();

const slotTypeOptions = Object.entries(PHOTO_SLOT_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

const assignmentKey = (slotType: PhotoSlotType) =>
  `${props.board.board_id}-${slotType}`;

const slotAssignments = computed(() => {
  const result = {} as Record<
    PhotoSlotType,
    { type: PhotoSlotType; photo_url: string } | null
  >;
  for (const slotType of SLOT_TYPES) {
    result[slotType] = props.assignments.get(assignmentKey(slotType)) || null;
  }
  return result;
});

const getSlotTypeValue = (slotType: PhotoSlotType): PhotoSlotType => {
  const assignment = slotAssignments.value[slotType];
  if (assignment) return assignment.type;
  return props.selectedSlotTypes.get(assignmentKey(slotType)) || slotType;
};
</script>

<template>
  <div
    class="rounded-sm border border-app-border bg-app-bg shadow-sm overflow-hidden"
  >
    <!-- Header: thumbnail + board info -->
    <div class="flex items-start gap-4 p-5 pb-3">
      <!-- Board photo thumbnail -->
      <div
        class="h-[3rem] md:h-[5rem] aspect-video shrink-0 overflow-hidden rounded bg-app-bg-secondary flex items-center justify-center"
      >
        <img
          v-if="board.board_photo"
          :src="board.board_photo"
          alt=""
          class="w-full h-full object-cover"
        />
        <PhotoIcon v-else class="w-6 h-6 text-app-text-secondary" />
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1 text-left flex flex-col gap-1 pt-0 md:pt-2">
        <h3
          class="text-sm font-semibold leading-snug text-app-text line-clamp-3 md:line-clamp-2 h-[4.125em] md:h-[2.75em] overflow-hidden"
        >
          {{ board.board_address }}
        </h3>
        <!-- Desktop only: info inline with title -->
        <div class="hidden md:flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span class="text-[0.7rem]">
            {{ board.board_city }}
          </span>
          <span class="text-app-text-secondary text-lg">·</span>
          <span class="text-[0.7rem]">
            <span class="text-[0.7rem] text-app-text-secondary"
              >Код площини:</span
            >
            {{ board.board_id }}
          </span>
          <span class="text-app-text-secondary text-lg">·</span>
          <span class="text-[0.7rem]">
            <span class="text-[0.7rem] text-app-text-secondary"
              >Код підрядника</span
            >
            {{ board.board_code }}
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile only: info below photo + title row -->
    <div
      class="flex md:hidden flex-wrap items-center gap-x-2 gap-y-0.5 px-5 pb-3"
    >
      <span class="text-[0.7rem]">
        {{ board.board_city }}
      </span>
      <span class="text-app-text-secondary text-lg">·</span>
      <span class="text-[0.7rem]">
        <span class="text-[0.7rem] text-app-text-secondary">Код площини:</span>
        {{ board.board_id }}
      </span>
      <span class="text-app-text-secondary text-lg">·</span>
      <span class="text-[0.7rem]">
        <span class="text-[0.7rem] text-app-text-secondary"
          >Код підрядника</span
        >
        {{ board.board_code }}
      </span>
    </div>

    <!-- Photo slots -->
    <div
      class="grid grid-cols-4 gap-2 border-t border-app-border bg-app-bg-secondary px-3 py-3"
    >
      <div v-for="slotType in SLOT_TYPES" :key="slotType" class="flex flex-col">
        <!-- Slot type label / select -->
        <div class="mb-1.5 h-[1.75rem] flex items-center justify-center">
          <span v-if="readonly" class="text-xs text-app-text-secondary">
            {{ PHOTO_SLOT_LABELS[getSlotTypeValue(slotType)] }}
          </span>
          <Select
            v-else
            :model-value="getSlotTypeValue(slotType)"
            :options="slotTypeOptions"
            :icon="false"
            size="xs"
            class="w-full"
            @update:model-value="
              (val: string | number) =>
                emit(
                  'typeChange',
                  board.board_id,
                  slotType,
                  val as PhotoSlotType,
                )
            "
          />
        </div>

        <!-- Slot image area -->
        <div
          :data-slot-key="`${board.board_id}-${slotType}`"
          class="group relative aspect-[4/3] rounded-xl overflow-hidden transition-all bg-app-bg"
          :class="[
            readonly
              ? 'border-2 border-app-border'
              : slotAssignments[slotType]
                ? 'border-2 border-primary cursor-pointer'
                : 'border-2 border-dashed border-app-border cursor-pointer hover:border-primary',
            !readonly && activeSlotKey === `${board.board_id}-${slotType}`
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-app-bg'
              : '',
          ]"
          @click="!readonly && emit('slotClick', board.board_id, slotType)"
        >
          <img
            v-if="slotAssignments[slotType]"
            :src="slotAssignments[slotType]!.photo_url"
            alt=""
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center transition-colors"
            :class="
              readonly
                ? 'text-app-text-secondary'
                : 'text-app-text-secondary hover:text-primary'
            "
          >
            <PlusIcon class="w-6 h-6" />
          </div>

          <!-- Hover overlay with remove button (non-readonly only) -->
          <div
            v-if="slotAssignments[slotType] && !readonly"
            class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop
          >
            <button
              class="text-white/80 hover:text-white transition-colors"
              @click.stop="emit('clearSlot', board.board_id, slotType)"
            >
              <XCircleIcon class="w-6 h-6 drop-shadow" />
            </button>
          </div>

          <SlotStatusBadge
            :status="slotStatuses?.get(`${board.board_id}-${slotType}`)"
            @retry="
              slotAssignments[slotType] &&
              emit('badgeRetry', slotAssignments[slotType]!.photo_url)
            "
            @done="emit('slotDone', board.board_id, slotType)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
