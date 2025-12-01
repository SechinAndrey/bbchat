export interface MessageTemplate {
  id: number;
  text: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiMessageTemplatesResponse {
  data: MessageTemplate[];
}

export interface CreateMessageTemplateRequest {
  text: string;
}

export interface UpdateMessageTemplateRequest {
  text: string;
}

export interface ApiMessageTemplateResponse {
  data: MessageTemplate;
}
