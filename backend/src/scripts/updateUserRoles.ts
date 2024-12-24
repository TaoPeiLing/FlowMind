import mongoose from 'mongoose';
import { User, UserRole } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const updateUserRoles = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowmind');
    console.log('Connected to MongoDB');

    // 使用 updateMany 批量更新角色
    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: { $ne: UserRole.ADMIN } }
        ]
      },
      { $set: { role: UserRole.USER } }
    );

    console.log(`Updated ${result.modifiedCount} users to role USER`);

  } catch (error) {
    console.error('Error updating user roles:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

updateUserRoles(); 