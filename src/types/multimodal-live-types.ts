import { Content, FunctionResponse, GenerationConfig, GenerativeContentBlob, Part, Tool } from "@google/generative-ai"

export interface StreamingLog {
  date: Date
  type: string
  message: string | object
}

export type LiveGenerationConfig = GenerationConfig & {
  responseModalities: "text" | "audio" | "image";
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | string;
      };
    };
  };
};

export type LiveConfig = {
  model: string;
  systemInstruction?: { parts: Part[] };
  generationConfig?: Partial<LiveGenerationConfig>;
  tools?: Array<Tool | { googleSearch: {} } | { codeExecution: {} }>;
};

export interface SetupMessage {
  setup: LiveConfig
}

export interface RealtimeInputMessage {
  realtimeInput: {
    mediaChunks: GenerativeContentBlob[]
  }
}

export interface ClientContentMessage {
  clientContent: {
    turns: Content[]
    turnComplete: boolean
  }
}

export interface ModelTurn {
  modelTurn: {
    parts: Part[]
  }
}

export interface ServerContent {
  interrupted?: boolean
  end_of_turn?: boolean
  modelTurn?: {
    parts: Part[]
  }
}

export interface FunctionCall {
  args?: Record<string, any>
  id: string
  name: string
}
export interface ToolCall {
  functionCalls: FunctionCall[]
}

export interface ToolCallCancellation {
  call_id: string
}

export interface FunctionResponseWithId extends FunctionResponse {
  id: string
}

export interface ToolResponseMessage {
  toolResponse: {
    functionResponses: FunctionResponseWithId[]
  }
}

export interface LiveIncomingMessage {
  serverContent?: ServerContent
  toolCall?: ToolCall
  toolCallCancellation?: ToolCallCancellation
  setupComplete?: boolean
}

export function isServerContentMessage(msg: LiveIncomingMessage): boolean {
  return 'serverContent' in msg
}

export function isToolCallMessage(msg: LiveIncomingMessage): boolean {
  return 'toolCall' in msg
}

export function isToolCallCancellationMessage(msg: LiveIncomingMessage): boolean {
  return 'toolCallCancellation' in msg
}

export function isSetupCompleteMessage(msg: LiveIncomingMessage): boolean {
  return 'setupComplete' in msg
}

export function isInterrupted(content: ServerContent): boolean {
  return content.interrupted === true
}

export function isTurnComplete(content: ServerContent): boolean {
  return content.end_of_turn === true
}

export function isModelTurn(content: ServerContent): boolean {
  return 'modelTurn' in content
}
