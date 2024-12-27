import { Request, Response } from 'express';
import { ModelProvider } from '../models/modelConfig/modelProvider';
import { ModelProviderService } from '../services/ModelProviderService';

export class ModelProviderController {
  private static service = new ModelProviderService();

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
      console.log('Create Provider Request:', {
        body: req.body,
        user: req.user
      });

      const { name, identifier, baseUrl, apiKey, config, models, isActive } = req.body;

      // 验证必填字段
      if (!name || !identifier || !baseUrl || !apiKey) {
        console.log('Validation Error: Missing required fields');
        return res.status(400).json({
          error: 'Missing required fields',
          details: {
            name: !name,
            identifier: !identifier,
            baseUrl: !baseUrl,
            apiKey: !apiKey
          }
        });
      }

      // 检查标识符唯一性
      const existingProvider = await ModelProvider.findOne({ identifier });
      if (existingProvider) {
        console.log('Validation Error: Duplicate provider identifier');
        return res.status(400).json({ 
          message: '创建供应商失败',
          error: '标识符已存在' 
        });
      }

      // 验证映射配置
      if (!config || !config.requestMapping || !config.responseMapping) {
        console.log('Validation Error: Missing request or response mapping');
        return res.status(400).json({ 
          message: '创建供应商失败',
          error: '请配置请求和响应映射' 
        });
      }

      // 创建新的供应商
      const provider = new ModelProvider({
        name,
        identifier: identifier.toLowerCase().trim(),
        baseUrl: baseUrl.trim(),
        apiKey,
        config: config || {
          requestMapping: config.requestMapping,
          responseMapping: config.responseMapping,
          headers: config.headers || {}
        },
        models: models || [],
        isActive: isActive || false
      });

      console.log('Saving Provider:', {
        name: provider.name,
        identifier: provider.identifier,
        baseUrl: provider.baseUrl
      });

      await provider.save();
      
      console.log('Provider Created Successfully:', {
        id: provider._id,
        name: provider.name
      });

      // 返回结果时排除敏感信息
      const result = provider.toObject();
      delete result.apiKey;
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Create Provider Error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          error: 'Duplicate provider identifier',
          details: error.keyValue
        });
      }

      res.status(500).json({
        error: 'Failed to create provider',
        message: error.message
      });
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
      const { prompt, model } = req.body;
      
      // 显式选择包含 apiKey 的完整信息
      const provider = await ModelProvider.findById(id).select('+apiKey');
      
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      // 构建测试消息
      const testMessage = {
        model: model || provider.models?.[0]?.code || 'glm-4',
        messages: [
          { role: 'user', content: prompt || '你好' }
        ]
      };

      console.log('Testing connection with:', {
        baseUrl: provider.baseUrl,
        model: testMessage.model,
        prompt: testMessage.messages[0].content
      });

      // 使用 ModelProviderService 进行真实的连接测试
      const result = await ModelProviderController.service.testConnection({
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
        message: JSON.stringify(testMessage)
      });

      res.json(result);
    } catch (error) {
      console.error('Test connection error:', error);
      res.status(500).json({ 
        success: false,
        message: '测试连接失败',
        error: error.message,
        stack: error.stack
      });
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
