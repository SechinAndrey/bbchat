import { defineStore } from "pinia";
import { ref } from "vue";
import { useAxios } from "@vueuse/integrations/useAxios";
import apiClient from "@src/api/axios-instance";
import type { GetSelectionsParams } from "./selections-service";
import type { ApiSelection } from "@src/api/types";
import type { EntityType } from "@src/shared/types/common";

export const useSelectionsStore = defineStore("selections", () => {
  // State
  const selections = ref<ApiSelection[]>([]);
  const currentEntity = ref<{ type: EntityType; id: number } | null>(null);

  const { data, isLoading, error, execute } = useAxios<ApiSelection[]>(
    "",
    apiClient,
    { immediate: false },
  );

  // Actions
  const fetchSelections = async (
    entity: EntityType,
    id: number,
    params?: GetSelectionsParams,
  ) => {
    // Reset if entity changes
    if (
      currentEntity.value?.type !== entity ||
      currentEntity.value?.id !== id
    ) {
      selections.value = [];
      currentEntity.value = { type: entity, id };
    }

    const url = `/${entity}/${id}/selections`;

    // The `execute` function will handle isLoading and error states automatically.
    await execute(url, { params });

    if (data.value) {
      selections.value = data.value;
    }
  };

  const deleteSelection = async (setId: number) => {
    const url = `/selections/${setId}`;
    await apiClient.delete(url);
    selections.value = selections.value.filter(
      (selection) => selection.id !== setId,
    );
  };

  const updateBoardsWatchStatus = (
    selectionId: number,
    boardIds: number[],
    watchedFrom?: string,
    watchedTo?: string,
  ) => {
    const selection = selections.value.find((s) => s.id === selectionId);
    if (!selection?.boards_list) return;

    const isWatched = !!(watchedFrom || watchedTo);

    selection.boards_list.forEach((board) => {
      if (boardIds.includes(board.id)) {
        board.isWatched = isWatched;
        board.watchedFrom = watchedFrom;
        board.watchedTo = watchedTo;
      }
    });
  };

  const removeBoardsFromSelection = (
    selectionId: number,
    selectionItemIds: number[],
  ) => {
    const selection = selections.value.find((s) => s.id === selectionId);
    if (!selection?.boards_list) return;

    selection.boards_list = selection.boards_list.filter(
      (board) => !selectionItemIds.includes(board.selection_item_id),
    );

    selection.boards_count = selection.boards_list.length;
  };

  const resetState = () => {
    selections.value = [];
    currentEntity.value = null;
    data.value = undefined;
    error.value = undefined;
  };

  return {
    selections,
    isLoading,
    error,
    currentEntity,
    fetchSelections,
    deleteSelection,
    updateBoardsWatchStatus,
    removeBoardsFromSelection,
    resetState,
  };
});
