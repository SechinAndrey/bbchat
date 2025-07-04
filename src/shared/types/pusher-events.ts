import type { ApiMessageItem } from "@src/api/types";

/**
 * A map of all Pusher channels and the events they can receive.
 * Structure:
 * ChannelName -> EventName -> PayloadType
 */
export interface PusherEventMap {
  "e-chat-notification": {
    "new-message": ApiMessageItem;
  };

  // "another-channel": {
  //   "some-event": { someData: string };
  // };
}
