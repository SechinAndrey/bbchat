import type { ContragentType } from "@src/shared/types/common";

/**
 * A map of all Pusher channels and the events they can receive.
 * Structure:
 * ChannelName -> EventName -> PayloadType
 */
export interface PusherEventMap {
  "e-chat-notification": {
    "new-message": {
      /** message ID */
      id: number;
      /** contact ID */
      contragent_contact_id: number | null;
      /** entity ID */
      contragent_id: number | null;
      /** contragent type: lead, client, supplier (singular form from backend) */
      contragent_type: ContragentType | null;
      /** target user ID */
      user_id: number;
    };
    "message-read-by-contact": {
      /** message ID (can be array from backend) */
      id: number | number[];
    };
    "message-deleted": {
      /** message ID */
      id: number;
    };
    "lead-merged-by-chaport-messages": {
      contact_updated: {
        entity: "lead" | "client" | "supplier";
        id: number;
        contact_id: number;
      };
      merge_info: {
        entity: "lead" | "client" | "supplier";
        id: number;
        from_lead_id: number;
        contacts_ids: number[];
      };
    };
    "lead-change-user": {
      contragent_type: "lead" | "client" | "supplier";
      contragent_id: number;
      current_user: number;
    };
    "message-liked": {
      id: [number];
    };
  };

  // "another-channel": {
  //   "some-event": { someData: string };
  // };
}
