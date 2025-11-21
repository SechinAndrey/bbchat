import type { EntityType } from "@src/shared/types/common";

/**
 * A map of all FCM channels and the events they can receive.
 * Structure:
 * EventName -> PayloadType
 */
export interface FCMEventMap {
  "new-message": {
    event: "new-message";
    id: string;
    client_message_uid: string;
    contragent_contact_id: string;
    contragent_id: string;
    contragent_type: EntityType;
    entity_title: string;
    entity_name: string | undefined;
    from_manager: string;
    user_id: number;
  };
}
