export interface MessageTemplate {
  id: number;
  text: string;
  created_at?: string;
  updated_at?: string;
  category_id?: number;
  category_name?: string;
  disable_delete?: boolean;
}

export interface ApiMessageTemplatesResponse {
  data: MessageTemplate[];
}

export interface CreateMessageTemplateRequest {
  category_id: number;
  message: string;
}

export interface UpdateMessageTemplateRequest {
  category_id: number;
  message: string;
}

export interface CreateMessageCategoryRequest {
  name: string;
}

export interface ApiMessageTemplateResponse {
  data: MessageTemplate; // This might need to be ApiDefaultMessage if we don't map it in service
}
