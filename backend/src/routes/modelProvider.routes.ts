import { Router } from 'express';
import { ModelProviderController } from '../controllers/modelProvider';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// 获取所有供应商
router.get('/', adminAuth, ModelProviderController.getProviders);

// 创建供应商
router.post('/', adminAuth, ModelProviderController.createProvider);

// 更新供应商状态
router.patch('/:id/status', adminAuth, ModelProviderController.updateStatus);

// 删除供应商
router.delete('/:id', adminAuth, ModelProviderController.deleteProvider);

// 测试供应商连接
router.post('/:id/test', adminAuth, ModelProviderController.testConnection);

export default router; 