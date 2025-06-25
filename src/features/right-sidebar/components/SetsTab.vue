<script setup lang="ts">
import { inject } from "vue";
import { useSelectionsStore } from "@src/features/selections/selection-store";
import { formatConversationDate } from "@src/shared/utils/utils";

// components
import Spinner from "@src/ui/states/loading-states/Spinner.vue";

const selectionsStore = useSelectionsStore();
const entity = inject("entity") as "leads" | "clients";
const id = inject("id") as number;

selectionsStore.fetchSelections(entity, id);
</script>

<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">Підбірки</h3>
    <div v-if="selectionsStore.isLoading" class="flex justify-center pt-10">
      <Spinner />
    </div>
    <div v-else>
      <div v-if="selectionsStore.selections.length > 0" class="space-y-3">
        <div
          v-for="selection in selectionsStore.selections"
          :key="selection.id"
        >
          <div class="flex items-center justify-between">
            <div>ID</div>
            <div>{{ selection.id }}</div>
          </div>
          <div class="flex items-center justify-between">
            <div>Type</div>
            <div>{{ selection.type.name }}</div>
          </div>
          <div class="flex items-center justify-between">
            <div>Date of Creation</div>
            <div>{{ formatConversationDate(selection.created_at) }}</div>
          </div>
          <div class="flex items-center justify-between">
            <div>Manager</div>
            <div>{{ selection?.manager?.name || "Unknown" }}</div>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500">
        Немає підбірок для цього {{ entity }}.
      </div>
    </div>
  </div>
</template>
