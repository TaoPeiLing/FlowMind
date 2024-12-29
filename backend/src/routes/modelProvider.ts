import { Router } from 'express';
import { ModelProviderController } from '../controllers/modelProvider';
import { adminAuth } from '../middleware/auth';  // 修正引用路径

const router = Router();

// 基础 CRUD 操作
router.get('/', ModelProviderController.getProviders);
router.post('/', adminAuth, ModelProviderController.createProvider);
router.put('/:id', adminAuth, ModelProviderController.updateProvider);
router.delete('/:id', adminAuth, ModelProviderController.deleteProvider);

// 供应商状态管理
router.patch('/:id/status', adminAuth, ModelProviderController.updateStatus);

// 模型管理
router.get('/:id/models', ModelProviderController.getModels);
router.put('/:id/models', adminAuth, ModelProviderController.updateModels);

// 连接测试
router.post('/:id/test', ModelProviderController.testConnection);

export default router;