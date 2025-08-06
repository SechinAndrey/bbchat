<script setup lang="ts">
import { inject } from "vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import { formatConversationDate } from "@src/shared/utils/utils";

import type { EntityType } from "@src/shared/types/common";

// components
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import { RectangleStackIcon, TrashIcon } from "@heroicons/vue/24/outline";

const selectionsStore = useSelectionsStore();
const entity = inject("entity") as EntityType;
const id = inject("id") as number;

selectionsStore.fetchSelections(entity, id);
</script>

<template>
  <div class="p-4">
    <div v-if="selectionsStore.isLoading" class="flex justify-center pt-10">
      <Spinner />
    </div>
    <div v-else>
      <div v-if="selectionsStore.selections.length > 0" class="space-y-3">
        <div
          v-for="selection in selectionsStore.selections"
          :key="selection.id"
          class="relative"
        >
          <button
            class="absolute right-1 p-2 hover:bg-secondary rounded-[4px] text-secondary-active"
          >
            <TrashIcon class="h-5 w-5">Remove</TrashIcon>
          </button>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">ID</div>
            <button class="text-[0.813rem] underline">
              {{ selection.id }}
            </button>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">Type</div>
            <div class="text-[0.813rem]">{{ selection.type.name }}</div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Дата створення
            </div>
            <div class="text-[0.813rem]">
              {{ formatConversationDate(selection.created_at) }}
            </div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Менеджер
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.manager?.name || "<Невідомо>" }}
            </div>
          </div>
          <div class="flex">
            <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
              Кількість площин
            </div>
            <div class="text-[0.813rem]">
              {{ selection?.boards_count || "<Невідомо>" }}
            </div>
          </div>

          <hr class="my-4" />
        </div>
      </div>

      <EmptyState
        v-else
        :icon="RectangleStackIcon"
        title="Пібірок немає"
        class="bg-theme-bg py-5 rounded"
      />
    </div>
  </div>
</template>
