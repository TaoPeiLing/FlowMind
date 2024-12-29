import express from 'express';
import cors from 'cors';
import modelProviderRouter from './routes/modelProvider';
import authRouter from './routes/auth';
import { initializeModels } from './models/init';

const app = express();

// CORS 配置
const allowedOrigins = ['http://localhost:4000', 'http://127.0.0.1:4000'];

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有 origin 的请求（比如同源请求）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
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

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;