import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import modelProviderRouter from './routes/modelProvider';
import authRouter from './routes/auth';

const app = express();

// 开发环境下允许所有跨域请求
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRouter);
app.use('/api/model-providers', modelProviderRouter);

// 数据库连接
mongoose.connect('mongodb://localhost:27017/flowmind')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

export default app; 