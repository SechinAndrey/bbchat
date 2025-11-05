import apiClient from "@src/api/axios-instance";
import type {
  ApiCommunicationResponse,
  ApiCommunicationEntityResponse,
  ApiCommunicationEntityFull,
  ApiMessagesResponse,
  ApiMessageItem,
  CreateLeadRequest,
  UpdateLeadRequest,
  ApiCommunicationLead,
  ApiCommunicationEntity,
  ApiResponseLinks,
  ApiResponseMeta,
  ApiSendMessageResponse,
} from "@src/api/types";

import type { IAttachment } from "@src/shared/types/types";
import type { EntityType } from "@src/shared/types/common";

export interface ConversationParams {
  page?: number;
  search?: string;
  user_id?: number;
  communication_status_id?: number;
}

export interface MessageParams {
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
  contragent_contact_id?: number;
  client_message_uid: string;
  reply_message_id?: number | null;
}

interface EntityConfig {
  apiPath: string;
  contactsPath: string;
}

const ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  leads: {
    apiPath: "/communications/leads",
    contactsPath: "/communications/leads/contacts",
  },
  clients: {
    apiPath: "/communications/clients",
    contactsPath: "/communications/clients/contacts",
  },
  suppliers: {
    apiPath: "/communications/suppliers",
    contactsPath: "/communications/suppliers/contacts",
  },
};

export class ConversationsService {
  /**
   * Get conversations for specific entity type
   * @example await service.getConversations('leads', { page: 1, search: 'john' })
   */
  async getConversations(
    entity: EntityType,
    params?: ConversationParams,
  ): Promise<ApiCommunicationEntityResponse> {
    try {
      const config = ENTITY_CONFIGS[entity];
      const response = await apiClient.get<ApiCommunicationEntityResponse>(
        config.contactsPath,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${entity} conversations:`, error);
      throw new Error(`Failed to fetch ${entity} conversations`);
    }
  }

  async getConversationsForEntity(
    entity: EntityType,
    entityId: number,
    params?: ConversationParams,
  ): Promise<{
    data: ApiCommunicationEntity[];
    links: ApiResponseLinks;
    meta: ApiResponseMeta;
  }> {
    try {
      const config = ENTITY_CONFIGS[entity];

      const response = await apiClient.get<{
        data: ApiCommunicationEntity[];
        links: ApiResponseLinks;
        meta: ApiResponseMeta;
      }>(`${config.apiPath}/${entityId}/contacts`, { params });

      return response.data;
    } catch (error) {
      console.error(
        `❌ Failed to fetch ${entity} ${entityId} conversations:`,
        error,
      );
      throw new Error(`Failed to fetch ${entity} ${entityId} conversations`);
    }
  }

  /**
   * Get all conversations (leads + clients + suppliers)
   * @example await service.getAllConversations({ page: 1 })
   */
  async getAllConversations(
    params?: ConversationParams,
  ): Promise<ApiCommunicationResponse> {
    try {
      const response = await apiClient.get<ApiCommunicationResponse>(
        "/communications",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch all conversations:", error);
      throw new Error("Failed to fetch all conversations");
    }
  }

  /**
   * Get conversation details by ID
   * @example await service.getConversationById('leads', 123)
   */
  async getConversationById<T extends ApiCommunicationEntityFull>(
    entity: EntityType,
    id: number,
  ): Promise<T> {
    try {
      const response = await apiClient.get<T>(`/${entity}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${entity.slice(0, -1)} ${id}:`, error);
      throw new Error(`Failed to fetch ${entity.slice(0, -1)} ${id}`);
    }
  }

  /**
   * Get conversation contact info (for missing conversations)
   * @example await service.getConversationContactInfo('leads', 123, 456)
   */
  async getConversationContactInfo(
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
      console.error("❌ Failed to fetch conversation contact info:", error);
      throw new Error("Failed to fetch conversation contact info");
    }
  }

  /**
   * Get messages for a conversation
   * @example await service.getMessages('leads', 123, 456, { page: 1 })
   */
  async getMessages(
    entity: EntityType,
    id: number,
    contactId: number,
    params?: MessageParams,
  ): Promise<ApiMessagesResponse> {
    try {
      const response = await apiClient.get<ApiMessagesResponse>(
        `/communications/${entity}/${id}/contacts/${contactId}`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  /**
   * Get message by ID (for Pusher events)
   * @example await service.getMessageById(789)
   */
  async getMessageById(id: number): Promise<ApiMessageItem> {
    try {
      const response = await apiClient.get<ApiMessageItem>(
        `/communications/messages/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch message by ID:", error);
      throw new Error("Failed to fetch message by ID");
    }
  }

  /**
   * Send a message
   * @example await service.sendMessage({ phone: '+123', message: 'Hello', ... })
   */
  async sendMessage(
    params: SendMessageParams,
  ): Promise<ApiSendMessageResponse> {
    try {
      const response = await apiClient.post<ApiSendMessageResponse>(
        "/e-chat/dialogs/messages",
        params,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      throw new Error("Failed to send message");
    }
  }

  /**
   * Upload file for message
   * @example const fileUrl = await service.uploadFile(attachment)
   */
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
      console.error("❌ Failed to upload file:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Update conversation
   * @example await service.updateConversation('leads', 123, { status_id: 2 })
   */
  async updateConversation(
    entity: EntityType,
    id: number,
    data: Partial<ApiCommunicationEntityFull>,
  ): Promise<void> {
    try {
      await apiClient.patch(`/communications/${entity}/${id}`, data);
    } catch (error) {
      console.error(`❌ Failed to update ${entity.slice(0, -1)}:`, error);
      throw new Error(`Failed to update ${entity.slice(0, -1)}`);
    }
  }

  /**
   * Create new lead
   * @example const lead = await service.createLead({ name: 'John', ... })
   */
  async createLead(leadData: CreateLeadRequest): Promise<ApiCommunicationLead> {
    const response = await apiClient.post<ApiCommunicationLead>(
      "/leads",
      leadData,
    );
    return response.data;
  }

  /**
   * Update lead
   * @example const lead = await service.updateLead(123, { name: 'John Updated' })
   */
  async updateLead(
    id: number,
    leadData: UpdateLeadRequest,
  ): Promise<ApiCommunicationEntityFull> {
    try {
      const response = await apiClient.patch<ApiCommunicationEntityFull>(
        `/leads/${id}`,
        leadData,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update lead:", error);
      throw new Error("Failed to update lead");
    }
  }

  /**
   * Change lead status
   * @example await service.changeLeadStatus(123, 2)
   */
  async changeLeadStatus(id: number, status: number): Promise<void> {
    try {
      await apiClient.post(`/leads/${id}/change-status`, {
        new_status_id: status,
      });
    } catch (error) {
      console.error("❌ Failed to change lead status:", error);
      throw new Error("Failed to change lead status");
    }
  }
}
export const conversationsService = new ConversationsService();
export default conversationsService;
