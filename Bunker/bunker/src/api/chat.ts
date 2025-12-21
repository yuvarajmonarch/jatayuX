interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  context?: {
    coordinates?: { lat: number; lng: number };
    location?: string;
  };
  analysisData?: {
    summary: string;
    sources: string[];
    dataPoints: Array<{
      label: string;
      value: string | number;
      unit?: string;
    }>;
  };
  userId?: string;
  conversationId?: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
  conversationId: string;
  timestamp: string;
  context: {
    messageCount: number;
    hasLocation: boolean;
    hasAnalysisData: boolean;
  };
}

/**
 * Send a chat message to the backend and get AI response
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * Create a new chat message object
 */
export function createChatMessage(
  type: 'user' | 'ai',
  content: string,
  id?: string
): ChatMessage {
  return {
    id: id || Date.now().toString(),
    type,
    content,
    timestamp: new Date(),
  };
}

export type { ChatMessage, ChatRequest, ChatResponse };
