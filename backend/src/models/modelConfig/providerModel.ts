import { Schema, model } from 'mongoose';

// 供应商模型表
const ProviderModelSchema = new Schema({
  providerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ModelProvider',
    required: true,
    description: '所属供应商ID'
  },
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
  usage: {
    tokens: { 
      type: Number, 
      default: 0,
      description: 'Token使用量'
    },
    requests: { 
      type: Number, 
      default: 0,
      description: '请求次数'
    },
    lastUsed: { 
      type: Date,
      description: '最后使用时间'
    }
  }
}, {
  timestamps: true,
  collection: 'provider_models'  // 明确指定集合名称
});

// 创建索引
ProviderModelSchema.index({ providerId: 1, code: 1 }, { unique: true });
ProviderModelSchema.index({ isEnabled: 1 });

export const ProviderModel = model('ProviderModel', ProviderModelSchema);
