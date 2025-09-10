import apiClient from "@src/api/axios-instance";
import type { AxiosResponse } from "axios";

export type LeadActionType = "client" | "supplier" | "manager" | "lead";

export interface MergeWithLeadRequest {
  new_lead_id: number | string;
}

export interface MergeWithClientRequest {
  client_id: number | string;
}

export interface MergeWithSupplierRequest {
  client_id: number | string;
}

export interface ChangeManagerRequest {
  user_id: number | string;
}

export class LeadActionsService {
  /**
   * Get URL for lead action based on action type and lead ID
   */
  getActionUrl(actionType: LeadActionType, leadId: number | string): string {
    switch (actionType) {
      case "lead":
        return `/leads/${leadId}/merge-with-lead`;
      case "client":
        return `/leads/${leadId}/merge-with-client`;
      case "supplier":
        return `/leads/${leadId}/merge-with-supplier`;
      case "manager":
        return `/leads/${leadId}/change-manager`;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Merge lead with another lead
   */
  async mergeWithLead(
    leadId: number | string,
    new_lead_id: number | string,
  ): Promise<AxiosResponse> {
    const response = await apiClient.post(this.getActionUrl("lead", leadId), {
      new_lead_id,
    });
    return response;
  }

  /**
   * Merge lead with client
   */
  async mergeWithClient(
    leadId: number | string,
    client_id: number | string,
  ): Promise<AxiosResponse> {
    const response = await apiClient.post(this.getActionUrl("client", leadId), {
      client_id,
    });
    return response;
  }

  /**
   * Merge lead with supplier
   */
  async mergeWithSupplier(
    leadId: number | string,
    client_id: number | string,
  ): Promise<AxiosResponse> {
    const response = await apiClient.post(
      this.getActionUrl("supplier", leadId),
      {
        client_id,
      },
    );
    return response;
  }

  /**
   * Change lead manager
   */
  async changeManager(
    leadId: number | string,
    user_id: number | string,
  ): Promise<AxiosResponse> {
    const response = await apiClient.post(
      this.getActionUrl("manager", leadId),
      {
        user_id,
      },
    );
    return response;
  }

  /**
   * Universal method to execute any lead action
   */
  async executeAction(
    actionType: LeadActionType,
    leadId: number | string,
    targetId: number | string,
  ): Promise<AxiosResponse> {
    switch (actionType) {
      case "lead":
        return this.mergeWithLead(leadId, targetId);
      case "client":
        return this.mergeWithClient(leadId, targetId);
      case "supplier":
        return this.mergeWithSupplier(leadId, targetId);
      case "manager":
        return this.changeManager(leadId, targetId);
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }
}

export const leadActionsService = new LeadActionsService();

export default leadActionsService;
