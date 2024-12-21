import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function createTestUser() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowmind');
    console.log('Connected to MongoDB');

    // 创建测试用户数据
    const testUser = {
      username: 'test',
      email: 'test@flowmind.com',
      password: 'test123'
    };

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.disconnect();
      return;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // 创建新用户
    const user = new User({
      username: testUser.username,
      email: testUser.email,
      password: hashedPassword
    });

    await user.save();
    console.log('Test user created successfully');

    // 断开数据库连接
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// 运行脚本
createTestUser(); 