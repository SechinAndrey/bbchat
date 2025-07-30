<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Select from "@src/ui/inputs/Select.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import useGlobalDataStore from "@src/shared/store/global-data-store";

const conversationsStore = useConversationsStore();
const globalDataStore = useGlobalDataStore();

const options = computed(() => {
  const currentStatus = globalDataStore.getKanbanStatusById(
    conversationsStore.activeConversationInfo?.status_id || 0,
  );
  return globalDataStore.kanbanStatuses.reduce<
    { value: number; label: string }[]
  >((acc, status) => {
    let availableStatuses: number[] = [];
    try {
      availableStatuses = JSON.parse(currentStatus?.avaliable_statuses || "[]");
    } catch (e) {
      console.error("Error parsing available statuses:", e);
    }
    if (
      availableStatuses.includes(status.id) ||
      status.id === selectedId.value
    ) {
      acc.push({
        value: status.id,
        label: status.name,
      });
    }

    return acc;
  }, []);
});

const selectedId = ref(
  conversationsStore.activeConversationInfo?.status_id || "",
);

selectedId.value = conversationsStore.activeConversationInfo?.status_id || "";

watch(
  () => selectedId.value,
  (newValue) => {
    conversationsStore.changeStatus(
      conversationsStore?.activeConversationInfo?.id as number,
      newValue as number,
    );
  },
);
</script>

<template>
  <Select
    v-model="selectedId"
    :options="options"
    placeholder="Виберіть статус"
    class="w-full kanban-select"
    size="sm"
    :icon="false"
  />
</template>

<style lang="scss">
.kanban-select {
  width: min-content !important;

  button {
    @apply justify-start;

    > span {
      @apply bg-green-100 py-1 px-4 rounded-sm text-left text-sm;

      > span {
        @apply text-green-600;
      }
    }
  }
}
</style>
