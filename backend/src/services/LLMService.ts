import { ModelProviderService } from './ModelProviderService';
import { IModelProvider } from '../models/ModelProvider';

interface DialogueEntry {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  analysis?: {
    title?: string;
    description?: string;
    tags?: string[];
    priority?: 'high' | 'medium' | 'low';
    emotionalContext?: string;
  };
}

interface LLMAnalysis {
  taskInfo: {
    title: string;
    description?: string;
    tags?: string[];
    priority?: 'high' | 'medium' | 'low';
  };
  emotionalData: {
    type: 'positive' | 'neutral' | 'negative';
    intensity: number;
    reason?: string;
  };
  response: string;
  nextPrompt: string;
}

export class LLMService {
  private modelProviderService: ModelProviderService;
  private activeProvider: IModelProvider | null = null;

  constructor() {
    this.modelProviderService = new ModelProviderService();
    this.initializeSync();
  }

  private async initializeSync() {
    try {
      // 获取所有可用的模型供应商
      const providers = await this.modelProviderService.getProviders();
      // 选择第一个活跃的供应商
      this.activeProvider = providers.find(p => p.isActive) || null;
      
      if (!this.activeProvider) {
        console.warn('No active LLM provider found');
      } else {
        console.log('LLM service initialized with provider:', this.activeProvider.name);
      }
    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
    }
  }

  async generateResponse(type: 'open_ended' | 'guided', content: string): Promise<{ content: string }> {
    await this.ensureProvider();

    try {
      const prompt = type === 'open_ended' 
        ? `作为一个友好的助手，请帮助用户创建任务。以下是用户的输入：${content}`
        : `请根据以下内容，引导用户进一步明确任务细节：${content}`;

      const response = await this.modelProviderService.testConnection({
        baseUrl: this.activeProvider!.baseUrl,
        apiKey: this.activeProvider!.apiKey,
        message: JSON.stringify({
          model: this.activeProvider!.models[0]?.code || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一个专业的任务管理助手，帮助用户梳理思路并创建任务。' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return {
        content: response.responseDetails.body.choices[0].message.content
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async analyzePressureTask(content: string, dialogueHistory: DialogueEntry[]): Promise<LLMAnalysis> {
    await this.ensureProvider();

    try {
      const historyText = dialogueHistory
        .map(entry => `${entry.role}: ${entry.content}`)
        .join('\n');

      const prompt = `
        请分析以下对话内容，提取任务信息和情感数据：
        
        对话历史：
        ${historyText}
        
        当前输入：
        ${content}
        
        请按照以下 JSON 格式返回分析结果：
        {
          "taskInfo": {
            "title": "任务标题",
            "description": "任务描述",
            "tags": ["相关标签"],
            "priority": "high/medium/low"
          },
          "emotionalData": {
            "type": "positive/neutral/negative",
            "intensity": 1-5,
            "reason": "情感原因"
          },
          "response": "对用户的回应",
          "nextPrompt": "下一步引导问题"
        }
      `;

      const response = await this.modelProviderService.testConnection({
        baseUrl: this.activeProvider!.baseUrl,
        apiKey: this.activeProvider!.apiKey,
        message: JSON.stringify({
          model: this.activeProvider!.models[0]?.code || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一个专业的任务分析助手，帮助用户分析任务并提供情感支持。' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      const result = JSON.parse(response.responseDetails.body.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Error analyzing pressure task:', error);
      throw error;
    }
  }

  async generateTaskBreakdown(taskId: string): Promise<{ steps: string[] }> {
    await this.ensureProvider();

    try {
      // TODO: 获取任务详情
      const taskDetails = {
        title: '示例任务',
        description: '这是一个示例任务描述'
      };

      const prompt = `
        请为以下任务生成具体的执行步骤：
        
        任务标题：${taskDetails.title}
        任务描述：${taskDetails.description}
        
        请生成 3-5 个具体的执行步骤。
      `;

      const response = await this.modelProviderService.testConnection({
        baseUrl: this.activeProvider!.baseUrl,
        apiKey: this.activeProvider!.apiKey,
        message: JSON.stringify({
          model: this.activeProvider!.models[0]?.code || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一个专业的任务分解助手，帮助用户将任务分解为可执行的步骤。' },
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      const steps = response.responseDetails.body.choices[0].message.content
        .split('\n')
        .filter((step: string) => step.trim())
        .map((step: string) => step.replace(/^\d+\.\s*/, ''));

      return { steps };
    } catch (error) {
      console.error('Error generating task breakdown:', error);
      throw error;
    }
  }

  private async ensureProvider() {
    if (!this.activeProvider) {
      await this.initializeSync();
      if (!this.activeProvider) {
        throw new Error('No active LLM provider available');
      }
    }
  }
} 