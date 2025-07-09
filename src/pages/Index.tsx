// 待办事项应用主页面

import React, { useState, useEffect } from 'react';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckSquareIcon, 
  RefreshCwIcon,
  DownloadIcon,
  UploadIcon 
} from 'lucide-react';
import { Todo, Priority } from '@/types/todo';
import { 
  getTodos, 
  addTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodo,
  saveTodos 
} from '@/lib/todoStorage';

const Index = () => {
  // 组件状态
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // 页面加载时获取待办事项数据
  useEffect(() => {
    const loadTodos = () => {
      try {
        const storedTodos = getTodos();
        setTodos(storedTodos);
      } catch (error) {
        console.error('加载待办事项失败:', error);
        toast({
          title: '加载失败',
          description: '无法加载待办事项数据',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [toast]);

  // 添加新的待办事项
  const handleAddTodo = (title: string, deadline: string, priority: Priority) => {
    try {
      const updatedTodos = addTodo(title, deadline, priority);
      setTodos(updatedTodos);
      toast({
        title: '任务已添加',
        description: `"${title}" 已成功添加到待办列表`
      });
    } catch (error) {
      console.error('添加任务失败:', error);
      toast({
        title: '添加失败',
        description: '无法添加新任务',
        variant: 'destructive'
      });
    }
  };

  // 编辑待办事项
  const handleEditTodo = (title: string, deadline: string, priority: Priority) => {
    if (!editingTodo) return;

    try {
      const updatedTodos = updateTodo(editingTodo.id, {
        title,
        deadline,
        priority
      });
      setTodos(updatedTodos);
      setEditingTodo(null);
      toast({
        title: '任务已更新',
        description: `"${title}" 已成功更新`
      });
    } catch (error) {
      console.error('更新任务失败:', error);
      toast({
        title: '更新失败',
        description: '无法更新任务',
        variant: 'destructive'
      });
    }
  };

  // 删除待办事项
  const handleDeleteTodo = (id: string) => {
    try {
      const todoToDelete = todos.find(todo => todo.id === id);
      const updatedTodos = deleteTodo(id);
      setTodos(updatedTodos);
      toast({
        title: '任务已删除',
        description: todoToDelete ? `"${todoToDelete.title}" 已被删除` : '任务已删除'
      });
    } catch (error) {
      console.error('删除任务失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除任务',
        variant: 'destructive'
      });
    }
  };

  // 切换完成状态
  const handleToggleTodo = (id: string) => {
    try {
      const updatedTodos = toggleTodo(id);
      setTodos(updatedTodos);
      
      const todo = todos.find(t => t.id === id);
      if (todo) {
        toast({
          title: todo.completed ? '任务取消完成' : '任务已完成',
          description: `"${todo.title}" ${todo.completed ? '已标记为待完成' : '已标记为完成'}`
        });
      }
    } catch (error) {
      console.error('切换任务状态失败:', error);
      toast({
        title: '操作失败',
        description: '无法更新任务状态',
        variant: 'destructive'
      });
    }
  };

  // 开始编辑
  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    // 滚动到表单顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  // 导出数据
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(todos, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todos-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: '导出成功',
        description: '待办事项数据已导出到文件'
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: '无法导出数据',
        variant: 'destructive'
      });
    }
  };

  // 导入数据
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTodos = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedTodos)) {
          saveTodos(importedTodos);
          setTodos(importedTodos);
          toast({
            title: '导入成功',
            description: `已导入 ${importedTodos.length} 个任务`
          });
        } else {
          throw new Error('文件格式不正确');
        }
      } catch (error) {
        console.error('导入失败:', error);
        toast({
          title: '导入失败',
          description: '文件格式不正确或数据损坏',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    // 重置文件输入
    event.target.value = '';
  };

  // 刷新数据
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const refreshedTodos = getTodos();
      setTodos(refreshedTodos);
      setIsLoading(false);
      toast({
        title: '数据已刷新',
        description: '待办事项列表已更新'
      });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquareIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  我的待办事项
                </h1>
                <p className="text-sm text-muted-foreground">
                  高效管理您的任务和时间
                </p>
              </div>
            </div>
            
            {/* 工具按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="hidden sm:flex"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                刷新
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="hidden sm:flex"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                导出
              </Button>
              
              <label className="hidden sm:block">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <UploadIcon className="h-4 w-4 mr-2" />
                    导入
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 待办事项表单 */}
        <TodoForm
          onSubmit={editingTodo ? handleEditTodo : handleAddTodo}
          editingTodo={editingTodo}
          onCancel={handleCancelEdit}
        />

        {/* 待办事项列表 */}
        <TodoList
          todos={todos}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTodo}
          onToggle={handleToggleTodo}
        />
      </main>

      {/* 页面底部 */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>💡 提示：数据自动保存在浏览器本地存储中</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
