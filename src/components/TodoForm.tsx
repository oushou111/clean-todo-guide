// 待办事项添加/编辑表单组件

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, PlusIcon, EditIcon } from 'lucide-react';
import { Todo, Priority, PRIORITY_CONFIG } from '@/types/todo';

interface TodoFormProps {
  onSubmit: (title: string, deadline: string, priority: Priority) => void;
  editingTodo?: Todo | null;               // 正在编辑的待办事项
  onCancel?: () => void;                   // 取消编辑回调
}

export const TodoForm: React.FC<TodoFormProps> = ({ 
  onSubmit, 
  editingTodo, 
  onCancel 
}) => {
  // 表单状态管理
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 编辑模式下填充表单数据
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDeadline(editingTodo.deadline.split('T')[0]); // 只取日期部分
      setPriority(editingTodo.priority);
    } else {
      // 重置表单
      setTitle('');
      setDeadline('');
      setPriority('medium');
    }
    setErrors({});
  }, [editingTodo]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = '请输入任务标题';
    }

    if (!deadline) {
      newErrors.deadline = '请选择截止日期';
    } else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.deadline = '截止日期不能早于今天';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 构造完整的日期时间字符串
      const fullDeadline = `${deadline}T23:59:59.999Z`;
      onSubmit(title, fullDeadline, priority);
      
      // 如果不是编辑模式，清空表单
      if (!editingTodo) {
        setTitle('');
        setDeadline('');
        setPriority('medium');
      }
    }
  };

  // 处理取消编辑
  const handleCancel = () => {
    setTitle('');
    setDeadline('');
    setPriority('medium');
    setErrors({});
    onCancel?.();
  };

  // 获取今天的日期字符串（用于date input的min属性）
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
        <CardTitle className="flex items-center gap-2">
          {editingTodo ? (
            <>
              <EditIcon className="h-5 w-5" />
              编辑任务
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5" />
              添加新任务
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任务标题 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              任务标题 *
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入任务标题..."
              className={`transition-colors ${errors.title ? 'border-destructive' : ''}`}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* 截止日期 */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium">
              截止日期 *
            </Label>
            <div className="relative">
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={getTodayString()}
                className={`transition-colors ${errors.deadline ? 'border-destructive' : ''}`}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.deadline && (
              <p className="text-sm text-destructive">{errors.deadline}</p>
            )}
          </div>

          {/* 重要程度 */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              重要程度
            </Label>
            <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择重要程度" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full bg-${config.color}`}
                      />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="flex-1"
              variant={editingTodo ? "default" : "default"}
            >
              {editingTodo ? '保存修改' : '添加任务'}
            </Button>
            
            {editingTodo && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-6"
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};