import apiClient from "@src/api/axios-instance";
import type {
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  CreateMessageCategoryRequest,
} from "./types";
import type {
  ApiDefaultMessage,
  ApiDefaultMessageCategory,
} from "@src/api/types";

export class MessagesTemplatesService {
  /**
   * Create a new message category
   * @param data - Category data
   */
  async createCategory(
    data: CreateMessageCategoryRequest,
  ): Promise<ApiDefaultMessageCategory> {
    const response = await apiClient.post("/default-messages/category", data);
    return response.data;
  }

  /**
   * Create a new message template
   * @param data - Template data
   * @returns Promise with created template
   */
  async createTemplate(
    data: CreateMessageTemplateRequest,
  ): Promise<ApiDefaultMessage> {
    const response = await apiClient.post("/default-messages", data);
    return response.data;
  }

  /**
   * Update an existing message template
   * @param id - Template ID
   * @param data - Updated data
   */
  async updateTemplate(
    id: number,
    data: UpdateMessageTemplateRequest,
  ): Promise<ApiDefaultMessage> {
    const response = await apiClient.patch(`/default-messages/${id}`, data);
    return response.data;
  }

  /**
   * Delete a message template
   * @param id - Template ID
   */
  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/default-messages/${id}`);
  }
}

export const messagesTemplatesService = new MessagesTemplatesService();

export default messagesTemplatesService;
