import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 4001;

// 连接数据库
connectDB().then(() => {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});