import { Request, Response } from 'express';
import { LLMService } from '../services/LLMService';

class LLMController {
  private static instance: LLMController;
  private service: LLMService;

  private constructor() {
    this.service = new LLMService();
    // 绑定方法的 this 上下文
    this.generateResponse = this.generateResponse.bind(this);
    this.analyzePressureTask = this.analyzePressureTask.bind(this);
    this.generateTaskBreakdown = this.generateTaskBreakdown.bind(this);
  }

  public static getInstance(): LLMController {
    if (!LLMController.instance) {
      LLMController.instance = new LLMController();
    }
    return LLMController.instance;
  }

  // 生成对话回复
  async generateResponse(req: Request, res: Response) {
    try {
      const { type, content } = req.body;
      const response = await this.service.generateResponse(type, content);
      res.json(response);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      res.status(500).json({ error: '生成回复失败' });
    }
  }

  // 分析压力任务
  async analyzePressureTask(req: Request, res: Response) {
    try {
      const { content, dialogueHistory } = req.body;
      const analysis = await this.service.analyzePressureTask(content, dialogueHistory);
      res.json(analysis);
    } catch (error) {
      console.error('Error in analyzePressureTask:', error);
      res.status(500).json({ error: '分析任务失败' });
    }
  }

  // 生成任务分解
  async generateTaskBreakdown(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const breakdown = await this.service.generateTaskBreakdown(taskId);
      res.json(breakdown);
    } catch (error) {
      console.error('Error in generateTaskBreakdown:', error);
      res.status(500).json({ error: '生成任务分解失败' });
    }
  }
}

export const llmController = LLMController.getInstance(); 