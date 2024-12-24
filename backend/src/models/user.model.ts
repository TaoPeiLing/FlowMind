import mongoose from 'mongoose';

// 用户角色枚举
export enum UserRole {
  USER = 'user',    // 普通用户
  ADMIN = 'admin'   // 管理员
}

// 用户接口定义
export interface IUser extends mongoose.Document {
  username: string;               // 用户名
  email: string;                  // 电子邮箱
  password: string;               // 密码
  role: UserRole;                 // 用户角色
  resetPasswordToken?: string;    // 重置密码令牌
  resetPasswordExpires?: Date;    // 重置密码过期时间
  createdAt: Date;                // 创建时间
  updatedAt: Date;                // 更新时间
}

// 用户模型定义
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    comment: '用户名，唯一标识，至少3个字符'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    comment: '电子邮箱，用于登录和通知'
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    comment: '用户密码，经过加密存储，至少6个字符'
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    required: true,
    comment: '用户角色，可以是普通用户或管理员'
  },
  resetPasswordToken: {
    type: String,
    default: null,
    comment: '密码重置令牌，用于重置密码流程'
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    comment: '密码重置令牌的过期时间'
  }
}, {
  timestamps: true,  // 自动管理创建时间和更新时间
  collection: 'users', // 指定集合名称
  collation: { locale: 'zh' }, // 支持中文排序
  comment: '用户信息表，存储系统用户的基本信息和认证信息'
});

// 创建索引
userSchema.index({ email: 1 }, { 
  name: 'email_index',
  comment: '邮箱索引，用于邮箱登录和查询'
});
userSchema.index({ username: 1 }, {
  name: 'username_index',
  comment: '用户名索引，用于用户名登录和查询'
});

export const User = mongoose.model<IUser>('User', userSchema); 