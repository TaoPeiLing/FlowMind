# FlowMind - 心流

FlowMind（心流）是一个现代化的任务管理与时间追踪系统，旨在帮助用户实现高效工作和心流体验。

## 技术架构

### 前端技术栈

- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **状态管理**: Redux Toolkit
- **UI 组件**: 
  - Ant Design
  - TailwindCSS（自定义样式）
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **动画效果**: Framer Motion

### 后端技术栈

- **运行时**: Node.js
- **框架**: Express.js + TypeScript
- **数据库**: MongoDB
- **身份验证**: JWT (JSON Web Tokens)
- **密码加密**: bcrypt
- **邮件服务**: Nodemailer
- **API 文档**: Swagger/OpenAPI

### 项目结构

```
FlowMind/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Redux 状态管理
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   └── public/            # 静态资源
│
├── backend/                # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具函数
│   └── scripts/          # 数据库脚本
│
└── doc/                   # 项目文档
    ├── 产品说明.md
    ├── 产品品牌标识方案.md
    ├── MVP方案文档.md
    ├── 设计规范与视觉标准.md
    └── 版本管理策略.md
```

## 功能特性

### 用户认证

- [x] 邮箱注册
- [x] 邮箱登录
- [x] 密码重置（通过邮件）
- [x] JWT 身份验证
- [ ] 第三方登录（微信）- 开发中

### 任务管理

- [ ] 任务创建与编辑
- [ ] 任务分类与标签
- [ ] 任务优先级
- [ ] 任务截止日期
- [ ] 任务提醒

### 时间追踪

- [ ] 任务计时
- [ ] 专注模式
- [ ] 时间统计
- [ ] 效率分析

### 数据分析

- [ ] 工作效率分析
- [ ] 时间分配分析
- [ ] 进度追踪
- [ ] 数据可视化

## 数据模型

### User 模型
```typescript
{
  username: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task 模型（计划中）
```typescript
{
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  tags: string[];
  timeSpent: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 安装与运行

### 环境要求

- Node.js >= 16
- MongoDB >= 5.0
- npm >= 8.0

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量（创建 .env 文件）：
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/flowmind
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# 邮件服务配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your_email@qq.com
SMTP_PASS=your_email_auth_code
FRONTEND_URL=http://localhost:5173
```

4. 运行开发服务器：
```bash
npm run dev
```

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 运行开发服务器：
```bash
npm run dev
```

## API 文档

主要 API 端点：

- 认证相关
  - POST `/api/auth/register` - 用户注册
  - POST `/api/auth/login` - 用户登录
  - POST `/api/password/forgot` - 请求密码重置
  - GET `/api/password/reset/:token` - 验证重置令牌
  - POST `/api/password/reset` - 重置密码

- 任务相关（计划中）
  - GET `/api/tasks` - 获取任务列表
  - POST `/api/tasks` - 创建新任务
  - GET `/api/tasks/:id` - 获取任务详情
  - PUT `/api/tasks/:id` - 更新任务
  - DELETE `/api/tasks/:id` - 删除任务

## 部署

### 生产环境要求

- Node.js 生产环境
- MongoDB 数据库服务
- SMTP 邮件服务
- HTTPS 证书

### 构建命令

前端构建：
```bash
cd frontend && npm run build
```

后端构建：
```bash
cd backend && npm run build
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 版本控制

- 使用 Git 进行版本控制
- 遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范
- 使用 feature 分支进行功能开发
- 使用 develop 分支进行集成测试
- 使用 main 分支进行生产部署

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目维护者：[维护者姓名]
- 邮箱：[联系邮箱] 