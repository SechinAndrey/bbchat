import type { EntityType } from "@src/shared/types/common";

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
      /** entity type: leads, clients, suppliers */
      contragent_type: EntityType | null;
    };
  };

  // "another-channel": {
  //   "some-event": { someData: string };
  // };
}
