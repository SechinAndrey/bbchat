import apiClient from "./axios-instance";
import type { ApiCommunicationLead } from "./types";
import type { EntityType } from "@src/shared/types/common";

export interface CreateContactRequest {
  fio: string;
  phone?: string;
  email?: string;
  tg_name?: string;
  post_id?: number;
}

export interface UpdateContactRequest {
  fio?: string;
  phone?: string;
  email?: string;
  tg_name?: string;
  post_id?: number | string;
  communication_status_id?: number;
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

  async updateContact(
    entity: EntityType,
    entityId: number,
    contactId: number,
    contact: UpdateContactRequest,
  ): Promise<ApiCommunicationLead> {
    const response = await apiClient.patch(
      `/${entity}/${entityId}/contacts/${contactId}`,
      contact,
    );
    return response.data;
  }

  async deleteContact(
    entity: EntityType,
    entityId: number,
    contactId: number,
  ): Promise<void> {
    await apiClient.delete(`/${entity}/${entityId}/contacts/${contactId}`);
  }
}

export const contactsService = new ContactsService();
export default contactsService;
