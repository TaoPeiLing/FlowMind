import { ITask } from '../models/task.model';
import { ITaskDialogue } from '../models/taskDialogue.model';
import { ModelProvider } from '../models/modelprovider.model';
import axios from 'axios';

export interface DialogueContext {
  task: ITask;
  dialogueHistory: ITaskDialogue[];
  currentInput: string;
}

export interface DialogueResponse {
  content: string;
  analysis: {
    emotionalKeywords: string[];
    pressureIndicators: string[];
    taskHints: string[];
    llmAnalysis: {
      sentiment: number;
      urgency: number;
      clarity: number;
      suggestedActions: string[];
    };
  };
}

export interface EmotionalAnalysis {
  type: 'positive' | 'neutral' | 'negative';
  intensity: number;
  keywords: string[];
  confidence: number;
}

export interface EmotionalPrediction {
  expectedState: {
    type: 'positive' | 'neutral' | 'negative';
    intensity: number;
  };
  confidence: number;
  factors: string[];
}

export interface SupportSuggestion {
  type: string;
  content: string;
  priority: number;
  reason: string;
}

export class LLMService {
  private modelProvider: typeof ModelProvider;

  constructor() {
    this.modelProvider = ModelProvider;
  }

  // 对话管理
  async generateEmotionalResponse(context: DialogueContext): Promise<DialogueResponse> {
    try {
      const provider = await this.modelProvider.findOne({ isActive: true });
      if (!provider) {
        throw new Error('No active model provider found');
      }

      const prompt = this.buildDialoguePrompt(context);
      const response = await this.callLLMAPI(provider, prompt);

      return this.parseDialogueResponse(response);
    } catch (error) {
      console.error('Error in generateEmotionalResponse:', error);
      throw error;
    }
  }

  // 情感分析
  async analyzeEmotionalInput(input: string): Promise<EmotionalAnalysis> {
    try {
      const provider = await this.modelProvider.findOne({ isActive: true });
      if (!provider) {
        throw new Error('No active model provider found');
      }

      const prompt = this.buildEmotionalAnalysisPrompt(input);
      const response = await this.callLLMAPI(provider, prompt);

      return this.parseEmotionalAnalysis(response);
    } catch (error) {
      console.error('Error in analyzeEmotionalInput:', error);
      throw error;
    }
  }

  // 情感预测
  async predictEmotionalImpact(task: ITask): Promise<EmotionalPrediction> {
    try {
      const provider = await this.modelProvider.findOne({ isActive: true });
      if (!provider) {
        throw new Error('No active model provider found');
      }

      const prompt = this.buildEmotionalPredictionPrompt(task);
      const response = await this.callLLMAPI(provider, prompt);

      return this.parseEmotionalPrediction(response);
    } catch (error) {
      console.error('Error in predictEmotionalImpact:', error);
      throw error;
    }
  }

  // 情感支持建议
  async suggestEmotionalSupport(task: ITask): Promise<SupportSuggestion> {
    try {
      const provider = await this.modelProvider.findOne({ isActive: true });
      if (!provider) {
        throw new Error('No active model provider found');
      }

      const prompt = this.buildSupportSuggestionPrompt(task);
      const response = await this.callLLMAPI(provider, prompt);

      return this.parseSupportSuggestion(response);
    } catch (error) {
      console.error('Error in suggestEmotionalSupport:', error);
      throw error;
    }
  }

  // 私有辅助方法
  private buildDialoguePrompt(context: DialogueContext): string {
    return `
基于以下任务和对话历史，生成一个情感支持性的回应：

任务信息：
${JSON.stringify(context.task, null, 2)}

对话历史：
${context.dialogueHistory.map(d => `${d.role}: ${d.content}`).join('\n')}

当前输入：
${context.currentInput}

请分析情感内容并提供支持性回应。回应需要：
1. 理解并确认用户的情感状态
2. 提供具体的任务相关建议
3. 给出积极的情感支持
`;
  }

  private buildEmotionalAnalysisPrompt(input: string): string {
    return `
请分析以下文本的情感内容：

${input}

请提供以下分析：
1. 情感类型（positive/neutral/negative）
2. 情感强度（1-5）
3. 关键情感词
4. 分析的置信度

请以JSON格式返回结果。
`;
  }

  private buildEmotionalPredictionPrompt(task: ITask): string {
    return `
基于以下任务信息，预测可能的情感影响：

${JSON.stringify(task, null, 2)}

请预测：
1. 预期情感状态（类型和强度）
2. 预测的置信度
3. 影响因素

请以JSON格式返回结果。
`;
  }

