import { connect } from 'mongoose';
import { ModelProvider } from '../models/modelProvider';

// 默认参数映射
const DEFAULT_PARAMETERS = {
  text: [
    {
      name: 'temperature',
      type: 'number' as const,
      required: true,
      default: 0.7,
      min: 0,
      max: 1,
      description: '采样温度，控制输出的随机性'
    },
    {
      name: 'maxTokens',
      type: 'number' as const,
      required: false,
      default: 2048,
      min: 1,
      max: 8192,
      description: '生成文本的最大长度'
    }
  ],
  image: [
    {
      name: 'size',
      type: 'enum' as const,
      required: true,
      options: ['256x256', '512x512', '1024x1024'],
      default: '512x512',
      description: '生成图片的尺寸'
    },
    {
      name: 'quality',
      type: 'enum' as const,
      required: false,
      options: ['standard', 'hd'],
      default: 'standard',
      description: '图片质量'
    }
  ]
};

// 能力类型映射
const CAPABILITY_TYPES = {
  'chat': {
    type: 'text' as const,
    name: '对话生成',
    description: '支持上下文的对话生成能力'
  },
  'completion': {
    type: 'text' as const,
    name: '文本补全',
    description: '根据提示补全文本内容'
  },
  'image': {
    type: 'image' as const,
    name: '图像生成',
    description: '根据文本描述生成图像'
  }
};

async function migrateModelProviders() {
  try {
    // 连接数据库
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowmind');
    console.log('Connected to MongoDB');

    // 获取所有供应商
    const providers = await ModelProvider.find({});
    console.log(`Found ${providers.length} providers to migrate`);

    for (const provider of providers) {
      console.log(`Migrating provider: ${provider.name}`);

      // 1. 转换模型能力
      const updatedModels = provider.models.map(model => {
        const capabilities = (model.capabilities || []).map(cap => {
          const capabilityType = CAPABILITY_TYPES[cap] || CAPABILITY_TYPES['chat'];
          return {
            ...capabilityType,
            parameters: DEFAULT_PARAMETERS[capabilityType.type]
          };
        });

        // 2. 设置模型参数
        const parameters = [...DEFAULT_PARAMETERS['text']];

        // 3. 创建映射配置
        const inputMapping = new Map();
        const outputMapping = new Map();

        // 基于原有的 requestMapping 和 responseMapping 创建新的映射
        if (provider.requestMapping) {
          Object.entries(provider.requestMapping).forEach(([key, value]) => {
            inputMapping.set(key, { path: value });
          });
        }

        if (provider.responseMapping) {
          Object.entries(provider.responseMapping).forEach(([key, value]) => {
            outputMapping.set(key, { path: value });
          });
        }

        return {
          ...model,
          capabilities,
          parameters,
          inputMapping,
          outputMapping
        };
      });

      // 4. 创建新的配置对象
      const config = {
        requestMapping: new Map(Object.entries(provider.requestMapping || {}).map(
          ([key, value]) => [key, { path: value }]
        )),
        responseMapping: new Map(Object.entries(provider.responseMapping || {}).map(
          ([key, value]) => [key, { path: value }]
        )),
        headers: new Map(Object.entries(provider.headers || {}))
      };

      // 5. 更新供应商文档
      await ModelProvider.updateOne(
        { _id: provider._id },
        { 
          $set: { 
            models: updatedModels,
            config,
            identifier: provider.identifier.toLowerCase().trim()
          },
          $unset: { 
            requestMapping: 1, 
            responseMapping: 1,
            headers: 1,
            authType: 1
          }
        }
      );

      console.log(`Successfully migrated provider: ${provider.name}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// 运行迁移
migrateModelProviders();
