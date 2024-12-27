import express from 'express';
import cors from 'cors';
import modelProviderRouter from './routes/modelProvider';
import authRouter from './routes/auth';
import { initializeModels } from './models/init';

const app = express();

// CORS 配置
app.use(cors({
  origin: 'http://localhost:4000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 处理 OPTIONS 预检请求
app.options('*', cors());

app.use(express.json());

// 初始化数据库模型
initializeModels();

// 路由
app.use('/api/auth', authRouter);
app.use('/api/model-providers', modelProviderRouter);

export default app;