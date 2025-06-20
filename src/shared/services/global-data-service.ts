import apiClient from "@src/api/axios-instance";
import type { ApiGlobalDataResponse } from "@src/api/types";

export class GlobalDataService {
  /**
   * Fetches global data from the API.
   * @returns Promise with global data.
   */
  async getGlobalData(): Promise<ApiGlobalDataResponse> {
    try {
      const response = await apiClient.get("/global-data");
      return response.data;
    } catch (error) {
      console.error("Error fetching global data:", error);
      throw new Error("Failed to fetch global data");
    }
  }
}

export const globalDataService = new GlobalDataService();

export default globalDataService;
