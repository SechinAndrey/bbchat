import apiClient from "@src/api/axios-instance";
import type {
  MessageTemplate,
  ApiMessageTemplatesResponse,
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  ApiMessageTemplateResponse,
} from "./types";

export class MessagesTemplatesService {
  /**
   * Get all message templates
   * @returns Promise with message templates array
   */
  async getTemplates(): Promise<MessageTemplate[]> {
    const response =
      await apiClient.get<ApiMessageTemplatesResponse>("/message-templates");
    return response.data.data;
  }

  /**
   * Get a single message template by ID
   * @param id - Template ID
   * @returns Promise with message template
   */
  async getTemplate(id: number): Promise<MessageTemplate> {
    const response = await apiClient.get<ApiMessageTemplateResponse>(
      `/message-templates/${id}`,
    );
    return response.data.data;
  }

  /**
   * Create a new message template
   * @param data - Template data
   * @returns Promise with created template
   */
  async createTemplate(
    data: CreateMessageTemplateRequest,
  ): Promise<MessageTemplate> {
    const response = await apiClient.post<ApiMessageTemplateResponse>(
      "/message-templates",
      data,
    );
    return response.data.data;
  }

  /**
   * Update an existing message template
   * @param id - Template ID
   * @param data - Updated template data
   * @returns Promise with updated template
   */
  async updateTemplate(
    id: number,
    data: UpdateMessageTemplateRequest,
  ): Promise<MessageTemplate> {
    const response = await apiClient.put<ApiMessageTemplateResponse>(
      `/message-templates/${id}`,
      data,
    );
    return response.data.data;
  }

  /**
   * Delete a message template
   * @param id - Template ID
   * @returns Promise<void>
   */
  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/message-templates/${id}`);
  }
}

export const messagesTemplatesService = new MessagesTemplatesService();

export default messagesTemplatesService;
