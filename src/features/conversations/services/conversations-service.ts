import apiClient from "@src/api/axios-instance";
import { adaptApiCommunicationsResponseToConversations } from "@src/api/communications-adapters";
import {
  ApiCommunicationsResponse,
  ApiUpdateCommunicationPayload,
} from "@src/api/types";
import { IConversation } from "@src/shared/types/types";

export class ConversationsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_BASE_API_URL || "https://api.example.com";
  }

  async getAllConversations(): Promise<IConversation[]> {
    try {
      const response = await apiClient.get<ApiCommunicationsResponse>(
        `${this.baseUrl}/api/communications`,
      );
      return adaptApiCommunicationsResponseToConversations(response.data);
    } catch (error) {
      console.error("Error fetching all conversations:", error);
      throw error;
    }
  }

  async getLeadConversations(): Promise<IConversation[]> {
    try {
      const response = await apiClient.get<ApiCommunicationsResponse>(
        `${this.baseUrl}/api/communications/leads`,
      );
      return adaptApiCommunicationsResponseToConversations(response.data);
    } catch (error) {
      console.error("Error fetching lead conversations:", error);
      throw error;
    }
  }

  async getClientConversations(): Promise<IConversation[]> {
    try {
      const response = await apiClient.get<ApiCommunicationsResponse>(
        `${this.baseUrl}/api/communications/clients`,
      );
      return adaptApiCommunicationsResponseToConversations(response.data);
    } catch (error) {
      console.error("Error fetching client conversations:", error);
      throw error;
    }
  }

  async getConversationDetails(
    type: "lead" | "client",
    id: number,
  ): Promise<IConversation> {
    try {
      const placeholderContact = {
        id,
        firstName: "Placeholder",
        lastName: type === "lead" ? "Lead" : "Client",
        avatar: "https://ui-avatars.com/api/?name=P&background=random&length=1",
        email: "",
        lastSeen: new Date(),
      };
      const placeholderConversation: IConversation = {
        id,
        type,
        name: `Conversation ${id}`,
        avatar: placeholderContact.avatar,
        contacts: [placeholderContact],
        messages: [],
        admins: [],
        pinnedMessage: undefined,
        pinnedMessageHidden: false,
        replyMessage: undefined,
        unread: 0,
        draftMessage: "",
      };
      return placeholderConversation;
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      throw error;
    }
  }

  async updateConversationStatus(
    type: "lead" | "client",
    id: number,
    payload: ApiUpdateCommunicationPayload,
  ): Promise<void> {
    try {
      await apiClient.patch(
        `${this.baseUrl}/api/communications/${type}/${id}`,
        payload,
      );
    } catch (error) {
      console.error("Error updating conversation status:", error);
      throw error;
    }
  }
}

export const conversationsService = new ConversationsService();
