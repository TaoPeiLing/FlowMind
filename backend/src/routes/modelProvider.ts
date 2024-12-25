import { Router } from 'express';
import { modelProviderController } from '../controllers/ModelProviderController';

const router = Router();

// 获取所有供应商
router.get('/', modelProviderController.getProviders);

// 获取单个供应商
router.get('/:id', modelProviderController.getProviderById);

// 创建供应商
router.post('/', modelProviderController.createProvider);

// 更新供应商
router.put('/:id', modelProviderController.updateProvider);

// 删除供应商
router.delete('/:id', modelProviderController.deleteProvider);

// 测试连接
router.post('/test-connection', modelProviderController.testConnection);

// 更新模型状态
router.patch('/:providerId/models/:modelCode', modelProviderController.updateModelStatus);

// 更新全局模型状态
router.patch('/global-status', modelProviderController.updateGlobalModelStatus);

export default router;