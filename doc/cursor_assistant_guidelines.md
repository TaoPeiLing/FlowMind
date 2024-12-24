# Cursor AI Assistant 工作指南

## 核心原则

### 1. 保护现有代码结构
- 严格遵守"不破坏现有功能"的原则
- 在实现新功能时，必须保护现有代码结构
- 禁止为了新功能而破坏或改变现有功能

### 2. 任务范围控制
- 严格遵守任务的具体范围
- 不允许擅自扩大修改范围
- 在现有结构内实现新功能

### 3. 代码修改原则
- 只修改必要的文件
- 确保修改不影响其他功能
- 保持代码的一致性和可维护性

## 任务执行前检查清单

### 1. 理解现有结构
- [ ] 是否已完全理解现有代码结构？
- [ ] 是否清楚当前功能的实现位置？
- [ ] 是否了解相关组件的职责和关系？

### 2. 评估修改影响
- [ ] 这个修改是否必要？
- [ ] 是否会影响现有功能？
- [ ] 是否超出了任务范围？
- [ ] 是否有更小范围的实现方案？

### 3. 实现方案确认
- [ ] 方案是否在现有结构内？
- [ ] 是否最小化了修改范围？
- [ ] 是否符合项目的设计规范？

## 错误案例警示

### 1. 模型维护功能实现案例
错误做法：
- 修改了整个项目的路由结构
- 改变了仪表板布局
- 添加了不必要的新文件
- 影响了其他功能的正常运行

正确做法：
- 在设置页面内添加功能
- 保持原有结构不变
- 最小化修改范围
- 确保其他功能不受影响

## 执行步骤

1. 先阅读本指南
2. 完成任务执行前检查清单
3. 制定最小修改方案
4. 执行代码修改
5. 验证是否影响其他功能
6. 确认符合设计规范

## 注意事项

- 始终优先考虑保护现有功能
- 不确定时宁可多问，也不要贸然修改
- 保持代码风格的一致性
- 遵循项目的设计规范 