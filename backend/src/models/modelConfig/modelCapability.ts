import { Schema, model } from 'mongoose';

// 模型能力表
const ModelCapabilitySchema = new Schema({
  modelId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ProviderModel',
    required: true,
    description: '所属模型ID'
  },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'image', 'audio', 'embedding'],
    description: '能力类型'
  },
  name: { 
    type: String, 
    required: true,
    description: '能力名称'
  },
  description: { 
    type: String,
    description: '能力描述'
  },
  parameters: [{
    name: { 
      type: String,
      description: '参数名称'
    },
    type: { 
      type: String, 
      enum: ['string', 'number', 'boolean', 'enum'],
      description: '参数类型'
    },
    required: { 
      type: Boolean,
      description: '是否必填'
    },
    default: { 
      type: Schema.Types.Mixed,
      description: '默认值'
    },
    validation: {
      min: { 
        type: Number,
        description: '最小值'
      },
      max: { 
        type: Number,
        description: '最大值'
      },
      pattern: { 
        type: String,
        description: '正则表达式'
      },
      options: { 
        type: [String],
        description: '可选值列表'
      }
    },
    description: { 
      type: String,
      description: '参数说明'
    }
  }]
}, {
  timestamps: true,
  collection: 'model_capabilities'  // 明确指定集合名称
});

// 创建索引
ModelCapabilitySchema.index({ modelId: 1, type: 1 });

export const ModelCapability = model('ModelCapability', ModelCapabilitySchema);
