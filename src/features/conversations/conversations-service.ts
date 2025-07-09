import apiClient from "@src/api/axios-instance";
import type {
  ApiCommunicationResponse,
  ApiCommunicationLeadsResponse,
  ApiCommunicationClientsResponse,
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiMessagesResponse,
} from "@src/api/types";

import type { IAttachment } from "@src/shared/types/types";
export interface GetCommunicationsParams {
  page?: number;
  search?: string;
  user_id?: number;
  communication_status_id?: number;
}

export interface SendMessageParams {
  phone: string;
  message: string;
  file_url?: string;
  messenger_id: number;
  contragent_type: "lead" | "client";
  contragent_id: number;
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

  async getCommunicationMessages(
    entity: "leads" | "clients",
    id: number,
  ): Promise<ApiMessagesResponse> {
    try {
      const response = await apiClient.get<ApiMessagesResponse>(
        `/communications/${entity}/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communication messages:", error);
      throw new Error("Failed to fetch communication messages");
    }
  }

  async getCommunicationEntityById<T>(
    entity: "leads" | "clients",
    id: number,
  ): Promise<T> {
    try {
      const response = await apiClient.get<T>(`/${entity}/${id}`);
      return response.data;
    } catch (error) {
      const entitySingular = entity.slice(0, -1);
      console.error(
        `Error fetching communication ${entitySingular} by ID:`,
        error,
      );
      throw new Error(`Failed to fetch communication ${entitySingular}`);
    }
  }

  async getCommunicationLeadById(
    id: number,
  ): Promise<ApiCommunicationLeadFull> {
    return this.getCommunicationEntityById<ApiCommunicationLeadFull>(
      "leads",
      id,
    );
  }

  async getCommunicationClientById(
    id: number,
  ): Promise<ApiCommunicationClientFull> {
    return this.getCommunicationEntityById<ApiCommunicationClientFull>(
      "clients",
      id,
    );
  }

  async sendMessage(message: SendMessageParams): Promise<void> {
    try {
      await apiClient.post("/e-chat/dialogs/messages", message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }
  /**
   * Upload a file to the server
   * @param file - The file to upload
   * @returns Promise with the URL of the uploaded file
   */
  async uploadFile(file: IAttachment): Promise<string> {
    const formData = new FormData();
    formData.append("file_for_message", file.file as Blob, file.name);

    try {
      const response = await apiClient.post<{ url: string }>(
        "/e-chat/dialogs/files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data.file_url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }
}

export const conversationsService = new ConversationsService();

export default conversationsService;
