import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import passwordRoutes from './routes/password.routes';

// 加载环境变量
dotenv.config();

const app = express();

// MongoDB 连接配置
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  family: 4 // 强制使用 IPv4
};

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowmind', mongoOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    // 初始化数据库
    initializeDatabase();
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

// 初始化数据库
async function initializeDatabase() {
  try {
    // 这里可以添加一些初始化操作，比如创建索引等
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// CORS 配置
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FlowMind API' });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 