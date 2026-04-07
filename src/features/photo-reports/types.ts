export type SlotStatus =
  | "modified"
  | "queued"
  | "uploading"
  | "uploaded"
  | "error";

export interface SelectedPhoto {
  url: string;
  thumbnail: string;
  messageId: number;
  file?: File;
  supplier_id?: number | null;
  supplier_name?: string | null;
}

// --- API types ---

export interface ClientContact {
  id: number;
  name: string;
  phone?: string;
}

export type CommunicationChannel = "viber" | "telegram";

export interface ClientSearchResult {
  id: number;
  name: string;
  contacts: ClientContact[];
}

export interface ClientPeriod {
  ym: string;
  label: string;
  boards_count?: number;
  filled_boards_count?: number;
  slots_count?: number | string;
  filled_slots_count?: number | string;
}

export type PhotoSlotType = "design" | "near" | "far" | "night";

export const SLOT_TYPES: readonly PhotoSlotType[] = [
  "near",
  "far",
  "night",
  "design",
] as const;

export const PHOTO_SLOT_LABELS: Record<PhotoSlotType, string> = {
  design: "Макет",
  near: "Ближній",
  far: "Дальній",
  night: "Нічний",
};

export interface BoardPhoto {
  url: string | null;
  path: string | null;
  date: string | null;
}

export interface WorkType {
  id: number;
  name: string;
}

export interface Board {
  photoreport_id: number | null;
  board_id: number;
  contract_board_id: number;
  act_id: number | null;
  board_code: string;
  board_address: string;
  board_city: string | null;
  board_photo: string | null;
  supplier_id: number | null;
  supplier_name: string | null;
  work_id: number | null;
  work_name: string | null;
  photos: Record<PhotoSlotType, BoardPhoto>;
}

export interface BoardSlotChange {
  board_id: number;
  contract_board_id: number;
  photoreport_id: number | null;
  slotType: PhotoSlotType;
  value: File | string;
  photo_url?: string;
  work_id?: number;
}

export interface SaveResponse {
  success: boolean;
  data: {
    updated: number[];
    created: number[];
    report_url: string | null;
  };
}

export interface MessageTemplateResponse {
  message: string;
  report_url: string;
}
