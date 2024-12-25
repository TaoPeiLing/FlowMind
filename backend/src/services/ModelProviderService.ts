import { ModelProvider, IModelProvider, IModelDefinition, PROVIDER_CONFIGS } from '../models/ModelProvider';
import { encrypt, decrypt } from '../utils/encryption';
import axios from 'axios';

export class ModelProviderService {
  // 创建新的供应商
  async createProvider(data: Partial<IModelProvider>): Promise<IModelProvider> {
    try {
      console.log('Creating provider with data:', JSON.stringify(data, null, 2));
      
      // 获取预设配置
      const presetConfig = PROVIDER_CONFIGS[data.identifier] || PROVIDER_CONFIGS['zhipu'];
      
      // 构建基础数据
      const providerData = {
        name: data.name,
        identifier: data.identifier,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey,
        requestMapping: data.requestMapping || presetConfig.requestMapping,
        responseMapping: data.responseMapping || presetConfig.responseMapping,
        isActive: data.isActive ?? true,
        tokenUsage: data.tokenUsage || 0,
        authType: data.authType || 'bearer',
        headers: data.headers || {},
        models: data.models || []  // 使用传入的models数据
      };

      const provider = new ModelProvider(providerData);
      
      // 验证数据
      const validationError = provider.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        throw validationError;
      }
      
      const savedProvider = await provider.save();
      console.log('Provider saved successfully:', savedProvider);
      return savedProvider;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }

  // 获取所有供应商
  async getProviders(): Promise<IModelProvider[]> {
    try {
      const providers = await ModelProvider.find();
      console.log(`Found ${providers.length} providers`);
      return providers;
    } catch (error) {
      console.error('Error getting providers:', error);
      throw error;
    }
  }

  // 获取单个供应商
  async getProviderById(id: string): Promise<IModelProvider | null> {
    try {
      const provider = await ModelProvider.findById(id);
      console.log('Provider found by id:', provider ? provider._id : 'not found');
      return provider;
    } catch (error) {
      console.error(`Error getting provider by id ${id}:`, error);
      throw error;
    }
  }

  // 更新供应商
  async updateProvider(id: string, data: Partial<IModelProvider>): Promise<IModelProvider | null> {
    try {
      console.log('Updating provider:', { id, data });
      const provider = await ModelProvider.findByIdAndUpdate(id, data, { new: true });
      console.log('Provider updated:', provider ? 'success' : 'not found');
      return provider;
    } catch (error) {
      console.error(`Error updating provider ${id}:`, error);
      throw error;
    }
  }

  // 删除供应商
  async deleteProvider(id: string): Promise<boolean> {
    try {
      console.log('Deleting provider:', id);
      const result = await ModelProvider.findByIdAndDelete(id);
      console.log('Provider deleted:', result ? 'success' : 'not found');
      return result !== null;
    } catch (error) {
      console.error(`Error deleting provider ${id}:`, error);
      throw error;
    }
  }

  // 测试连接
  async testConnection(params: { baseUrl: string; apiKey: string; message: string }): Promise<any> {
    const startTime = Date.now();
    try {
      // 解析消息
      const testMessage = JSON.parse(params.message);

      // 发送测试请求
      const response = await axios({
        method: 'POST',
        url: params.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.apiKey}`
        },
        data: testMessage
      });

      const endTime = Date.now();
      
      return {
        success: true,
        message: '连接测试成功',
        statusCode: response.status,
        requestDetails: {
          url: params.baseUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.apiKey}`
          },
          body: testMessage
        },
        responseDetails: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: response.data
        },
        latency: endTime - startTime
      };
    } catch (error) {
      const endTime = Date.now();
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: '连接测试失败',
          statusCode: error.response?.status || 500,
          error: {
            code: error.code,
            message: error.message,
            stack: error.stack
          },
          requestDetails: {
            url: params.baseUrl,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${params.apiKey}`
            },
            body: params.message
          },
          responseDetails: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            body: error.response.data
          } : undefined,
          latency: endTime - startTime
        };
      }

      return {
        success: false,
        message: '连接测试失败',
        statusCode: 500,
        error: {
          message: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined
        },
        latency: endTime - startTime
      };
    }
  }

  // 更新模型状态
  async updateModelStatus(providerId: string, modelCode: string, isEnabled: boolean): Promise<IModelProvider | null> {
    const provider = await ModelProvider.findById(providerId);
    if (!provider) {
      return null;
    }

    const modelIndex = provider.models.findIndex(model => model.code === modelCode);
    if (modelIndex === -1) {
      return null;
    }

    provider.models[modelIndex].isEnabled = isEnabled;
    return await provider.save();
  }

  // 更新全局模型状态
  async updateGlobalModelStatus(isEnabled: boolean): Promise<IModelProvider[]> {
    // 更新所有供应商的全局状态
    await ModelProvider.updateMany({}, { isActive: isEnabled });
    
    // 如果禁用全局状态，同时禁用所有模型
    if (!isEnabled) {
      await ModelProvider.updateMany(
        {},
        { $set: { "models.$[].isEnabled": false } }
      );
    }

    return await this.getProviders();
  }
}