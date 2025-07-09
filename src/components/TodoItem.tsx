// 单个待办事项显示组件

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  EditIcon, 
  TrashIcon, 
  CalendarIcon, 
  ClockIcon,
  AlertCircleIcon 
} from 'lucide-react';
import { Todo, PRIORITY_CONFIG } from '@/types/todo';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;                                    // 待办事项数据
  onEdit: (todo: Todo) => void;                 // 编辑回调
  onDelete: (id: string) => void;               // 删除回调
  onToggle: (id: string) => void;               // 切换完成状态回调
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onEdit,
  onDelete,
  onToggle
}) => {
  // 格式化日期显示
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `已逾期 ${Math.abs(diffDays)} 天`;
    } else if (diffDays === 0) {
      return '今天截止';
    } else if (diffDays === 1) {
      return '明天截止';
    } else {
      return `${diffDays} 天后截止`;
    }
  };

  // 检查是否逾期
  const isOverdue = (): boolean => {
    const deadline = new Date(todo.deadline);
    const now = new Date();
    return deadline < now && !todo.completed;
  };

  // 检查是否即将到期（3天内）
  const isDueSoon = (): boolean => {
    const deadline = new Date(todo.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && !todo.completed;
  };

  const priorityConfig = PRIORITY_CONFIG[todo.priority];
  const overdue = isOverdue();
  const dueSoon = isDueSoon();

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        todo.completed && "opacity-75",
        overdue && "border-destructive bg-destructive/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* 完成状态复选框 */}
          <div className="flex items-center pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle(todo.id)}
              className="h-5 w-5"
            />
          </div>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            {/* 任务标题 */}
            <h3 
              className={cn(
                "text-lg font-medium mb-2 break-words",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </h3>

            {/* 任务信息 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* 截止日期 */}
              <div className={cn(
                "flex items-center gap-1",
                overdue && "text-destructive font-medium",
                dueSoon && "text-yellow-600 font-medium"
              )}>
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(todo.deadline)}</span>
                {overdue && <AlertCircleIcon className="h-4 w-4" />}
              </div>

              {/* 优先级标签 */}
              <Badge 
                variant="secondary"
                className={cn(
                  `bg-${priorityConfig.color} text-${priorityConfig.textColor}`,
                  "font-medium"
                )}
              >
                {priorityConfig.label}
              </Badge>

              {/* 创建时间 */}
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>
                  创建于 {new Date(todo.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              className="h-8 w-8 p-0 hover:bg-primary/10"
              title="编辑任务"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="删除任务"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 逾期警告 */}
        {overdue && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <span className="font-medium">此任务已逾期，请尽快处理！</span>
            </div>
          </div>
        )}

        {/* 即将到期提醒 */}
        {dueSoon && !overdue && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <ClockIcon className="h-4 w-4" />
              <span className="font-medium">任务即将到期，请注意时间安排</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};