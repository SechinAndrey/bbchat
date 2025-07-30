import { EntityType } from "@src/shared/types/common";

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

//---------------------------------------------
// New typesf for 16.07.2025 api version
//---------------------------------------------

export interface ApiMessageType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiMessageContent {
  id: number;
  type_id: number;
  user_id: number;
  current_lead_id: number;
  original_lead_id: number;
  current_client_id: number | null;
  original_client_id: number | null;
  name: string;
  message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiMessageContentBinotel {
  id: number;
  binotel_id?: number | null;
  contragent_id: number;
  contragent_type: string;
  contact_id: number | null;
  user_id: number;
  phone: string | null;
  call_type?: number | null; // 0 - incoming, 1 - outgoing
  is_new: number;
  waitsec: number;
  billsec: number;
  disposition: string | null;
  link: string | null;
  transcription_status_id: number;
  created_at: string;
  updated_at: string;
  transcription?: unknown;
}

export interface ApiCommunicationMessage {
  id: number;
  type: ApiMessageType;
  content: ApiMessageContent | ApiMessageContentBinotel;
  date: string;
  lead_id: number;
  client_id: number | null;
  user_id: number;
  replyTo: number | null;
  previewData: unknown;
  attachments: unknown;
  state: string;
}

export interface ApiChaportMessage {
  id: number;
  type_id: number;
  user_id: number;
  name: string;
  message: string;
  created_at: string;
}

export interface ApiEChatMessage {
  id: number;
  created_at: string;
  dialog: {
    id: number;
    messenger_id: number;
  };
  dialog_id: number;
  direction: number;
  message: string;
  message_date_time: string;
  message_id: string;
  message_json: string;
  message_telegram_id: string;
  number: string;
  sender_id: string;
  sender_json: string;
  sender_number: string;
  updated_at: string;
}

export interface ApiMessageItemUser {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  firstName: string;
  lastName: string;
  lastSeen: string;
}

export interface ApiMessageItem {
  id: number;
  type_id: number;
  user_id: number;
  lead_id: number | null;
  client_id: number | null;
  chaport_message_id: number | null;
  call_id: number | null;
  echat_message_id: number | null;
  created_at: string;
  lead: ApiCommunicationLead | null;
  client: ApiCommunicationClient | null;
  type: ApiMessageType;
  user: ApiMessageItemUser;
  call: ApiCommunicationCallInfo | null;
  chaport_messages: ApiChaportMessage | null;
  echat_messages: ApiEChatMessage | null;
}

// Communication lead and client types
export interface ApiContact {
  id: number;
  name: string;
  fio: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  tg_name: string | null;
  lastSeen: string | null;
}

export interface ApiCommunicationLead {
  id: number;
  user_id: number;
  name: string;
  entity: EntityType;
  fio: string | null;
  avatar: string | null;
  contacts: ApiContact[];
  class_id: number | null;
  email: string | null;
  phone: string | null;
  tg_name: string | null;
  visible: number | null;
  communication_status_id: number;
  type: string | null;
  messages: ApiMessageItem[] | null;
  pinnedMessage: ApiMessageItem | null;
  pinnedMessageHidden: boolean | null;
  replyMessage: ApiMessageItem | null;
  unread: number;
  draftMessage: string;
}

export interface ApiCommunicationClient {
  id: number;
  user_id: number;
  entity: EntityType;
  name: string;
  fio: string | null;
  u0437: string | null;
  avatar: string | null;
  class_id: number | null;
  actual_class_id: number | null;
  contacts: ApiContact[];
  email: string | null;
  phone: string | null;
  tg_name: string | null;
  visible: number | null;
  communication_status_id: number | null;
  type: string | null;
  messages: ApiMessageItem[] | null;
  pinnedMessage: ApiMessageItem | null;
  pinnedMessageHidden: boolean | null;
  replyMessage: ApiMessageItem | null;
  unread: number;
  draftMessage: string | null;
}

export interface ApiResponseLinks {
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
}

export interface ApiResponseMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface ApiCommunicationResponse {
  leads: {
    data: ApiCommunicationLead[];
    links: ApiResponseLinks;
    meta: ApiResponseMeta;
  };
  clients: {
    data: ApiCommunicationClient[];
    links: ApiResponseLinks;
    meta: ApiResponseMeta;
  };
}

export interface ApiCommunicationLeadsResponse {
  leads: {
    data: ApiCommunicationLead[];
    links: ApiResponseLinks;
    meta: ApiResponseMeta;
  };
  clients: null;
}

export interface ApiCommunicationClientsResponse {
  clients: {
    data: ApiCommunicationClient[];
    links: ApiResponseLinks;
    meta: ApiResponseMeta;
  };
  leads: null;
}

// -----------------

export interface ApiCommunicationCity {
  id: number;
  name: string;
  name_ua: string;
  name_new: string;
  name_new_ua: string;
}

export interface ApiCommunicationCallInfo {
  id: number;
  binotel_id: number;
  user_id: number;
  phone: string;
  call_type: number;
  waitsec: number;
  billsec: number;
  disposition: string;
  created_at: string;
}

export interface ApiCommunicationStatusLogUser {
  id: number;
  role_id: number;
  name: string;
  email: string;
}

export interface ApiCommunicationStatusLogItem {
  id: number;
  lead_id: number;
  user_id: number;
  old_status_id: number;
  new_status_id: number;
  rejection_id: number | null;
  rejection_reason_id: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  old_status: ApiKanbanStatus;
  new_status: ApiKanbanStatus;
  user: ApiCommunicationStatusLogUser;
}

export interface ApiCommunicationLeadFull {
  id: number;
  user_id: number;
  type: string;
  avatar: string | null;
  name: string;
  entity: EntityType;
  fio: string | null;
  email: string | null;
  phone: string | null;
  tg_name: string | null;
  cities: ApiCommunicationCity[];
  contacts: ApiContact[];
  channel: string | null;
  source: string | null;
  social: string | null;
  from_form: number | null;
  have_supervision: number | null;
  comment: string | null;
  messages: ApiMessageItem[];
  replyMessage: ApiMessage | null;
  calls: ApiCommunicationCallInfo[];
  info: unknown;
  utm: unknown;
  utm_channel: unknown;
  ga_client_id: unknown;
  jivo_number: unknown;
  binotel_id: unknown;
  helpcrunch_id: unknown;
  chaport_id: unknown;
  visible: number | null;
  status_id: number | null;
  communication_status_id: number | null;
  call_me_datetime: string | null;
  rejection_id: number | null;
  rejection_reason_id: number | null;
  excluded_from_statistics_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  class_id: number | null;
  key_call_attempt_count: number | null;
  last_key_call_attempt_at: string | null;
  status_log: ApiCommunicationStatusLogItem[];
}

// eslint-disable-next-line
export interface ApiCommunicationClientFull extends ApiCommunicationLeadFull {}

export interface ApiMessageFull {
  id: number;
  type_id: number;
  user_id: number;
  lead_id: number;
  client_id: number | null;
  chaport_message_id: number | null;
  call_id: number | null;
  echat_message_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lead: ApiCommunicationLeadFull | null;
  client: ApiCommunicationClientFull | null;
  type: ApiMessageType;
  user: {
    id: number;
    role_id: number;
    name: string;
    email: string;
    email_key: string | null;
    type_reg: string | null;
    company: string | null;
    inn: string | null;
    nds: string | null;
    phone: string;
    avatar: string;
    email_verified_at: string | null;
    settings: {
      locale: string;
    };
    folder_id: string;
    created_at: string;
    updated_at: string;
  };
  chaport_messages?: unknown;
  call?: ApiMessageContentBinotel;
}

// Global data
export interface ApiKanbanStatus {
  id: number;
  name: string;
  for_hunters: boolean;
  for_all: boolean;
  avaliable_statuses: string;
}

export interface ApiManagerListItem {
  id: number;
  name: string;
  role_id: number;
}

export interface ApiGlobalDataResponse {
  users: ApiManagerListItem[];
  usersForClients: ApiManagerListItem[];
  kanbanStatuses: ApiKanbanStatus[];
  cities: ApiCommunicationCity[];
}

// --- selections ---

export interface ApiSelectionType {
  id: number;
  name: string;
}

export interface ApiSelectionManager {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ApiSelectionItem {
  code: string;
  id: number;
  firm_name: number;
  side_type: string;
  type: string;
  format: string;
  addr: string;
  image: string;
  scheme: string;
  light: number;
  trassa: number;
  aleas: string;
  price: number;
  active: boolean;
  updated_at: string;
  city_name: string;
  title: string;
  selling_price: number | null;
  buying_price: number | null;
  printing_price: number | null;
  selectionTypeId: number;
  isWatched: boolean;
}

export interface ApiSelection {
  id: number;
  type: ApiSelectionType;
  created_at: string;
  manager: ApiSelectionManager | null;
  boards_count: number;
  boards_list: ApiSelectionItem[];
}

export interface ApiMessagesResponse {
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
  data: ApiMessageItem[];
}

export interface CreateLeadRequest {
  name: string;
  fio: string;
  email?: string;
  phone?: string;
  tg_name?: string;
  city: number[];
  comment?: string;
  status_id: number;
}