  private buildSupportSuggestionPrompt(task: ITask): string {
    return `
基于以下任务和情感背景，提供支持建议：

${JSON.stringify(task, null, 2)}

请提供：
1. 建议类型
2. 具体建议内容
3. 优先级
4. 建议理由

请以JSON格式返回结果。
`;
  }

  private async callLLMAPI(provider: any, prompt: string): Promise<any> {
    try {
      // 如果传入的 provider 没有 apiKey，尝试重新查询完整信息
      if (!provider.apiKey) {
        console.log('API Key not found in provider, attempting to fetch complete provider data...');
        const completeProvider = await this.modelProvider.findByIdWithAuth(provider._id);
        
        if (!completeProvider) {
          throw new Error('Provider not found or not active');
        }
        
        provider = completeProvider;
      }

      const authToken = provider.apiKey;
      if (!authToken) {
        console.error('Provider data:', JSON.stringify(provider, null, 2));
        throw new Error('API Key still not found after fetching complete provider data');
      }

      console.log('Found API configuration for provider:', provider.name);

      // 根据不同的供应商调用相应的 API
      switch (provider.name.toLowerCase()) {
        case 'openai':
          return this.callOpenAI(provider, prompt, authToken);
        case 'anthropic':
          return this.callAnthropic(provider, prompt, authToken);
        case '智谱ai':
          return this.callZhipuAI(provider, prompt, authToken);
        default:
          throw new Error(`Unsupported provider: ${provider.name}`);
      }
    } catch (error) {
      console.error('Error in callLLMAPI:', error);
      throw error;
    }
  }

  private async callOpenAI(model: any, prompt: string, authToken: string): Promise<any> {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private async callAnthropic(model: any, prompt: string, authToken: string): Promise<any> {
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: model.modelName,
        prompt: prompt,
        max_tokens: 1000
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken
        }
      });

      return response.data.completion;
    } catch (error: any) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private async callZhipuAI(provider: any, prompt: string, authToken: string): Promise<any> {
    try {
      if (!authToken) {
        throw new Error('API Key not found for ZhipuAI');
      }

      console.log('Calling ZhipuAI with baseUrl:', provider.baseUrl);
      
      const response = await axios.post(provider.baseUrl, {
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        top_p: 0.7,
        request_id: Date.now().toString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
        },
        proxy: false
      });

      console.log('ZhipuAI response status:', response.status);
      
      if (response.data && response.data.data && response.data.data.choices) {
        return response.data.data.choices[0].content;
      }
      
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from ZhipuAI');
    } catch (error: any) {
      console.error('ZhipuAI API error:', error.message);
      if (error.response?.data) {
        console.error('ZhipuAI API response:', error.response.data);
      }
      throw error;
    }
  }

  private parseDialogueResponse(response: string): DialogueResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        content: parsed.content,
        analysis: {
          emotionalKeywords: parsed.analysis.emotionalKeywords || [],
          pressureIndicators: parsed.analysis.pressureIndicators || [],
          taskHints: parsed.analysis.taskHints || [],
          llmAnalysis: {
            sentiment: parsed.analysis.llmAnalysis.sentiment || 0,
            urgency: parsed.analysis.llmAnalysis.urgency || 0,
            clarity: parsed.analysis.llmAnalysis.clarity || 0,
            suggestedActions: parsed.analysis.llmAnalysis.suggestedActions || []
          }
        }
      };
    } catch (error) {
      console.error('Error parsing dialogue response:', error);
      throw new Error('Failed to parse dialogue response');
    }
  }

  private parseEmotionalAnalysis(response: string): EmotionalAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        type: parsed.type,
        intensity: parsed.intensity,
        keywords: parsed.keywords,
        confidence: parsed.confidence
      };
    } catch (error) {
      console.error('Error parsing emotional analysis:', error);
      throw new Error('Failed to parse emotional analysis');
    }
  }

  private parseEmotionalPrediction(response: string): EmotionalPrediction {
    try {
      const parsed = JSON.parse(response);
      return {
        expectedState: {
          type: parsed.expectedState.type,
          intensity: parsed.expectedState.intensity
        },
        confidence: parsed.confidence,
        factors: parsed.factors
      };
    } catch (error) {
      console.error('Error parsing emotional prediction:', error);
      throw new Error('Failed to parse emotional prediction');
    }
  }

  private parseSupportSuggestion(response: string): SupportSuggestion {
    try {
      const parsed = JSON.parse(response);
      return {
        type: parsed.type,
        content: parsed.content,
        priority: parsed.priority,
        reason: parsed.reason
      };
    } catch (error) {
      console.error('Error parsing support suggestion:', error);
      throw new Error('Failed to parse support suggestion');
    }
  }
} 