/**
 * API types based on real API responses
 */

// API user type
export interface ApiUser {
  id: number;
  role_id: number;
  name: string;
  email: string;
  email_key: string | null;
  type_reg: string | null;
  company: string | null;
  inn: string | null;
  nds: string | null;
  phone: string | null;
  avatar: string;
  email_verified_at: string | null;
  settings: {
    locale: string;
  };
  folder_id: string;
  created_at: string;
  updated_at: string;
}

// Room user type
export interface ApiRoomUser {
  _id: string;
  username: string;
}

// Room/conversation type
export interface ApiRoom {
  roomId: number;
  roomName: string;
  avatar: string;
  receiver: string;
  messenger_id: number;
  users: ApiRoomUser[];

  /* BACKEND: unread - number of unread messages */
  unread?: number;
  /* BACKEND: pinnedMessage - pinned message */
  pinnedMessage?: ApiMessage;
  /* BACKEND: type - room type (couple, group, broadcast) */
  type?: string;
  /* BACKEND: lastActivity - time of last activity in the room */
  lastActivity?: string;
  /* BACKEND: adminIds - room administrators ids */
  adminIds?: number[];
}

// Message file type
export interface ApiMessageFile {
  name: string;
  url: string;
  type: string;
  audio: boolean;

  /* BACKEND: size - file size */
  size?: string;
  /* BACKEND: thumbnail - video preview */
  thumbnail?: string;
}

// Message type
export interface ApiMessage {
  _id: number;
  roomId: number;
  content: string;
  senderId: string;
  username: string;
  date: string;
  timestamp: string;
  files: ApiMessageFile[];

  /* BACKEND: state - message status (sent, delivered, read) */
  state?: string;
  /* BACKEND: replyTo - ID of the message being replied to */
  replyTo?: number;
  /* BACKEND: previewData - preview for links */
  previewData?: {
    title: string;
    image?: string;
    description: string;
    domain: string;
    link: string;
  };
}

// Messenger type
export interface ApiMessengers {
  [key: string]: number;
}

// Interface for conversation recording (voice message)
export interface ApiRecording {
  id: number;
  size: string;
  src: string;
  duration: string;
}

// Interface for notification
export interface ApiNotification {
  /* BACKEND: flag - notification type (security, account-update, added-to-group, etc.) */
  flag: string;
  /* BACKEND: title - notification title */
  title: string;
  /* BACKEND: message - notification text */
  message: string;
}

// Interface for call
export interface ApiCall {
  /* BACKEND: type - call type (voice, video) */
  type: string;
  /* BACKEND: direction - call direction (incoming, outgoing) */
  direction: string;
  /* BACKEND: status - call status (missed, received, sent, dialing, ongoing) */
  status: string;
  /* BACKEND: date - call date */
  date: string;
  /* BACKEND: length - call duration */
  length: string;
  /* BACKEND: members - call participants */
  members: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    lastSeen: Date;
  }[];
  /* BACKEND: adminIds - call administrators IDs */
  adminIds: number[];
}

// Types of possible API responses
export interface ApiResponses {
  user: ApiUser;
  rooms: ApiRoom[];
  messages: ApiMessage[];
  messengers: ApiMessengers;
  contacts: ApiRoomUser[]; // Assuming that contacts API will have the same structure as room users
  /* BACKEND: notifications - notifications */
  notifications?: ApiNotification[];
  /* BACKEND: calls - calls */
  calls?: ApiCall[];
  /* BACKEND: activeCall - current active call */
  activeCall?: ApiCall;
}
