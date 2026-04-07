import { defineStore } from "pinia";
import { ref } from "vue";
import photoReportsService from "./photo-reports-service";
import type {
  ClientSearchResult,
  ClientPeriod,
  Board,
  BoardSlotChange,
  SaveResponse,
  MessageTemplateResponse,
  CommunicationChannel,
  SlotStatus,
  PhotoSlotType,
  WorkType,
} from "./types";

export type SaveProgressCallback = (
  boardId: number,
  slotType: PhotoSlotType,
  status: SlotStatus,
) => void;

export const usePhotoReportsStore = defineStore("photoReports", () => {
  const clients = ref<ClientSearchResult[]>([]);
  const periods = ref<ClientPeriod[]>([]);
  const boards = ref<Board[]>([]);
  const allBoards = ref<Board[]>([]);
  const workTypes = ref<WorkType[]>([]);

  const isLoadingClients = ref(false);
  const isLoadingPeriods = ref(false);
  const isLoadingBoards = ref(false);
  const isSaving = ref(false);

  const currentClientId = ref<number | null>(null);
  const currentYm = ref<string | null>(null);

  const saveProgress = ref<{ current: number; total: number } | null>(null);

  const boardPhotoreportIds = ref<Map<number, number>>(new Map());

  const loadWorkTypes = async () => {
    if (workTypes.value.length > 0) return;
    try {
      workTypes.value = await photoReportsService.getWorkTypes();
    } catch (error) {
      console.error("Error loading work types:", error);
    }
  };

  const searchClients = async (query: string) => {
    isLoadingClients.value = true;
    try {
      clients.value = await photoReportsService.searchClients(query);
    } catch (error) {
      console.error("Error searching clients:", error);
      clients.value = [];
    } finally {
      isLoadingClients.value = false;
    }
  };

  const loadPeriods = async (clientId: number) => {
    if (isLoadingPeriods.value && currentClientId.value === clientId) return;
    isLoadingPeriods.value = true;
    currentClientId.value = clientId;
    try {
      periods.value = await photoReportsService.getClientPeriods(clientId);
    } catch (error) {
      console.error("Error loading periods:", error);
      periods.value = [];
    } finally {
      isLoadingPeriods.value = false;
    }
  };

  const loadBoards = async (clientId: number, ym: string, supplierId?: number) => {
    isLoadingBoards.value = true;
    currentYm.value = ym;
    try {
      boards.value = await photoReportsService.getBoards(clientId, ym, supplierId);
      // Keep unfiltered list for supplier options (only when no filter applied)
      if (supplierId === undefined) {
        allBoards.value = boards.value;
      }
      const ids = new Map<number, number>();
      for (const board of boards.value) {
        if (board.photoreport_id !== null) {
          ids.set(board.contract_board_id, board.photoreport_id);
        }
      }
      boardPhotoreportIds.value = ids;
    } catch (error) {
      console.error("Error loading boards:", error);
      boards.value = [];
    } finally {
      isLoadingBoards.value = false;
    }
  };

  const processSaveQueue = async (
    items: BoardSlotChange[],
    sendToClient?: { contact_id: number; channel: CommunicationChannel },
    onProgress?: SaveProgressCallback,
  ): Promise<{ response: SaveResponse; failedItems: BoardSlotChange[] }> => {
    isSaving.value = true;
    saveProgress.value = { current: 0, total: items.length };
    const failedItems: BoardSlotChange[] = [];

    if (onProgress) {
      for (const item of items) {
        onProgress(item.board_id, item.slotType, "queued");
      }
    }

    let lastResponse: SaveResponse | null = null;

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLast = i === items.length - 1;

        if (onProgress) {
          onProgress(item.board_id, item.slotType, "uploading");
        }

        try {
          const trackedId = boardPhotoreportIds.value.get(
            item.contract_board_id,
          );
          const photoreportId = trackedId ?? item.photoreport_id;

          const response = await photoReportsService.savePhoto({
            ...(photoreportId
              ? { photoreport_id: photoreportId }
              : {
                  contract_board_id: item.contract_board_id,
                  ym: currentYm.value!,
                }),
            slotType: item.slotType,
            value: item.value,
            work_id: item.work_id,
            sendToClient: isLast ? sendToClient : undefined,
          });

          lastResponse = response;

          if (response.data.created.length > 0) {
            const newIds = new Map(boardPhotoreportIds.value);
            newIds.set(item.contract_board_id, response.data.created[0]);
            boardPhotoreportIds.value = newIds;
          }

          if (onProgress) {
            onProgress(item.board_id, item.slotType, "uploaded");
          }
        } catch (error) {
          console.error(
            `Error saving slot ${item.slotType} for board ${item.board_id}:`,
            error,
          );
          if (onProgress) {
            onProgress(item.board_id, item.slotType, "error");
          }
          failedItems.push(item);
        }

        saveProgress.value = { current: i + 1, total: items.length };
      }

      if (!lastResponse) {
        throw new Error("All items failed");
      }

      return { response: lastResponse, failedItems };
    } finally {
      isSaving.value = false;
      saveProgress.value = null;
    }
  };

  const getMessageTemplate = async (
    clientId: number,
    ym: string,
  ): Promise<MessageTemplateResponse> => {
    return photoReportsService.getMessageTemplate(clientId, ym);
  };

  const reset = () => {
    boards.value = [];
    allBoards.value = [];
    currentYm.value = null;
    boardPhotoreportIds.value = new Map();
    saveProgress.value = null;
  };

  return {
    clients,
    periods,
    boards,
    allBoards,
    workTypes,
    isLoadingClients,
    isLoadingPeriods,
    isLoadingBoards,
    isSaving,
    currentClientId,
    currentYm,
    saveProgress,
    searchClients,
    loadWorkTypes,
    loadPeriods,
    loadBoards,
    processSaveQueue,
    getMessageTemplate,
    reset,
  };
});
