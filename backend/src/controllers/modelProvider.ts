import { Request, Response } from 'express';
import { ModelProvider } from '../models/modelProvider';

export class ModelProviderController {
  // 获取所有供应商
  static async getProviders(req: Request, res: Response) {
    try {
      const providers = await ModelProvider.find({}, { apiKey: 0 });
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: '获取供应商列表失败', error });
    }
  }

  // 创建供应商
  static async createProvider(req: Request, res: Response) {
    try {
      const provider = new ModelProvider(req.body);
      await provider.save();
      
      const providerWithoutKey = await ModelProvider.findById(provider._id, { apiKey: 0 });
      res.status(201).json(providerWithoutKey);
    } catch (error) {
      res.status(400).json({ message: '创建供应商失败', error });
    }
  }

  // 更新供应商
  static async updateProvider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const provider = await ModelProvider.findByIdAndUpdate(
        id,
        req.body,
        { new: true, select: '-apiKey' }
      );
      
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }
      
      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: '更新供应商失败', error });
    }
  }

  // 删除供应商
  static async deleteProvider(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const provider = await ModelProvider.findById(id);
      
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      if (provider.isActive) {
        return res.status(400).json({ message: '无法删除启用状态的供应商' });
      }

      await provider.remove();
      res.json({ message: '供应商已删除' });
    } catch (error) {
      res.status(500).json({ message: '删除供应商失败', error });
    }
  }

  // 测试连接
  static async testConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const provider = await ModelProvider.findById(id);
      
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      // TODO: 实现实际的连接测试逻辑
      const testResult = await testProviderConnection(provider);
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: '测试连接失败', error });
    }
  }

  // 更新供应商状态
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const provider = await ModelProvider.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, select: '-apiKey' }
      );

      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: '更新状态失败', error });
    }
  }

  // 获取供应商支持的模型列表
  static async getModels(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const provider = await ModelProvider.findById(id, { apiKey: 0 });
      
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      res.json(provider.models);
    } catch (error) {
      res.status(500).json({ message: '获取模型列表失败', error });
    }
  }

  // 更新供应商的模型配置
  static async updateModels(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { models } = req.body;

      const provider = await ModelProvider.findByIdAndUpdate(
        id,
        { models },
        { new: true, select: '-apiKey' }
      );

      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: '更新模型配置失败', error });
    }
  }
}

// 测试供应商连接的辅助函数
async function testProviderConnection(provider: any) {
  try {
    // TODO: 实现实际的连接测试逻辑
    return {
      success: true,
      message: '连接测试成功'
    };
  } catch (error) {
    return {
      success: false,
      message: '连接测试失败',
      error
    };
  }
}
