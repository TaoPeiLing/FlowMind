# 任务压力驱动 LLM 功能设计文档

## 1. 功能概述

### 1.1 背景
在现有的任务管理系统中，我们已经实现了情感分析和三种驱动力（压力驱动、目标驱动、常规驱动）的基础功能。为了进一步提升用户体验和任务管理效率，我们计划在压力驱动型任务中集成 LLM 能力。

### 1.2 目标
- 通过 LLM 自然引导用户创建任务
- 在任务创建过程中收集用户情感数据
- 提供智能化的任务分解和情感支持
- 确保用户体验的自然性和流畅性

## 2. 功能设计

### 2.1 对话引导系统

#### 2.1.1 对话入口设计
```typescript
interface DialogueEntry {
  initialPrompt: {
    type: 'open_ended' | 'guided';
    content: string;
    examples: string[];
  };

  samplePrompts: [
    "最近有什么事情让你觉得特别需要处理吗？",
    "有什么任务让你感到压力吗？",
    "想聊聊最近的工作情况吗？"
  ];
}
```

#### 2.1.2 对话流程设计
```typescript
interface DialogueFlow {
  // 第一阶段：开放倾诉
  openDiscussion: {
    prompt: string;
    userResponse: string;
    analysis: {
      emotionalKeywords: string[];
      pressureIndicators: string[];
      taskHints: string[];
    };
  };

  // 第二阶段：温和引导
  guidedDiscussion: {
    followUpQuestions: Array<{
      question: string;
      purpose: 'task_clarification' | 'emotional_exploration' | 'priority_setting';
      context: string;
    }>;
  };

  // 第三阶段：任务具象化
  taskCrystallization: {
    suggestedTasks: Array<{
      title: string;
      emotionalContext: string;
      priority: number;
      source: string;
    }>;
  };
}
```

### 2.2 情感数据收集

#### 2.2.1 数据收集结构
```typescript
interface EmotionalDataCollection {
  // 显式数据收集
  explicitData: {
    directStatements: string[];
    responseToQuestions: string[];
  };

  // 隐式数据收集
  implicitData: {
    languagePatterns: {
      emotionalWords: string[];
      intensityIndicators: string[];
      pressureSignals: string[];
    };
    behavioralMetrics: {
      responseTime: number;
      editingPatterns: string[];
      interactionFlow: string[];
    };
  };

  // 上下文关联
  contextualData: {
    timeOfDay: string;
    previousTasks: string[];
    environmentalFactors: string[];
  };
}
```

### 2.3 LLM 提示词设计

```typescript
interface PromptTemplate {
  // 基础提示模板
  basePrompt: `我是你的任务助手。请告诉我最近有什么事情需要处理？
               你可以像跟朋友聊天一样，告诉我具体的情况。`;

  // 后续对话模板
  followUpTemplates: {
    taskExploration: `我注意到你提到了 {identified_topic}，
                      能具体说说这件事情吗？`;
    
    emotionalSupport: `听起来 {emotional_keyword} 这件事让你感到 {emotion}，
                       我们一起来想想该怎么处理吧。`;
    
    taskFormation: `根据你的描述，我们可以把这件事拆分成几个部分来处理，
                    你觉得这样安排怎么样？`;
  };

  // 总结模板
  summaryTemplate: `让我帮你梳理一下：
                    1. 主要需要处理的事情是：{tasks}
                    2. 目前最让你关注的是：{priorities}
                    3. 建议的处理顺序是：{suggested_order}
                    你觉得这样的安排合适吗？`;
}
```

## 3. 实现重点

### 3.1 自然引导机制
- 避免直接询问情感状态
- 通过自然对话引导用户表达
- 在任务描述中提取情感信息

### 3.2 数据收集策略
- 显式情感数据（用户直接表达）
- 隐式情感数据（语言分析）
- 行为数据（交互模式）

### 3.3 用户体验优化
- 对话式交互界面
- 及时的情感支持和反馈
- 渐进式的任务分解

## 4. 示例对话流程

```typescript
const dialogueExample = {
  assistant: "最近有什么事情需要处理吗？可以跟我聊聊。",
  
  user: "最近项目deadline快到了，还有很多事情没做完...",
  
  assistant: "听起来你对项目进度有些担心。能具体说说是哪些部分还没完成吗？",
  
  user: "主要是测试和文档还没做，还有一些bug修复...",
  
  assistant: "我理解这种压力。让我们一起整理一下：
    1. 看起来有三个主要任务：测试、文档和bug修复
    2. 考虑到deadline，我们可以先确定优先级
    你觉得这些任务中，哪个最让你担心？"
};
```

## 5. 后续计划

### 5.1 近期目标
- 实现基础对话引导功能
- 完善情感数据收集机制
- 优化用户交互体验

### 5.2 长期规划
- 基于收集的数据优化情感分析
- 完善任务分解算法
- 提升 LLM 对话质量

## 6. 注意事项

### 6.1 开发原则
- 遵循最小修改原则
- 保护现有功能完整性
- 确保代码结构清晰

### 6.2 测试要点
- 对话流程的自然性
- 情感数据收集的准确性
- 任务创建的完整性
- 用户体验的流畅性 