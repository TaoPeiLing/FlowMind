import { Schema, model, models } from 'mongoose';

// 模型供应商表
const ModelProviderSchema = new Schema({
  identifier: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    description: '供应商唯一标识符'
  },
  name: { 
    type: String, 
    required: true,
    description: '供应商名称'
  },
  baseUrl: { 
    type: String, 
    required: true,
    description: 'API基础地址'
  },
  apiKey: { 
    type: String, 
    required: true,
    select: false,
    description: 'API密钥'
  },
  isActive: { 
    type: Boolean, 
    default: false,
    description: '是否启用'
  },
  auth: {
    type: { 
      type: String, 
      enum: ['none', 'basic', 'bearer', 'apikey'],
      default: 'bearer',
      description: '认证类型'
    },
    location: {
      type: String,
      enum: ['header', 'query', 'body'],
      default: 'header',
      description: '认证信息位置'
    },
    keyName: { 
      type: String,
      default: 'Authorization',
      description: '认证密钥名称'
    }
  },
  models: [{
    code: { 
      type: String, 
      required: true,
      description: '模型代码'
    },
    name: { 
      type: String, 
      required: true,
      description: '模型名称'
    },
    description: { 
      type: String,
      description: '模型描述'
    },
    isEnabled: { 
      type: Boolean, 
      default: true,
      description: '是否启用'
    },
    parameters: {
      temperature: {
        type: Number,
        default: 0.7,
        description: '温度参数'
      },
      top_p: {
        type: Number,
        default: 1.0,
        description: 'Top P参数'
      }
    }
  }],
  config: {
    headers: { 
      type: Map, 
      of: String,
      description: '自定义请求头'
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'modelproviders'
});

// 创建索引
ModelProviderSchema.index({ isActive: 1 });

// 使用 models 对象避免重复编译
export const ModelProvider = models.ModelProvider || model('ModelProvider', ModelProviderSchema);
