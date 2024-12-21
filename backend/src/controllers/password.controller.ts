import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { validateEmail } from '../utils/validators';
import { sendResetPasswordEmail } from '../services/email.service';

// 请求重置密码
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('收到重置密码请求:', email);

    // 验证邮箱格式
    if (!validateEmail(email)) {
      console.log('邮箱格式不正确:', email);
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      console.log('未找到用户:', email);
      return res.status(404).json({ message: '未找到该邮箱对应的用户' });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    // 更新用户的重置令牌和过期时间
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
    await user.save();
    console.log('用户重置令牌已更新:', email);

    // 发送重置密码邮件
    try {
      await sendResetPasswordEmail(email, resetToken);
      console.log('重置密码邮件发送成功:', email);
      res.json({ message: '重置密码链接已发送到您的邮箱' });
    } catch (emailError) {
      console.error('发送重置密码邮件失败:', emailError);
      // 重置用户的令牌
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      throw new Error('发送重置密码邮件失败，请稍后重试');
    }
  } catch (error) {
    console.error('请求重置密码错误:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : '发送重置密码邮件失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// 验证重置令牌
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    console.log('验证重置令牌:', token);
    
    // 查找具有有效重置令牌的用户
    const user = await User.findOne({
      resetPasswordToken: { $ne: null },
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('重置令牌无效或已过期');
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    // 验证令牌
    const isValid = await bcrypt.compare(token, user.resetPasswordToken!);
    if (!isValid) {
      console.log('重置令牌验证失败');
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    console.log('重置令牌验证成功');
    res.json({ message: '重置令牌有效' });
  } catch (error) {
    console.error('验证重置令牌错误:', error);
    res.status(500).json({ message: '验证重置令牌失败，请稍后重试' });
  }
};

// 重置密码
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    console.log('重置密码请求');

    // 查找具有有效重置令牌的用户
    const user = await User.findOne({
      resetPasswordToken: { $ne: null },
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('重置令牌无效或已过期');
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    // 验证令牌
    const isValid = await bcrypt.compare(token, user.resetPasswordToken!);
    if (!isValid) {
      console.log('重置令牌验证失败');
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    // 更新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('密码重置成功');
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '重置密码失败，请稍后重试' });
  }
}; 