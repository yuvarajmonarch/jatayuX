/**
 * Chat Memory Service
 * Manages conversation context and history for better AI responses
 */

class ChatMemoryService {
  constructor() {
    // In-memory storage for conversation history
    // In production, this should be replaced with a database
    this.conversations = new Map();
    this.maxHistoryLength = 10; // Keep last 10 messages per conversation
  }

  /**
   * Generate a conversation ID based on user and location
   */
  generateConversationId(userId, coordinates) {
    if (!coordinates) {
      return `user_${userId || 'anonymous'}`;
    }
    // Round coordinates to create consistent session IDs for same location
    const roundedLat = Math.round(coordinates.lat * 1000) / 1000;
    const roundedLng = Math.round(coordinates.lng * 1000) / 1000;
    return `user_${userId || 'anonymous'}_${roundedLat}_${roundedLng}`;
  }

  /**
   * Add a message to conversation history
   */
  addMessage(conversationId, message, type = 'user', metadata = {}) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        context: {
          location: null,
          analysisData: null,
          lastUpdated: new Date()
        }
      });
    }

    const conversation = this.conversations.get(conversationId);
    
    const messageObj = {
      id: Date.now() + Math.random(),
      type, // 'user' or 'assistant'
      content: message,
      timestamp: new Date(),
      metadata
    };

    conversation.messages.push(messageObj);
    
    // Keep only the last N messages
    if (conversation.messages.length > this.maxHistoryLength) {
      conversation.messages = conversation.messages.slice(-this.maxHistoryLength);
    }

    conversation.context.lastUpdated = new Date();
    
    return messageObj;
  }

  /**
   * Update conversation context with analysis data
   */
  updateContext(conversationId, contextData) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        context: {
          location: null,
          analysisData: null,
          lastUpdated: new Date()
        }
      });
    }

    const conversation = this.conversations.get(conversationId);
    
    if (contextData.location) {
      conversation.context.location = contextData.location;
    }
    
    if (contextData.analysisData) {
      conversation.context.analysisData = contextData.analysisData;
    }
    
    conversation.context.lastUpdated = new Date();
    
    return conversation.context;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId, limit = 5) {
    if (!this.conversations.has(conversationId)) {
      return [];
    }

    const conversation = this.conversations.get(conversationId);
    return conversation.messages.slice(-limit);
  }

  /**
   * Get conversation context
   */
  getConversationContext(conversationId) {
    if (!this.conversations.has(conversationId)) {
      return {
        location: null,
        analysisData: null,
        lastUpdated: null
      };
    }

    return this.conversations.get(conversationId).context;
  }

  /**
   * Get full conversation for context
   */
  getFullConversationContext(conversationId) {
    if (!this.conversations.has(conversationId)) {
      return {
        history: [],
        context: {
          location: null,
          analysisData: null,
          lastUpdated: null
        }
      };
    }

    const conversation = this.conversations.get(conversationId);
    return {
      history: conversation.messages,
      context: conversation.context
    };
  }

  /**
   * Build conversation context for AI
   */
  buildConversationContext(conversationId) {
    const fullContext = this.getFullConversationContext(conversationId);
    
    // Build conversation history string
    const historyText = fullContext.history
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    return {
      conversationHistory: historyText,
      location: fullContext.context.location,
      analysisData: fullContext.context.analysisData,
      messageCount: fullContext.history.length
    };
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId) {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
      return true;
    }
    return false;
  }

  /**
   * Get conversation summary for debugging
   */
  getConversationSummary(conversationId) {
    if (!this.conversations.has(conversationId)) {
      return null;
    }

    const conversation = this.conversations.get(conversationId);
    return {
      id: conversationId,
      messageCount: conversation.messages.length,
      lastMessage: conversation.messages[conversation.messages.length - 1],
      hasLocation: !!conversation.context.location,
      hasAnalysisData: !!conversation.context.analysisData,
      lastUpdated: conversation.context.lastUpdated
    };
  }

  /**
   * Clean up old conversations (call periodically)
   */
  cleanupOldConversations(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    let cleanedCount = 0;

    for (const [id, conversation] of this.conversations.entries()) {
      if (conversation.context.lastUpdated < cutoffTime) {
        this.conversations.delete(id);
        cleanedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${cleanedCount} old conversations`);
    return cleanedCount;
  }

  /**
   * Get all active conversations (for debugging)
   */
  getAllConversations() {
    return Array.from(this.conversations.values());
  }
}

// Create singleton instance
const chatMemoryService = new ChatMemoryService();

// Clean up old conversations every hour
setInterval(() => {
  chatMemoryService.cleanupOldConversations(24); // 24 hours
}, 60 * 60 * 1000);

module.exports = chatMemoryService;
