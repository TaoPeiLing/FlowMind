import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// 登录
router.post('/login', login);

// 注册
router.post('/register', register);

export default router; 