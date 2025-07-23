import apiClient from "@src/api/axios-instance";

export class CallService {
  async getAudio(
    callId: number,
  ): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      const response = await apiClient.get(`/binotel/${callId}/audio`);
      return response.data;
    } catch (error) {
      console.error("Error fetching call audio:", error);
      throw new Error("Failed to fetch call audio");
    }
  }

  async getTranscription(callId: number): Promise<{
    summary?: string;
    transcription?: string;
    message?: string;
  }> {
    try {
      const response = await apiClient.get(`/calls/${callId}/transcription`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching call transcription:", error);
      throw new Error("Failed to fetch call transcription");
    }
  }
}

export const callService = new CallService();

export default callService;
