/**
 * API service using axios
 */

import { AxiosRequestConfig } from "axios";
import apiClient, { setAuthToken } from "@src/api/axios-instance";
import type {
  ApiUser,
  ApiRoom,
  ApiMessage,
  ApiMessengers,
  ApiNotification,
  ApiCall,
} from "./types";
import { adaptApiDataToUI } from "./adapters";
import mockData from "@src/shared/store/real-api-example";

/**
 * Use mock data until real API is ready
 */
export class ChatApiService {
  private baseUrl: string;
  private currentUserId: number | string;
  private authToken: string | null = null;

  constructor(currentUserId = "262") {
    this.baseUrl =
      import.meta.env.VITE_BASE_API_URL || "https://api.example.com";
    this.currentUserId = currentUserId;
  }

  /**
   * Sets authorization token for use in requests
   * @param token Authorization token
   */
  setAuthToken(token: string): void {
    this.authToken = token;

    setAuthToken(token);
  }

  /**
   * Gets configuration for axios requests, including authorization header if available
   * @returns axios request config
   */
  private getRequestConfig(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};

    if (this.authToken) {
      config.headers = {
        Authorization: `Bearer ${this.authToken}`,
      };
    }

    return config;
  }

  /**
   * Gets information about the current user
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<ApiUser> {
    try {
      const response = await apiClient.get("/api/sanctum/user");
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);

      // Fallback to mock data if API fails
      return mockData.apiData.user;
    }
  }

  /**
   * Gets the list of user's rooms
   * @returns Promise with the list of rooms
   */
  async getRooms(): Promise<ApiRoom[]> {
    // In a real API this would use apiClient
    // try {
    //   const response = await apiClient.get('/api/rooms');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching rooms:', error);
    //   throw error;
    // }

    // Return mock data
    return Promise.resolve(mockData.apiData.rooms);
  }

  /**
   * Gets messages for a room
   * @param roomId Room ID
   * @returns Promise with the list of messages
   */
  async getMessages(roomId?: number): Promise<ApiMessage[]> {
    // In a real API this would use apiClient
    // try {
    //   const url = roomId ? `/api/messages?roomId=${roomId}` : '/api/messages';
    //   const response = await apiClient.get(url);
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching messages:', error);
    //   throw error;
    // }

    // Return mock data
    let messages = mockData.apiData.messages;

    // If room ID is specified, filter messages
    if (roomId) {
      messages = messages.filter((msg) => msg.roomId === roomId);
    }

    return Promise.resolve(messages);
  }

  /**
   * Gets the list of available messengers
   * @returns Promise with the list of messengers
   */
  async getMessengers(): Promise<ApiMessengers> {
    // In a real API this would use apiClient
    // try {
    //   const response = await apiClient.get('/api/messengers');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching messengers:', error);
    //   throw error;
    // }

    // Return mock data
    return Promise.resolve(mockData.apiData.messengers);
  }

  /**
   * Gets the list of user notifications
   * @returns Promise with the list of notifications
   */
  async getNotifications(): Promise<ApiNotification[]> {
    // In a real API this would use apiClient
    // try {
    //   const response = await apiClient.get('/api/notifications');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching notifications:', error);
    //   throw error;
    // }

    // Return mock data
    return Promise.resolve(mockData.apiData.notifications);
  }

  /**
   * Gets the user's call history
   * @returns Promise with the list of calls
   */
  async getCalls(): Promise<ApiCall[]> {
    // In a real API this would use apiClient
    // try {
    //   const response = await apiClient.get('/api/calls');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching calls:', error);
    //   throw error;
    // }

    // Return mock data
    return Promise.resolve(mockData.apiData.calls);
  }

  /**
   * Gets information about the current active call, if any
   * @returns Promise with call information or undefined
   */
  async getActiveCall(): Promise<ApiCall | undefined> {
    // In a real API this would use apiClient
    // try {
    //   const response = await apiClient.get('/api/calls/active');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching active call:', error);
    //   return null;
    // }

    // Return mock data (can be undefined if there's no active call)
    return Promise.resolve(mockData.apiData.activeCall || undefined);
  }

  /**
   * Gets all data required for the application to work
   * @returns Promise with application data in UI format
   */
  async getAllData() {
    try {
      // Get data in parallel to speed up loading
      const [user, rooms, messages, notifications, calls, activeCall] =
        await Promise.all([
          this.getCurrentUser(),
          this.getRooms(),
          this.getMessages(),
          this.getNotifications(),
          this.getCalls(),
          this.getActiveCall(),
        ]);

      // Convert API data to UI format
      const adaptedData = adaptApiDataToUI(
        { user, rooms, messages, notifications, calls, activeCall },
        this.currentUserId,
      );

      return adaptedData;
    } catch (error) {
      console.error("Error getting data:", error);
      throw error;
    }
  }

  /**
   * Sends a message
   * @param roomId Room ID
   * @param content Message text
   * @param files Attached files
   * @returns Promise with the sent message
   */
  async sendMessage(
    roomId: number,
    content: string,
    files: File[] = [],
  ): Promise<ApiMessage> {
    // In a real API this would use apiClient
    // try {
    //   const formData = new FormData();
    //   formData.append('roomId', roomId.toString());
    //   formData.append('content', content);
    //   files.forEach(file => formData.append('files', file));
    //
    //   const response = await apiClient.post('/api/messages', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    //   return response.data;
    // } catch (error) {
    //   console.error('Error sending message:', error);
    //   throw error;
    // }

    // mock message
    const newMessage: ApiMessage = {
      _id: Date.now(),
      roomId,
      content,
      senderId: this.currentUserId.toString(),
      username: mockData.apiData.user.name,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      files: files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.split("/")[1] || "file",
        audio: file.type.includes("audio"),
        size: `${Math.round(file.size / 1024)} KB`,
      })),
      state: "sent",
    };

    return Promise.resolve(newMessage);
  }
}

export const chatApiService = new ChatApiService();

export default chatApiService;
