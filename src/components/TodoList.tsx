// 待办事项列表组件

import React from 'react';
import { TodoItem } from './TodoItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  ListIcon, 
  SortAscIcon, 
  FilterIcon,
  CheckCircleIcon,
  CircleIcon,
  AlertTriangleIcon 
} from 'lucide-react';
import { Todo, SortBy, Priority } from '@/types/todo';
import { sortTodos } from '@/lib/todoStorage';

interface TodoListProps {
  todos: Todo[];                               // 待办事项列表
  onEdit: (todo: Todo) => void;               // 编辑回调
  onDelete: (id: string) => void;             // 删除回调
  onToggle: (id: string) => void;             // 切换完成状态回调
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onEdit,
  onDelete,
  onToggle
}) => {
  // 组件状态
  const [sortBy, setSortBy] = React.useState<SortBy>('created');
  const [filterCompleted, setFilterCompleted] = React.useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = React.useState<Priority | 'all'>('all');

  // 过滤和排序逻辑
  const getFilteredAndSortedTodos = (): Todo[] => {
    let filtered = [...todos];

    // 按完成状态过滤
    if (filterCompleted !== 'all') {
      filtered = filtered.filter(todo => 
        filterCompleted === 'completed' ? todo.completed : !todo.completed
      );
    }

    // 按优先级过滤
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }

    // 排序
    return sortTodos(filtered, sortBy);
  };

  // 统计信息
  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => {
      const deadline = new Date(todo.deadline);
      const now = new Date();
      return deadline < now && !todo.completed;
    }).length;

    return { total, completed, pending, overdue };
  };

  const filteredTodos = getFilteredAndSortedTodos();
  const stats = getStats();

  // 排序选项
  const sortOptions = [
    { value: 'created', label: '创建时间' },
    { value: 'deadline', label: '截止日期' },
    { value: 'priority', label: '重要程度' }
  ];

  // 优先级选项
  const priorityOptions = [
    { value: 'all', label: '全部优先级' },
    { value: 'high', label: '非常重要' },
    { value: 'medium', label: '普通' },
    { value: 'low', label: '低' }
  ];

  // 完成状态选项
  const statusOptions = [
    { value: 'all', label: '全部任务' },
    { value: 'pending', label: '待完成' },
    { value: 'completed', label: '已完成' }
  ];

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListIcon className="h-5 w-5" />
            任务概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总任务</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-priority-low">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-priority-medium">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">待完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-priority-high">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">已逾期</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 筛选和排序控制 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <SortAscIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">排序:</span>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">状态:</span>
              <Select 
                value={filterCompleted} 
                onValueChange={(value: 'all' | 'pending' | 'completed') => setFilterCompleted(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">优先级:</span>
              <Select 
                value={filterPriority} 
                onValueChange={(value: Priority | 'all') => setFilterPriority(value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 显示过滤结果数量 */}
            <Badge variant="secondary" className="ml-auto">
              显示 {filteredTodos.length} / {stats.total} 项
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                {todos.length === 0 ? (
                  <>
                    <CircleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">还没有任务</p>
                    <p className="text-sm">添加您的第一个待办事项开始管理任务吧！</p>
                  </>
                ) : (
                  <>
                    <FilterIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">没有找到匹配的任务</p>
                    <p className="text-sm">尝试调整筛选条件</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};