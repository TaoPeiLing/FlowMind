import { Schema, model, Model, CallbackError, HydratedDocument, models } from 'mongoose';
import { IModelProvider } from '../types/modelProvider.types';

interface IModelProviderModel extends Model<IModelProvider> {
  findByIdWithAuth(id: string): Promise<HydratedDocument<IModelProvider> | null>;
}

const modelProviderSchema = new Schema({
  identifier: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  baseUrl: { type: String, required: true },
  apiKey: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: false },
  auth: {
    type: { type: String, enum: ['none', 'basic', 'bearer', 'apikey'], required: true },
    location: { type: String, enum: ['header', 'query', 'body'], required: true },
    keyName: { type: String },
    value: { type: String, select: false }
  },
  config: {
    headers: { type: Map, of: String },
    rateLimit: {
      maxRequests: { type: Number },
      window: { type: Number }
    }
  },
  models: [{
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    isEnabled: { type: Boolean, default: true },
    usage: {
      tokens: { type: Number, default: 0 },
      requests: { type: Number, default: 0 },
      lastUsed: Date
    }
  }]
}, {
  timestamps: true,
  collection: 'model_providers'
});

// 只保留 isActive 索引，因为 identifier 已经在 Schema 定义时创建了索引
modelProviderSchema.index({ isActive: 1 });

// 静态方法
modelProviderSchema.statics.findByIdWithAuth = async function(this: Model<IModelProvider>, id: string): Promise<HydratedDocument<IModelProvider> | null> {
  return this.findById(id).select('+auth.value +apiKey');
} as IModelProviderModel['findByIdWithAuth'];

// 导出模型
export const ModelProvider = models.ModelProvider || model<IModelProvider, IModelProviderModel>('ModelProvider', modelProviderSchema); 