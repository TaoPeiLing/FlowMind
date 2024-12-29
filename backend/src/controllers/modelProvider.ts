import { Request, Response } from 'express';
import { ModelProvider } from '../models/modelConfig/modelProvider';
import { ModelProviderService } from '../services/ModelProviderService';
import axios from 'axios';

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
      
      // 先检查供应商是否存在
      const provider = await ModelProvider.findById(id);
      
      if (!provider) {
        return res.status(404).json({ 
          success: false,
          message: '供应商不存在' 
        });
      }

      // 检查供应商是否处于启用状态
      if (provider.isActive) {
        return res.status(400).json({ 
          success: false,
          message: '无法删除启用状态的供应商，请先禁用该供应商' 
        });
      }

      // 执行删除操作
      const result = await ModelProvider.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(500).json({ 
          success: false,
          message: '删除供应商失败' 
        });
      }

      res.json({ 
        success: true,
        message: '供应商已成功删除' 
      });
    } catch (error: any) {
      console.error('删除供应商时出错:', error);
      res.status(500).json({ 
        success: false,
        message: '删除供应商失败',
        error: error.message || '未知错误'
      });
    }
  }

  // 测试供应商连接
  static async testConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      console.log('收到测试请求:', { providerId: id, message });

      // 获取供应商信息，显式包含 apiKey
      const provider = await ModelProvider.findById(id).select('+apiKey');
      if (!provider) {
        return res.status(404).json({ message: '供应商不存在' });
      }

      if (!provider.apiKey) {
        return res.status(400).json({ message: '供应商API密钥未配置' });
      }

      // 构建请求头 - 使用 apiKey 而不是 baseUrl
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      };

      // 构建请求数据
      const selectedModel = provider.models[0];
      if (!selectedModel) {
        return res.status(400).json({ message: '未配置可用的模型' });
      }

      const requestData = {
        model: selectedModel.code,
        messages: [{
          role: 'user',
          content: message
        }],
        temperature: selectedModel.parameters?.temperature ?? 0.7,
        top_p: selectedModel.parameters?.top_p ?? 1.0
      };

      // 构建测试请求
      const testRequest = {
        url: provider.baseUrl,  // 使用 baseUrl 作为请求地址
        method: 'POST',
        headers,
        data: requestData
      };

      // 记录发送到模型服务器的完整请求信息（包含实际的 API Key）
      console.log('\n========= 发送到模型服务器的实际请求 =========');
      console.log('URL:', testRequest.url);
      console.log('Method:', testRequest.method);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Request Body:', JSON.stringify(requestData, null, 2));
      console.log('===============================================\n');

      try {
        // 发送测试请求
        const response = await axios(testRequest);

        // 记录模型服务器的完整响应信息
        console.log('\n========= 模型服务器的实际响应 =========');
        console.log('Status:', response.status, response.statusText);
        console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Response Body:', JSON.stringify(response.data, null, 2));
        console.log('===========================================\n');

        // 返回请求和响应数据，但在返回给客户端时隐藏敏感信息
        return res.json({
          modelRequest: {
            url: testRequest.url,
            method: testRequest.method,
            headers: Object.entries(headers).reduce((acc, [key, value]) => {
              acc[key] = key.toLowerCase() === 'authorization' 
                ? 'Bearer ********' 
                : value;
              return acc;
            }, {} as Record<string, string>),
            data: requestData
          },
          modelResponse: {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
          }
        });
      } catch (error: any) {
        // 记录详细的错误信息，包括实际的请求信息
        console.error('\n========= 模型服务器请求失败 =========');
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
          console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('Original Request:', {
          url: testRequest.url,
          method: testRequest.method,
          headers: headers,  // 包含实际的 API Key
          data: requestData
        });
        console.error('=======================================\n');

        if (axios.isAxiosError(error) && error.response) {
          // 返回错误信息给客户端时隐藏敏感信息
          return res.status(error.response.status).json({
            modelRequest: {
              url: testRequest.url,
              method: testRequest.method,
              headers: Object.entries(headers).reduce((acc, [key, value]) => {
                acc[key] = key.toLowerCase() === 'authorization'
                  ? 'Bearer ********'
                  : value;
                return acc;
              }, {} as Record<string, string>),
              data: requestData
            },
            modelResponse: {
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
              data: error.response.data
            },
            message: '模型服务器返回错误'
          });
        } else if (error.request) {
          return res.status(503).json({
            modelRequest: {
              url: testRequest.url,
              method: testRequest.method,
              headers: Object.entries(headers).reduce((acc, [key, value]) => {
                acc[key] = key.toLowerCase() === 'authorization'
                  ? 'Bearer ********'
                  : value;
                return acc;
              }, {} as Record<string, string>),
              data: requestData
            },
            message: '模型服务器无响应',
            error: '请求超时或服务不可用'
          });
        }
        return res.status(500).json({
          modelRequest: {
            url: testRequest.url,
            method: testRequest.method,
            headers: Object.entries(headers).reduce((acc, [key, value]) => {
              acc[key] = key.toLowerCase() === 'authorization'
                ? 'Bearer ********'
                : value;
              return acc;
            }, {} as Record<string, string>),
            data: requestData
          },
          message: '测试连接失败',
          error: error.message || '未知错误'
        });
      }
    } catch (error: any) {
      console.error('测试连接过程出错:', error);
      res.status(500).json({ 
        message: '测试连接失败',
        error: error.message || '未知错误'
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
