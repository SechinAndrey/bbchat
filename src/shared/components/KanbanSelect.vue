<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Select from "@src/ui/inputs/Select.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import { useToast } from "@src/shared/composables/useToast";

const conversationsStore = useConversationsStore();
const globalDataStore = useGlobalDataStore();
const { toastSuccess, toastError } = useToast();

const options = computed(() => {
  const currentStatus = globalDataStore.getKanbanStatusById(
    conversationsStore.activeConversation?.status_id || 0,
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

const selectedId = ref(conversationsStore.activeConversation?.status_id || "");

watch(
  () => conversationsStore.activeConversation?.status_id,
  (newStatusId) => {
    selectedId.value = newStatusId ?? "";
  },
  { immediate: true },
);

watch(
  () => selectedId.value,
  async (newValue) => {
    if (
      conversationsStore.activeConversation &&
      conversationsStore.activeConversation.status_id !== newValue
    ) {
      try {
        await conversationsStore.changeLeadStatus(
          conversationsStore.activeConversation.id as number,
          newValue as number,
        );
        toastSuccess("Статус успішно змінено");
      } catch (err) {
        selectedId.value =
          conversationsStore.activeConversation.status_id ?? "";

        const errorMessage =
          err instanceof Error ? err.message : "Не вдалося змінити статус";
        toastError(errorMessage);
      }
    }
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
