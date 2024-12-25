import express from 'express';
import { llmController } from '../controllers/LLMController';

const router = express.Router();

// 生成对话回复
router.post('/generate', llmController.generateResponse);

// 分析压力任务
router.post('/analyze-pressure', llmController.analyzePressureTask);

// 生成任务分解
router.post('/task-breakdown/:taskId', llmController.generateTaskBreakdown);

export default router; 