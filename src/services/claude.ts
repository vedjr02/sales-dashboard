import axios from 'axios';
import { ENV } from '@/lib/env';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ClaudeInsightRequest {
  context: string;
  question: string;
  type: 'recommendation' | 'analysis' | 'prediction' | 'coaching';
}

export interface ClaudeInsightResponse {
  insight: string;
  confidence: number;
  actionItems?: string[];
}

export async function generateSalesInsight(
  request: ClaudeInsightRequest
): Promise<ClaudeInsightResponse> {
  try {
    if (!ENV.claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    const systemPrompt = `You are an expert sales consultant AI assistant. 
      Help analyze sales data, provide recommendations, and generate actionable insights for sales teams.
      Keep responses concise and actionable.`;

    const userPrompt = `Context: ${request.context}\n\nQuestion: ${request.question}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      },
      {
        headers: {
          'x-api-key': ENV.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const content = response.data.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return {
      insight: content.text,
      confidence: 0.85,
      actionItems: extractActionItems(content.text),
    };
  } catch (error) {
    console.error('Error generating Claude insight:', error);
    throw error;
  }
}

function extractActionItems(text: string): string[] {
  const lines = text.split('\n');
  const actionItems: string[] = [];

  for (const line of lines) {
    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      actionItems.push(line.replace(/^[-•*]\s|^\d+\.\s/, '').trim());
    }
  }

  return actionItems.length > 0 ? actionItems : [text.substring(0, 100)];
}

export async function generateSalesForecasting(
  historicalData: number[],
  periods: number
): Promise<number[]> {
  try {
    const context = `Historical monthly revenue data: ${historicalData.join(', ')}`;
    const question = `Based on this trend data, predict the next ${periods} months of revenue. 
    Return only numbers separated by commas, no explanation.`;

    const response = await generateSalesInsight({
      context,
      question,
      type: 'prediction',
    });

    const predictions = response.insight
      .split(',')
      .map((num) => parseFloat(num.trim()))
      .filter((num) => !isNaN(num));

    return predictions.slice(0, periods);
  } catch (error) {
    console.error('Error generating forecast:', error);
    return historicalData.slice(-periods);
  }
}
