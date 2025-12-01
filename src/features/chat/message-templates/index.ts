// Export store
export { useMessagesTemplatesStore } from "./messages-templates-store";

// Export service
export { messagesTemplatesService } from "./messages-templates-service";

// Export types
export type {
  MessageTemplate,
  ApiMessageTemplatesResponse,
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  ApiMessageTemplateResponse,
} from "./types";

// Export components
export { default as TemplateMessagesForm } from "./TemplateMessagesForm.vue";
export { default as TemplateMessagesList } from "./TemplateMessagesList.vue";
