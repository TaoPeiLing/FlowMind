import { Request, Response } from 'express';
import { ModelProviderService } from '../services/ModelProviderService';

class ModelProviderController {
  private static instance: ModelProviderController;
  private service: ModelProviderService;

  private constructor() {
    this.service = new ModelProviderService();
    // 绑定所有方法的 this 上下文
    this.getProviders = this.getProviders.bind(this);
    this.getProviderById = this.getProviderById.bind(this);
    this.createProvider = this.createProvider.bind(this);
    this.updateProvider = this.updateProvider.bind(this);
    this.deleteProvider = this.deleteProvider.bind(this);
    this.testConnection = this.testConnection.bind(this);
    this.updateModelStatus = this.updateModelStatus.bind(this);
    this.updateGlobalModelStatus = this.updateGlobalModelStatus.bind(this);
  }

  public static getInstance(): ModelProviderController {
    if (!ModelProviderController.instance) {
      ModelProviderController.instance = new ModelProviderController();
    }
    return ModelProviderController.instance;
  }

  // 获取所有供应商
  async getProviders(req: Request, res: Response) {
    try {
      const providers = await this.service.getProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error in getProviders:', error);
      res.status(500).json({ error: '获取供应商列表失败' });
    }
  }

  // 获取单个供应商
  async getProviderById(req: Request, res: Response) {
    try {
      const provider = await this.service.getProviderById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: '供应商不存在' });
      }
      res.json(provider);
    } catch (error) {
      console.error('Error in getProviderById:', error);
      res.status(500).json({ error: '获取供应商失败' });
    }
  }

  // 创建供应商
  async createProvider(req: Request, res: Response) {
    try {
      const provider = await this.service.createProvider(req.body);
      res.status(201).json(provider);
    } catch (error) {
      console.error('Error in createProvider:', error);
      res.status(500).json({ error: '创建供应商失败' });
    }
  }

  // 更新供应商
  async updateProvider(req: Request, res: Response) {
    try {
      const provider = await this.service.updateProvider(req.params.id, req.body);
      if (!provider) {
        return res.status(404).json({ error: '供应商不存在' });
      }
      res.json(provider);
    } catch (error) {
      console.error('Error in updateProvider:', error);
      res.status(500).json({ error: '更新供应商失败' });
    }
  }

  // 删除供应商
  async deleteProvider(req: Request, res: Response) {
    try {
      await this.service.deleteProvider(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteProvider:', error);
      res.status(500).json({ error: '删除供应商失败' });
    }
  }

  // 测试连接
  async testConnection(req: Request, res: Response) {
    try {
      const result = await this.service.testConnection(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error in testConnection:', error);
      res.status(500).json({ error: '测试连接失败' });
    }
  }

  // 更新模型状态
  async updateModelStatus(req: Request, res: Response) {
    try {
      const { providerId, modelCode } = req.params;
      const { isEnabled } = req.body;
      
      const result = await this.service.updateModelStatus(providerId, modelCode, isEnabled);
      if (!result) {
        return res.status(404).json({ error: '模型不存在' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error in updateModelStatus:', error);
      res.status(500).json({ error: '更新模型状态失败' });
    }
  }

  // 更新全局模型状态
  async updateGlobalModelStatus(req: Request, res: Response) {
    try {
      const { isEnabled } = req.body;
      const result = await this.service.updateGlobalModelStatus(isEnabled);
      res.json(result);
    } catch (error) {
      console.error('Error in updateGlobalModelStatus:', error);
      res.status(500).json({ error: '更新全局模型状态失败' });
    }
  }
}

export const modelProviderController = ModelProviderController.getInstance();