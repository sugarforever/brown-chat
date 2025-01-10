export interface ChatMessage {
  content: string;
  role: 'assistant' | 'system' | 'tool';
}
