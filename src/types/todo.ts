// 待办事项数据类型定义

export type Priority = 'high' | 'medium' | 'low'; // 优先级：高/中/低

export interface Todo {
  id: string;                    // 唯一标识符
  title: string;                 // 任务标题
  deadline: string;             // 截止日期 (ISO 字符串格式)
  priority: Priority;           // 重要程度
  completed: boolean;           // 完成状态
  createdAt: string;           // 创建时间
  updatedAt: string;           // 更新时间
}

export type SortBy = 'deadline' | 'priority' | 'created'; // 排序方式

// 优先级显示配置
export const PRIORITY_CONFIG = {
  high: {
    label: '非常重要',
    color: 'priority-high',
    textColor: 'priority-high-foreground',
    order: 1
  },
  medium: {
    label: '普通',
    color: 'priority-medium', 
    textColor: 'priority-medium-foreground',
    order: 2
  },
  low: {
    label: '低',
    color: 'priority-low',
    textColor: 'priority-low-foreground',
    order: 3
  }
} as const;