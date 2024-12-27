import { ModelProvider, ProviderModel, ModelCapability, ModelMapping } from './modelConfig';

// 这个函数会在应用启动时被调用，确保所有模型都被正确注册
export const initializeModels = () => {
  // 模型已经在各自的文件中定义和导出
  // 这里可以添加一些初始化逻辑，比如创建默认数据等
  console.log('Models initialized:', {
    ModelProvider: ModelProvider.modelName,
    ProviderModel: ProviderModel.modelName,
    ModelCapability: ModelCapability.modelName,
    ModelMapping: ModelMapping.modelName
  });
};
