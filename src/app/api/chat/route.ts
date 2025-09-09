import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation contents for multi-turn chat
    const contents = [];

    // Add system context as the first user message if no history exists
    if (conversationHistory.length === 0) {
      contents.push({
        role: "user",
        parts: [
          { 
            text: `You are an AI assistant specialized in helping people with immigration and migration processes. You provide accurate, helpful, and up-to-date information about visa requirements, document preparation, timeline planning, and general migration guidance.

Context about the user's migration journey: ${context ? JSON.stringify(context) : 'No specific context provided'}

Please provide helpful, accurate, and actionable advice. If you're unsure about specific legal requirements or recent policy changes, recommend consulting official government sources or immigration professionals.

Please introduce yourself briefly and ask how you can help with their migration journey.`
          }
        ]
      });
      
      contents.push({
        role: "model",
        parts: [
          { 
            text: "Hi! I'm your AI migration assistant. I can help you with visa requirements, document preparation, timeline planning, and answer any questions about your immigration journey. What would you like to know?"
          }
        ]
      });
    } else {
      // Add conversation history
      conversationHistory.forEach((msg: any) => {
        contents.push({
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Generate content using the new API
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: contents,
    });

    return NextResponse.json({ 
      message: response.text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' }, 
      { status: 500 }
    );
  }
}
