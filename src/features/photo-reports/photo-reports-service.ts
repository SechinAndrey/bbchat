import apiClient from "@src/api/axios-instance";
import type {
  ClientSearchResult,
  ClientPeriod,
  Board,
  SaveResponse,
  MessageTemplateResponse,
  PhotoSlotType,
  CommunicationChannel,
} from "./types";

class PhotoReportsService {
  async searchClients(
    search: string,
    perPage = 20,
    page = 1,
  ): Promise<ClientSearchResult[]> {
    try {
      const response = await apiClient.get<{ data: ClientSearchResult[] }>(
        "/communicator/photoreports/clients",
        { params: { search, per_page: perPage, page } },
      );
      console.log("[photoreports/clients]", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to search clients:", error);
      throw error;
    }
  }

  async getClientPeriods(clientId: number): Promise<ClientPeriod[]> {
    const now = new Date();
    const maxYm =
      String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, "0");
    try {
      const response = await apiClient.get<{ data: ClientPeriod[] }>(
        "/communicator/photoreports/periods",
        { params: { client_id: clientId, max_ym: maxYm } },
      );
      const data = response.data.data.map((p) => ({ ...p, ym: String(p.ym) }));
      console.log("[photoreports/periods]", data);
      return data;
    } catch (error) {
      console.error("❌ Failed to load periods:", error);
      throw error;
    }
  }

  async getBoards(
    clientId: number,
    ym: string,
    supplierId?: number,
  ): Promise<Board[]> {
    try {
      const params: Record<string, unknown> = {
        client_id: clientId,
        ym,
        per_page: 100,
      };
      if (supplierId !== undefined) {
        params.supplier_id = supplierId;
      }
      const response = await apiClient.get<{ data: Board[] }>(
        "/communicator/photoreports/boards",
        { params },
      );
      console.log("[photoreports/boards]", response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to load boards:", error);
      throw error;
    }
  }

  async savePhoto(params: {
    photoreport_id?: number;
    contract_board_id?: number;
    ym?: string;
    slotType: PhotoSlotType;
    value: File | string;
    sendToClient?: { contact_id: number; channel: CommunicationChannel };
  }): Promise<SaveResponse> {
    const formData = new FormData();

    if (params.photoreport_id) {
      formData.append(
        "reports[0][photoreport_id]",
        String(params.photoreport_id),
      );
    } else {
      formData.append(
        "reports[0][contract_board_id]",
        String(params.contract_board_id),
      );
      formData.append("reports[0][ym]", params.ym!);
    }

    const fieldName = `reports[0][photo_${params.slotType}]`;
    if (params.value instanceof File) {
      formData.append(fieldName, params.value);
    } else {
      formData.append(fieldName, params.value);
    }

    if (params.sendToClient) {
      formData.append(
        "send_to_client[contact_id]",
        String(params.sendToClient.contact_id),
      );
      formData.append("send_to_client[channel]", params.sendToClient.channel);
    }

    try {
      const response = await apiClient.post<SaveResponse>(
        "/communicator/photoreports/save",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to save photo:", error);
      throw error;
    }
  }

  async getMessageTemplate(
    clientId: number,
    ym: string,
  ): Promise<MessageTemplateResponse> {
    try {
      const response = await apiClient.get<MessageTemplateResponse>(
        "/communicator/photoreports/message-template",
        { params: { client_id: clientId, ym } },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get message template:", error);
      throw error;
    }
  }
}

const photoReportsService = new PhotoReportsService();
export default photoReportsService;
