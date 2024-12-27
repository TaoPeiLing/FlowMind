import { Schema, model, models } from 'mongoose';

// 模型供应商表
const ModelProviderSchema = new Schema({
  identifier: { 
    type: String, 
    required: true, 
    unique: true,  // 这里已经创建了唯一索引
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
      description: '认证密钥名称'
    },
    value: { 
      type: String,
      description: '认证密钥值'
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
    }
  }],
  config: {
    headers: { 
      type: Map, 
      of: String,
      description: '自定义请求头'
    },
    rateLimit: {
      maxRequests: { 
        type: Number,
        description: '最大请求数'
      },
      window: { 
        type: Number,
        description: '时间窗口（秒）'
      }
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'modelproviders'  // 使用现有的集合名称
});

// 创建索引 - 只保留 isActive 索引，因为 identifier 已经通过 unique: true 创建了索引
ModelProviderSchema.index({ isActive: 1 });

// 使用 models 对象避免重复编译
export const ModelProvider = models.ModelProvider || model('ModelProvider', ModelProviderSchema);
