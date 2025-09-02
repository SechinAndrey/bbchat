import apiClient from "./axios-instance";
import type { ApiContact } from "./types";

export interface CreateContactRequest {
  fio: string;
  phone: string;
  email: string;
}

export interface CreateContactResponse {
  success: boolean;
  data: ApiContact;
}

export class ContactsService {
  /**
   * Add contact to client
   */
  async addContactToClient(
    clientId: number,
    contact: CreateContactRequest,
  ): Promise<CreateContactResponse> {
    const response = await apiClient.post(
      `/clients/${clientId}/contacts`,
      contact,
    );
    return response.data;
  }

  /**
   * Add contact to lead
   */
  async addContactToLead(
    leadId: number,
    contact: CreateContactRequest,
  ): Promise<CreateContactResponse> {
    const response = await apiClient.post(`/leads/${leadId}/contacts`, contact);
    return response.data;
  }
}

export const contactsService = new ContactsService();
export default contactsService;
