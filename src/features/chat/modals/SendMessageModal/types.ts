import type { ContragentType } from "@src/shared/types/common";

export interface SendMessageModalUiConfig {
  showEntityTypeSelect?: boolean;
  showEntitySelect?: boolean;
  showContactSelect?: boolean;
  showMessengerSelect?: boolean;
  showEmojiButton?: boolean;
  showTemplateButton?: boolean;
}

export interface SendResult {
  contactId: number;
  messengerId: number;
  message: string;
}

export interface OpenParams {
  entityType?: ContragentType;
  entityId?: number;
  contactId?: number;
  messengerId?: number;
  messageTemplate?: string;
  ui?: SendMessageModalUiConfig;
  onSent?: (result: SendResult) => void;
}
