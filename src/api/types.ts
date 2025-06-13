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

// ************************************
// 01.06.20256 - new api endpoints
// ************************************

// Base type for Lead and Client
export interface ApiLeadClientBase {
  id: number;
  user_id: number;
  name: string;
  fio: string | null;
  email: string | null;
  phone: string | null;
  tg_name: string | null;
  communication_status_id: number;
  /**
   * TODO:
   * - add avatar
   */
}

// Lead type
export interface ApiLead extends ApiLeadClientBase {
  visible: boolean | string; // In api it's 0 or 1
  status_id: number;
  city?: string | null; // e.g., "[56]"
  channel?: string | null;
  source?: string | null;
  social?: string | null;
  from_form?: number;
  have_supervision?: number;
  comment?: string | null;
  messages?: string | null; // HTML string
  info?: string | null; // JSON string
  utm?: string | null;
  utm_channel?: string | null;
  ga_client_id?: string | null;
  jivo_number?: string | number | null;
  binotel_id?: string | number | null;
  helpcrunch_id?: string | null;
  chaport_id?: string | null;
  call_me_datetime?: string | null;
  rejection_id?: number | null;
  rejection_reason_id?: number | null;
  excluded_from_statistics_date?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  class_id?: number | null;
  key_call_attempt_count?: number;
  last_key_call_attempt_at?: string | null;
}

// Client type
export interface ApiClient extends ApiLeadClientBase {
  class_id?: number | null;
  actual_class_id?: number | null;
  city?: string | null; // e.g., "[\"19\"]"
  channel?: string | null;
  source?: string | null;
  social?: string | null;
  from_form?: number;
  contact_person?: number | null;
  comment?: string | null;
  messages?: string | null; // HTML string
  info?: string | null; // JSON string
  utm?: string | null;
  utm_channel?: string | null;
  ga_client_id?: string | null;
  jivo_number?: string | null;
  binotel_id?: string | null;
  helpcrunch_id?: string | null;
  chaport_id?: string | null;
  logo?: string | null;
  site?: string | null;
  folder_id?: string | null;
  verify?: number;
  active?: number;
  available_bill_without_contract?: number;
  lead_id?: number | null;
  lead_created_at?: string | null;
  converted_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Generic paginated response type
export interface ApiPaginatedResponse<T> {
  path: string;
  current_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number;
  to: number;
  per_page: number;
  total: number;
  data: T[];
}

// Type for GET /api/communications response
export interface ApiCommunicationsResponse {
  leads: ApiPaginatedResponse<ApiLead> | null;
  clients: ApiPaginatedResponse<ApiClient> | null;
}

// Type for GET /api/communications/leads response
export interface ApiLeadsResponse {
  leads: ApiPaginatedResponse<ApiLead> | null;
  clients: null; // Or 'Unknown Type: null' if that's a literal string
}

// Type for GET /api/communications/clients response
export interface ApiClientsResponse {
  leads: null; // Or 'Unknown Type: null'
  clients: ApiPaginatedResponse<ApiClient> | null;
}

// Type for the 'type' object within ApiCommunicationDetail
export interface ApiCommunicationType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Type for the 'user' object within ApiCommunicationDetail
export interface ApiCommunicationUser {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
}

// Type for the 'call' object within ApiCommunicationDetail
export interface ApiCommunicationCall {
  id: number;
  binotel_id: number; // Assuming this is a number based on context
  user_id: number;
  phone: string;
  call_type: number;
  waitsec: number;
  billsec: number;
  disposition: string;
  created_at: string;
}

// Type for the 'chaport_messages' object within ApiCommunicationDetail
export interface ApiCommunicationChaportMessage {
  id: number;
  type_id: number;
  user_id: number;
  name: string;
  message: string;
  created_at: string;
  updated_at?: string;
}

// Type for an item in the data array of GET /api/communications/{type}/{id}
export interface ApiCommunicationDetail {
  id: number;
  type_id: number;
  user_id: number;
  lead_id: number | null;
  client_id: number | null;
  chaport_message_id: number | null;
  call_id: number | null;
  echat_message_id: null;
  created_at: string;
  lead: ApiLead | null;
  client: ApiClient | null;
  type: ApiCommunicationType;
  user: ApiCommunicationUser | null;
  call: ApiCommunicationCall | null;
  chaport_messages: ApiCommunicationChaportMessage | null;
}

// Type for GET /api/communications/{type}/{id} response
export type ApiCommunicationDetailResponse =
  ApiPaginatedResponse<ApiCommunicationDetail>;

// Type for PATCH /api/communications/{type}/{id} request payload
export interface ApiUpdateCommunicationPayload {
  communication_status_id: number;
}
