import apiClient from "@src/api/axios-instance";
import type { ApiCommunicationResponse } from "@src/api/types";

/**
 * Service for managing conversations/communications
 */
export class ConversationsService {
  /**
   * Get all communications (leads and clients) for current user
   * @returns Promise with communications data
   */
  async getCommunications(): Promise<ApiCommunicationResponse> {
    try {
      const response =
        await apiClient.get<ApiCommunicationResponse>("/communications");
      return response.data;
    } catch (error) {
      console.error("Error fetching communications:", error);
      throw new Error("Failed to fetch communications");
    }
  }

  /**
   * Send message to lead or client
   * @param data - Message data
   * @returns Promise with success status
   */
  async sendMessage(data: {
    contragent_id: number;
    contragent_type: "lead" | "client";
    message: string;
    type?: string;
  }): Promise<boolean> {
    try {
      await apiClient.post("/communications/messages", data);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  /**
   * Update draft message
   * @param contragentId - Lead or client ID
   * @param contragentType - Type: "lead" or "client"
   * @param draftMessage - Draft message text
   * @returns Promise<void>
   */
  async updateDraftMessage(
    contragentId: number,
    contragentType: "lead" | "client",
    draftMessage: string,
  ): Promise<void> {
    try {
      await apiClient.put(
        `/communications/${contragentType}s/${contragentId}/draft`,
        {
          draftMessage,
        },
      );
    } catch (error) {
      console.error("Error updating draft message:", error);
      throw new Error("Failed to update draft message");
    }
  }

  /**
   * Pin message in conversation
   * @param messageId - Message ID
   * @returns Promise<void>
   */
  async pinMessage(messageId: number): Promise<void> {
    try {
      await apiClient.put(`/communications/messages/${messageId}/pin`);
    } catch (error) {
      console.error("Error pinning message:", error);
      throw new Error("Failed to pin message");
    }
  }

  /**
   * Unpin message in conversation
   * @param messageId - Message ID
   * @returns Promise<void>
   */
  async unpinMessage(messageId: number): Promise<void> {
    try {
      await apiClient.delete(`/communications/messages/${messageId}/pin`);
    } catch (error) {
      console.error("Error unpinning message:", error);
      throw new Error("Failed to unpin message");
    }
  }
}

export const conversationsService = new ConversationsService();

export default conversationsService;
