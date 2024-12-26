import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import modelProviderRouter from './routes/modelProvider';
import authRouter from './routes/auth';

const app = express();

// CORS 配置
app.use(cors({
  origin: 'http://localhost:4000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 处理 OPTIONS 预检请求
app.options('*', cors());

app.use(express.json());

// 路由
app.use('/api/auth', authRouter);
app.use('/api/model-providers', modelProviderRouter);

// 数据库连接
mongoose.connect('mongodb://localhost:27017/flowmind')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

export default app; 