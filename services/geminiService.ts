import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEMINI_MODEL } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    // We instantiate even without key to allow graceful failure later if needed, 
    // though the prompt guarantees existence.
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public startChat(): Chat {
    this.chat = this.ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return this.chat;
  }

  public getChat(): Chat {
    if (!this.chat) {
      return this.startChat();
    }
    return this.chat;
  }
}

export const geminiService = new GeminiService();
