import { Schema, model, Document } from 'mongoose';

// 模型定义接口
interface IModelDefinition {
  name: string;          // 模型名称，如 "GPT-4"
  code: string;          // 模型代码，如 "gpt-4"
  description?: string;  // 模型描述
  capabilities?: string[]; // 模型能力，如 ["chat", "completion"]
  contextWindow?: number; // 上下文窗口大小，如 8192
  maxTokens?: number;    // 最大token数，如 2048
  isEnabled: boolean;    // 是否启用该模型
}

// 供应商配置类型定义
export type ProviderConfig = {
  requestMapping: {
    model: string;
    messages: string;
    temperature: string;
    maxTokens: string;
  };
  responseMapping: {
    content: string;
    usage: string;
    error: string;
  };
};

export type ProviderConfigs = {
  [key: string]: ProviderConfig;
};

// 供应商预设配置
export const PROVIDER_CONFIGS: ProviderConfigs = {
  zhipu: {
    requestMapping: {
      model: 'model',
      messages: 'messages',
      temperature: 'temperature',
      maxTokens: 'max_tokens'
    },
    responseMapping: {
      content: 'data.choices[0].content',
      usage: 'data.usage.total_tokens',
      error: 'error.message'
    }
  },
  openai: {
    requestMapping: {
      model: 'model',
      messages: 'messages',
      temperature: 'temperature',
      maxTokens: 'max_tokens'
    },
    responseMapping: {
      content: 'choices[0].message.content',
      usage: 'usage.total_tokens',
      error: 'error.message'
    }
  }
};

// 模型定义Schema
const ModelDefinitionSchema = new Schema<IModelDefinition>({
  name: { 
    type: String, 
    required: true
  },
  code: { 
    type: String, 
    required: true
  },
  description: { 
    type: String
  },
  capabilities: { 
    type: [String]
  },
  contextWindow: { 
    type: Number
  },
  maxTokens: { 
    type: Number
  },
  isEnabled: { 
    type: Boolean, 
    default: true
  }
}, {
  _id: false
});

// 模型提供商接口
interface IModelProvider extends Document {
  name: string;          // 供应商名称，如 "OpenAI"
  identifier: string;    // 供应商标识，如 "openai"
  baseUrl: string;       // API完整URL地址
  apiKey: string;        // API密钥
  isActive: boolean;     // 是否启用该供应商
  tokenUsage: number;    // token使用量统计
  authType: string;      // 认证类型，如 "bearer"
  headers: Record<string, string>; // 自定义请求头
  requestMapping: {      // 请求参数映射配置
    model: string;       // 模型参数字段名
    messages: string;    // 消息参数字段名
    temperature: string; // 温度参数字段名
    maxTokens: string;   // 最大token参数字段名
  };
  responseMapping: {     // 响应结果映射配置
    content: string;     // 内容字段路径
    usage: string;       // 用量字段路径
    error: string;       // 错误字段路径
  };
  models: IModelDefinition[]; // 支持的模型列表
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}

// 模型提供商Schema
const ModelProviderSchema = new Schema<IModelProvider>({
  name: { 
    type: String, 
    required: true
  },
  identifier: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true
  },
  baseUrl: { 
    type: String, 
    required: true
  },
  apiKey: { 
    type: String, 
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true
  },
  tokenUsage: { 
    type: Number, 
    default: 0
  },
  authType: { 
    type: String, 
    default: 'bearer'
  },
  headers: { 
    type: Map, 
    of: String,
    default: {}
  },
  requestMapping: {
    model: { type: String },
    messages: { type: String },
    temperature: { type: String },
    maxTokens: { type: String }
  },
  responseMapping: {
    content: { type: String },
    usage: { type: String },
    error: { type: String }
  },
  models: [ModelDefinitionSchema]
}, {
  timestamps: true,
  collection: 'model_providers',
  collation: { locale: 'zh' }
});

// 创建索引
ModelProviderSchema.index({ identifier: 1 }, { 
  unique: true,
  name: 'identifier_index'
});

ModelProviderSchema.index({ isActive: 1 }, {
  name: 'active_status_index'
});

// 在保存前加密 API Key
ModelProviderSchema.pre('save', async function(next) {
  if (this.isModified('apiKey')) {
    // TODO: 实现 API Key 的加密存储
    // this.apiKey = await encrypt(this.apiKey);
  }
  next();
});

export const ModelProvider = model<IModelProvider>('ModelProvider', ModelProviderSchema);
export type { IModelProvider, IModelDefinition }; 