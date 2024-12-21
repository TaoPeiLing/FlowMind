import mongoose from 'mongoose';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const initializeDatabase = async () => {
  try {
    // 连接数据库（不使用认证）
    await mongoose.connect('mongodb://localhost:27017/flowmind');
    console.log('Connected to MongoDB');

    // 检查是否已存在管理员用户
    const existingAdmin = await User.findOne({ email: 'admin@flowmind.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@flowmind.com',
      password: adminPassword,
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // 创建索引
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    console.log('Indexes created successfully');

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase(); 