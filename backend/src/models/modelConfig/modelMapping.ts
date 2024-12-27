import { Schema, model } from 'mongoose';

// 模型映射表
const ModelMappingSchema = new Schema({
  modelId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ProviderModel',
    required: true,
    description: '所属模型ID'
  },
  capabilityId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ModelCapability',
    description: '关联能力ID'
  },
  type: { 
    type: String, 
    enum: ['input', 'output'],
    required: true,
    description: '映射类型：输入/输出'
  },
  mappings: [{
    path: { 
      type: String, 
      required: true,
      description: '映射路径'
    },
    transform: { 
      type: String,
      description: '转换函数'
    },
    default: { 
      type: Schema.Types.Mixed,
      description: '默认值'
    },
    required: { 
      type: Boolean, 
      default: false,
      description: '是否必填'
    }
  }]
}, {
  timestamps: true,
  collection: 'model_mappings'  // 明确指定集合名称
});

// 创建索引
ModelMappingSchema.index({ modelId: 1, capabilityId: 1, type: 1 });

export const ModelMapping = model('ModelMapping', ModelMappingSchema);
