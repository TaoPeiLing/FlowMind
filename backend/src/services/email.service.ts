import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 创建邮件传输对象
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true, // 启用调试模式
  logger: true // 启用日志
});

// 验证邮件配置
transporter.verify(function(error, success) {
  if (error) {
    console.error('邮件服务配置错误:', error);
  } else {
    console.log('邮件服务配置成功，服务器已就绪');
  }
});

export const sendResetPasswordEmail = async (to: string, resetToken: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"心流 FlowMind" <${process.env.SMTP_USER}>`,
    to,
    subject: '重置您的密码 - 心流 FlowMind',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #4A90E2; text-align: center;">心流 FlowMind</h2>
        <p>您好，</p>
        <p>我们收到了重置您密码的请求。如果这不是您本人的操作，请忽略此邮件。</p>
        <p>点击下面的按钮重置您的密码：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(to right, #4A90E2, #50B86C);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;">
            重置密码
          </a>
        </div>
        <p>或者复制以下链接到浏览器：</p>
        <p style="word-break: break-all; color: #4A90E2;">${resetLink}</p>
        <p>此链接将在24小时后失效。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `
  };

  try {
    console.log('开始发送重置密码邮件...');
    console.log('邮件配置:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      to: to
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('重置密码邮件发送成功:', info);
    return info;
  } catch (error) {
    console.error('发送重置密码邮件失败:', error);
    throw new Error(error instanceof Error ? error.message : '发送重置密码邮件失败');
  }
}; 