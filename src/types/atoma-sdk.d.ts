declare module 'atoma-sdk' {
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  export class AtomaSDK {
    constructor(config: { 
      bearerAuth: string;
      serverURL: string;
    });

    chat: {
      create(params: {
        messages: ChatMessage[];
        model: string;
        temperature?: number;
        max_tokens?: number;
      }): Promise<ChatResponse>;
    };
  }
} 