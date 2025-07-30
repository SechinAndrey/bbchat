import apiClient from "@src/api/axios-instance";
import type { ApiSelection } from "@src/api/types";
import type { EntityType } from "@src/shared/types/common";

export interface GetSelectionsParams {
  filters?: Record<string, unknown>;
}

export type ApiSelectionsResponse = ApiSelection[];

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
}

export const selectionsService = new SelectionsService();

export default selectionsService;
