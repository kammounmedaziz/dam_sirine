import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AiConfigService } from './ai-config.service';
import axios from 'axios';

interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class OpenRouterClientService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private readonly configService: AiConfigService) {}

  async chatCompletion(
    messages: ChatMessage[],
    temperature?: number,
    maxTokens?: number,
  ): Promise<string> {
    const headers = {
      Authorization: `Bearer ${this.configService.getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Chat Summarizer',
    };

    const payload = {
      model: this.configService.getModelId(),
      messages,
      temperature: temperature || this.configService.getTemperature(),
      max_tokens: maxTokens || this.configService.getMaxTokens(),
    };

    // Retry logic
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        console.log(`Sending request to OpenRouter (attempt ${attempt + 1})...`);
        
        const response = await axios.post(this.apiUrl, payload, {
          headers,
          timeout: 30000,
        });

        console.log(`Response status: ${response.status}`);

        if (response.status === 200) {
          const data = response.data;
          console.log('API Response:', data);
          
          const content = data.choices?.[0]?.message?.content;
          
          if (!content || !content.trim()) {
            throw new HttpException(
              `Empty response from API. Full response: ${JSON.stringify(data)}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          
          return content;
        }
      } catch (error) {
        console.error(`Request attempt ${attempt + 1} failed:`, error.message);
        
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status >= 500 && attempt < 3) {
            console.log(`Server error ${error.response.status}, retrying...`);
            await this.sleep(Math.pow(2, attempt) * 1000);
            continue;
          }
          
          throw new HttpException(
            `API error ${error.response?.status}: ${error.response?.data || error.message}`,
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        
        if (attempt < 3) {
          await this.sleep(Math.pow(2, attempt) * 1000);
          continue;
        }
        
        throw new HttpException(
          `Request failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException('Max retries exceeded', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
