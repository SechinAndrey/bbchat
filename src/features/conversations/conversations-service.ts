import apiClient from "@src/api/axios-instance";
import type {
  ApiCommunicationResponse,
  ApiCommunicationLeadsResponse,
  ApiCommunicationClientsResponse,
} from "@src/api/types";

export interface GetCommunicationsParams {
  page?: number;
  search?: string;
  user_id?: number;
}

export class ConversationsService {
  /**
   * Get all communications (leads and clients) for current user
   * @returns Promise with communications data
   */
  async getCommunications(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationResponse> {
    try {
      const response = await apiClient.get<ApiCommunicationResponse>(
        "/communications",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communications:", error);
      throw new Error("Failed to fetch communications");
    }
  }

  /**
   * Get all leads for current user
   * @returns Promise with leads data
   */
  async getCommunicationsLeads(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationLeadsResponse> {
    try {
      const response = await apiClient.get<ApiCommunicationLeadsResponse>(
        "/communications/leads",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communications leads:", error);
      throw new Error("Failed to fetch communications leads");
    }
  }

  /**
   * Get all clients for current user
   * @returns Promise with clients data
   */
  async getCommunicationsClients(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationClientsResponse> {
    try {
      const response = await apiClient.get<ApiCommunicationClientsResponse>(
        "/communications/clients",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communications clients:", error);
      throw new Error("Failed to fetch communications clients");
    }
  }
}

export const conversationsService = new ConversationsService();

export default conversationsService;
