import { Schema, model, Document } from 'mongoose';

// 模型参数 Schema
const ModelParameterSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['string', 'number', 'boolean', 'enum']
  },
  required: { type: Boolean, default: false },
  default: { type: Schema.Types.Mixed },
  min: { type: Number },
  max: { type: Number },
  options: [String],
  description: { type: String }
});

// 模型能力 Schema
const ModelCapabilitySchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'image', 'audio', 'embedding']
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  parameters: [ModelParameterSchema]
});

// 映射配置 Schema
const MappingSchema = new Schema({
  path: { type: String, required: true },
  transform: { type: String }
});

// 模型定义 Schema
const ModelDefinitionSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  isEnabled: { type: Boolean, default: true },
  capabilities: [ModelCapabilitySchema],
  parameters: [ModelParameterSchema],
  inputMapping: { type: Map, of: MappingSchema },
  outputMapping: { type: Map, of: MappingSchema },
  providerId: { type: Schema.Types.ObjectId, ref: 'ModelProvider' },
  tokenUsage: { type: Number, default: 0 }
});

// 供应商配置 Schema
const ProviderConfigSchema = new Schema({
  requestMapping: { type: Map, of: MappingSchema },
  responseMapping: { type: Map, of: MappingSchema },
  headers: { type: Map, of: String }
});

// 模型提供商 Schema
const ModelProviderSchema = new Schema({
  identifier: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true 
  },
  baseUrl: { 
    type: String, 
    required: true 
  },
  apiKey: { 
    type: String, 
    required: true,
    select: false  // 默认不返回 apiKey
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
  config: { 
    type: ProviderConfigSchema, 
    required: true 
  },
  models: [ModelDefinitionSchema],
  tokenUsage: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,  // 添加 createdAt 和 updatedAt
  versionKey: false  // 不使用 __v
});

// 索引
ModelProviderSchema.index({ isActive: 1 });
ModelProviderSchema.index({ 'models.code': 1 });

export interface IModelProvider extends Document {
  identifier: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
  config: {
    requestMapping: Map<string, { path: string; transform?: string }>;
    responseMapping: Map<string, { path: string; transform?: string }>;
    headers?: Map<string, string>;
  };
  models: Array<{
    code: string;
    name: string;
    description?: string;
    isEnabled: boolean;
    capabilities: Array<{
      type: 'text' | 'image' | 'audio' | 'embedding';
      name: string;
      description: string;
      parameters: Array<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'enum';
        required: boolean;
        default?: any;
        min?: number;
        max?: number;
        options?: string[];
        description?: string;
      }>;
    }>;
    parameters: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'enum';
      required: boolean;
      default?: any;
      min?: number;
      max?: number;
      options?: string[];
      description?: string;
    }>;
    inputMapping: Map<string, { path: string; transform?: string }>;
    outputMapping: Map<string, { path: string; transform?: string }>;
    providerId?: string;
    tokenUsage?: number;
  }>;
  tokenUsage: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ModelProvider = model<IModelProvider>('ModelProvider', ModelProviderSchema);