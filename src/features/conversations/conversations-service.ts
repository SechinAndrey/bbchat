import apiClient from "@src/api/axios-instance";
import type {
  ApiCommunicationResponse,
  ApiCommunicationEntityResponse,
  ApiCommunicationLeadsResponse,
  ApiCommunicationClientsResponse,
  ApiCommunicationSuppliersResponse,
  ApiCommunicationEntityFull,
  ApiMessagesResponse,
  ApiMessageItem,
  CreateLeadRequest,
  UpdateLeadRequest,
} from "@src/api/types";

import type { IAttachment } from "@src/shared/types/types";
import type { EntityType } from "@src/shared/types/common";

export interface GetCommunicationsParams {
  page?: number;
  search?: string;
  user_id?: number;
  communication_status_id?: number;
}

export interface GetMessagesParams {
  page?: number;
  search?: string;
}

export interface SendMessageParams {
  phone: string;
  message: string;
  file_url?: string;
  messenger_id: number;
  contragent_type: "lead" | "client" | "supplier";
  contragent_id: number;
}

interface EntityConfig {
  apiPath: string;
  contactsPath: string;
  responseKey: EntityType;
}

const ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  leads: {
    apiPath: "/communications/leads",
    contactsPath: "/communications/leads/contacts",
    responseKey: "leads",
  },
  clients: {
    apiPath: "/communications/clients",
    contactsPath: "/communications/clients/contacts",
    responseKey: "clients",
  },
  suppliers: {
    apiPath: "/communications/suppliers",
    contactsPath: "/communications/suppliers/contacts",
    responseKey: "suppliers",
  },
};

export class ConversationsService {
  async fetchEntityCommunications<T extends ApiCommunicationEntityResponse>(
    entity: EntityType,
    params?: GetCommunicationsParams,
  ): Promise<T> {
    try {
      const config = ENTITY_CONFIGS[entity];
      const response = await apiClient.get<T>(config.apiPath, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching communications ${entity}:`, error);
      throw new Error(`Failed to fetch communications ${entity}`);
    }
  }

  async fetchEntityContactsConversations<
    T extends ApiCommunicationEntityResponse,
  >(entity: EntityType, params?: GetCommunicationsParams): Promise<T> {
    try {
      const config = ENTITY_CONFIGS[entity];
      const response = await apiClient.get<T>(config.contactsPath, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${entity} contacts conversations:`, error);
      throw new Error(`Failed to fetch ${entity} contacts conversations`);
    }
  }

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

  async getCommunicationsLeads(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationLeadsResponse> {
    return this.fetchEntityCommunications<ApiCommunicationLeadsResponse>(
      "leads",
      params,
    );
  }

  async getLeadsContactsConversations(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationLeadsResponse> {
    return this.fetchEntityContactsConversations<ApiCommunicationLeadsResponse>(
      "leads",
      params,
    );
  }

  async getCommunicationsClients(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationClientsResponse> {
    return this.fetchEntityCommunications<ApiCommunicationClientsResponse>(
      "clients",
      params,
    );
  }

  async getClientsContactsConversations(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationClientsResponse> {
    return this.fetchEntityContactsConversations<ApiCommunicationClientsResponse>(
      "clients",
      params,
    );
  }

  async getCommunicationsSuppliers(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationSuppliersResponse> {
    return this.fetchEntityCommunications<ApiCommunicationSuppliersResponse>(
      "suppliers",
      params,
    );
  }

  async getSuppliersContactsConversations(
    params?: GetCommunicationsParams,
  ): Promise<ApiCommunicationSuppliersResponse> {
    return this.fetchEntityContactsConversations<ApiCommunicationSuppliersResponse>(
      "suppliers",
      params,
    );
  }

  async getCommunicationMessages(
    entity: EntityType,
    id: number,
    contactId: number,
    params?: GetMessagesParams,
  ): Promise<ApiMessagesResponse> {
    try {
      const response = await apiClient.get<ApiMessagesResponse>(
        `/communications/${entity}/${id}/contacts/${contactId}`,
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communication messages:", error);
      throw new Error("Failed to fetch communication messages");
    }
  }

  async getCommunicationEntityById<T extends ApiCommunicationEntityFull>(
    entity: EntityType,
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

  async sendMessage(message: SendMessageParams): Promise<void> {
    try {
      await apiClient.post("/e-chat/dialogs/messages", message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  async uploadFile(file: IAttachment): Promise<string> {
    const formData = new FormData();
    formData.append("file_for_message", file.file as Blob, file.name);

    try {
      const response = await apiClient.post<{ file_url: string }>(
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

  async createLead(
    leadData: CreateLeadRequest,
  ): Promise<ApiCommunicationEntityFull> {
    try {
      const response = await apiClient.post<ApiCommunicationEntityFull>(
        "/leads",
        leadData,
      );
      console.log("Lead created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating lead:", error);
      throw new Error("Failed to create lead");
    }
  }

  async updateLead(
    id: number,
    leadData: UpdateLeadRequest,
  ): Promise<ApiCommunicationEntityFull> {
    try {
      const response = await apiClient.patch<ApiCommunicationEntityFull>(
        `/leads/${id}`,
        leadData,
      );
      console.log("Lead updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw new Error("Failed to update lead");
    }
  }

  async updateConversation(
    entity: EntityType,
    id: number,
    data: Partial<ApiCommunicationEntityFull>,
  ): Promise<void> {
    try {
      await apiClient.patch(`/communications/${entity}/${id}`, data);
    } catch (error) {
      console.error(
        `Error updating communication ${entity.slice(0, -1)}:`,
        error,
      );
      throw new Error(`Failed to update communication ${entity.slice(0, -1)}`);
    }
  }

  async changeStatus(id: number, status: number) {
    try {
      return await apiClient.post(`/leads/${id}/change-status`, {
        new_status_id: status,
      });
    } catch (error) {
      console.error("Error changing lead status:", error);
      throw new Error("Failed to change lead status");
    }
  }

  async getCommunicationItemById(id: number): Promise<ApiMessageItem> {
    try {
      const response = await apiClient.get<ApiMessageItem>(
        `/communications/messages/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communication item by ID:", error);
      throw new Error("Failed to fetch communication item");
    }
  }

  async getCommunicationContactInfo(
    entity: EntityType,
    entityId: number,
    contactId: number,
  ): Promise<ApiCommunicationEntityFull> {
    try {
      const response = await apiClient.get<ApiCommunicationEntityFull>(
        `/communications/${entity}/${entityId}/contacts/${contactId}/info`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching communication contact info:", error);
      throw new Error("Failed to fetch communication contact info");
    }
  }
}

export const conversationsService = new ConversationsService();

export default conversationsService;
