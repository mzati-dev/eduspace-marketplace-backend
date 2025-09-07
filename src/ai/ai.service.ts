import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // 1. Get the key from the environment
    const apiKey = process.env.GEMINI_API_KEY;

    // 2. This is the crucial safety check (guard clause)
    if (!apiKey) {
      throw new Error('FATAL ERROR: GEMINI_API_KEY is not defined in the .env file!');
    }

    // 3. If the check passes, initialize the client with the validated key
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateNotification(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text.trim();
    } catch (error) {
      console.error('Error generating notification with Gemini:', error);
      // Return a fallback message if the AI fails
      return 'A new update is available for you.';
    }
  }
}