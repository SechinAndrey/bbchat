import apiClient from "@src/api/axios-instance";
import type { ApiSelection } from "@src/api/types";
import type { EntityType } from "@src/shared/types/common";

export interface GetSelectionsParams {
  filters?: Record<string, unknown>;
}

export type ApiSelectionsResponse = ApiSelection[];

export interface FollowParams {
  id: number; // entity id
  type: EntityType;
  selection_id: number;
  boards_ids: number[];
  month_from?: string;
  month_to?: string;
}

export interface UnfollowParams {
  id: number; // entity id
  type: EntityType;
  selection_id: number;
  boards_ids: number[];
}

export class SelectionsService {
  /**
   * Get selections for a specific entity by ID
   * @param entity - Type of entity (leads or clients)
   * @param id - Entity ID
   * @param params - Query parameters
   * @returns Promise with selections data
   */
  async getSelectionsByEntityId(
    entity: EntityType,
    id: number,
    params?: GetSelectionsParams,
  ): Promise<ApiSelectionsResponse> {
    try {
      const response = await apiClient.get<ApiSelectionsResponse>(
        `/${entity}/${id}/selections`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching selections for ${entity.slice(0, -1)} ${id}:`,
        error,
      );
      throw new Error(`Failed to fetch selections for ${entity.slice(0, -1)}`);
    }
  }

  async followBoards(params: FollowParams): Promise<void> {
    try {
      const singleEntity = params.type === "leads" ? "lead" : "client";
      await apiClient.post(`/supervisions`, {
        ...params,
        type: singleEntity,
      });
    } catch (error) {
      console.error(
        `Error following boards for selection ${params.selection_id}:`,
        error,
      );
      throw new Error(
        `Failed to follow boards for selection ${params.selection_id}`,
      );
    }
  }

  async unfollowBoards(params: UnfollowParams): Promise<void> {
    try {
      const singleEntity = params.type === "leads" ? "lead" : "client";
      await apiClient.delete(`/supervisions`, {
        data: {
          ...params,
          type: singleEntity,
        },
      });
    } catch (error) {
      console.error(
        `Error unfollowing boards for selection ${params.selection_id}:`,
        error,
      );
      throw new Error(
        `Failed to unfollow boards for selection ${params.selection_id}`,
      );
    }
  }

  async downloadSelection(
    selectionId: number,
    props: object,
  ): Promise<{ link: string }> {
    try {
      const response = await apiClient.post(
        `/selections/${selectionId}/export`,
        {
          props,
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Error downloading selection ${selectionId}:`, error);
      throw new Error(`Failed to download selection ${selectionId}`);
    }
  }

  async deleteBoardsFromSelection(
    selection_id: number,
    params: {
      items: number[];
    },
  ): Promise<void> {
    try {
      await apiClient.delete(`/selections/${selection_id}/items`, {
        data: params,
      });
    } catch (error) {
      console.error(
        `Error deleting boards from selection ${selection_id}:`,
        error,
      );
      throw new Error(`Failed to delete boards from selection ${selection_id}`);
    }
  }

  async getLink(
    selectionId: number,
    boardsIds: number[],
  ): Promise<{ link: string }> {
    try {
      const response = await apiClient.post(`/selections/${selectionId}/link`, {
        boards: boardsIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting link for selection ${selectionId}:`, error);
      throw new Error(`Failed to get link for selection ${selectionId}`);
    }
  }

  async addFromCart(selectionId: number): Promise<ApiSelection> {
    try {
      const response = await apiClient.post(
        `/selections/${selectionId}/add-from-basket`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding boards from cart to selection ${selectionId}:`,
        error,
      );
      throw new Error(
        `Failed to add boards from cart to selection ${selectionId}`,
      );
    }
  }
}

export const selectionsService = new SelectionsService();

export default selectionsService;
