import type { Component } from "vue";
import type { ContragentType } from "@src/shared/types/common";

interface AfterSendActivatorConfig {
  showIcon?: boolean;
  showLabel?: boolean;
  showChevron?: boolean;
}

export interface SendMessageModalUiConfig {
  showEntityTypeSelect?: boolean;
  showEntitySelect?: boolean;
  showContactSelect?: boolean;
  showMessengerSelect?: boolean;
  showEmojiButton?: boolean;
  showTemplateButton?: boolean;
  afterSendActivator?: AfterSendActivatorConfig;
}

export interface SendResult {
  contactId: number;
  messengerId: number;
  message: string;
}

export type AfterSendPreset = "redirect-to-chat";

export type AfterSendOption =
  | AfterSendPreset
  | { label: string; icon?: Component; action: () => void };

export interface OpenParams {
  entityType?: ContragentType;
  entityId?: number;
  contactId?: number;
  messengerId?: number;
  messageTemplate?: string;
  ui?: SendMessageModalUiConfig;
  afterSendActivator?: AfterSendActivatorConfig;
  afterSendOptions?: AfterSendOption[];
  defaultAfterSendOption?: AfterSendPreset | number;
  onSent?: (result: SendResult) => void;
  onAfterSendOptionChange?: (option: AfterSendPreset | number) => void;
}
