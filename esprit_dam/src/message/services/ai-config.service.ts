import { Injectable } from '@nestjs/common';

@Injectable()
export class AiConfigService {
  private readonly apiKey: string;
  private readonly modelId: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.modelId = process.env.MODEL_ID || 'mistralai/mistral-7b-instruct:free';
  }

  getApiKey(): string {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not set in environment variables');
    }
    return this.apiKey;
  }

  getModelId(): string {
    return this.modelId;
  }

  getMaxTokens(): number {
    return 1000;
  }

  getTemperature(): number {
    return 0.7;
  }
}
