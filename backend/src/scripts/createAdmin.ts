import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowmind');
    console.log('Connected to MongoDB');

    // 创建或更新管理员账户
    const adminData = {
      username: 'admin',
      email: 'admin@flowmind.ai',
      password: await bcrypt.hash('admin123456', 10),
      role: UserRole.ADMIN
    };

    const admin = await User.findOneAndUpdate(
      { username: adminData.username },
      adminData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log('Admin account created/updated successfully:', admin.username);
    console.log('Please use the following credentials to login:');
    console.log('Username:', adminData.username);
    console.log('Password: admin123456');

  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin(); 