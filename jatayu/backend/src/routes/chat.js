const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const chatMemoryService = require('../services/chatMemoryService');

// POST /api/chat - Handle chat messages with Gemini AI
router.post('/', async (req, res) => {
  try {
    const { message, context, analysisData, userId, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Generate or use existing conversation ID
    const convId = conversationId || chatMemoryService.generateConversationId(userId, context?.coordinates);
    
    // Add user message to conversation history
    chatMemoryService.addMessage(convId, message, 'user', {
      timestamp: new Date(),
      context: context
    });

    // Update conversation context with analysis data if provided
    if (analysisData) {
      chatMemoryService.updateContext(convId, {
        location: context?.coordinates,
        analysisData: analysisData
      });
    }

    // Get conversation context for AI
    const conversationContext = chatMemoryService.buildConversationContext(convId);

    // Prepare context for Gemini with conversation history
    const geminiContext = {
      userMessage: message,
      previousAnalysis: analysisData || conversationContext.analysisData,
      spatialContext: context || { coordinates: conversationContext.location },
      conversationHistory: conversationContext.conversationHistory,
      messageCount: conversationContext.messageCount
    };

    console.log(`💬 Processing chat for conversation ${convId} (${conversationContext.messageCount} messages)`);

    // Get response from Gemini
    const response = await geminiService.generateChatResponse(geminiContext);

    // Add assistant response to conversation history
    chatMemoryService.addMessage(convId, response, 'assistant', {
      timestamp: new Date(),
      responseLength: response.length
    });

    res.json({
      success: true,
      response: response,
      conversationId: convId,
      timestamp: new Date().toISOString(),
      context: {
        messageCount: conversationContext.messageCount + 1,
        hasLocation: !!conversationContext.location,
        hasAnalysisData: !!conversationContext.analysisData
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

module.exports = router;
