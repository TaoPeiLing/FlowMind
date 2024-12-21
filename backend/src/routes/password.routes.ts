import express from 'express';
import {
  requestPasswordReset,
  validateResetToken,
  resetPassword
} from '../controllers/password.controller';

const router = express.Router();

// 请求重置密码
router.post('/forgot', requestPasswordReset);

// 验证重置令牌
router.get('/reset/:token', validateResetToken);

// 重置密码
router.post('/reset', resetPassword);

export default router; 