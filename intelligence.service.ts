import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class IntelligenceService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async processNewRegulation(rawText: string) {
    // Uses the RAG Engine to summarize the law for non-technical users
    const analysis = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ 
        role: 'system', 
        content: 'Summarize this regulation for a Compliance Officer. Extract: 1. Key Deadlines 2. Affected Data Types 3. Risk Level.' 
      }, { 
        role: 'user', 
        content: rawText 
      }],
    });
    
    return this.saveToDashboard(analysis);
  }

  private async saveToDashboard(analysis: any) {
      console.log('Saved to dashboard:', analysis);
      return analysis;
  }
}