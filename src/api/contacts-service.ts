import apiClient from "./axios-instance";
import type { ApiCommunicationLead } from "./types";
import type { EntityType } from "@src/shared/types/common";

export interface CreateContactRequest {
  fio: string;
  phone: string;
  email: string;
  post_id?: number;
}

export class ContactsService {
  async addContactToEntity(
    entity: EntityType,
    entityId: number,
    contact: CreateContactRequest,
  ): Promise<ApiCommunicationLead> {
    const response = await apiClient.post(
      `/${entity}/${entityId}/contacts`,
      contact,
    );
    return response.data;
  }
}

export const contactsService = new ContactsService();
export default contactsService;
