// 待办事项本地存储管理

import { Todo, Priority, SortBy } from '@/types/todo';

const STORAGE_KEY = 'todos_app_data';

// 从本地存储获取所有待办事项
export const getTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('读取待办事项失败:', error);
    return [];
  }
};

// 保存待办事项到本地存储
export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('保存待办事项失败:', error);
  }
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 创建新的待办事项
export const createTodo = (
  title: string, 
  deadline: string, 
  priority: Priority
): Todo => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title.trim(),
    deadline,
    priority,
    completed: false,
    createdAt: now,
    updatedAt: now
  };
};

// 添加待办事项
export const addTodo = (
  title: string, 
  deadline: string, 
  priority: Priority
): Todo[] => {
  const todos = getTodos();
  const newTodo = createTodo(title, deadline, priority);
  const updatedTodos = [newTodo, ...todos];
  saveTodos(updatedTodos);
  return updatedTodos;
};

// 更新待办事项
export const updateTodo = (
  id: string, 
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
): Todo[] => {
  const todos = getTodos();
  const updatedTodos = todos.map(todo => 
    todo.id === id 
      ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
      : todo
  );
  saveTodos(updatedTodos);
  return updatedTodos;
};

// 删除待办事项
export const deleteTodo = (id: string): Todo[] => {
  const todos = getTodos();
  const updatedTodos = todos.filter(todo => todo.id !== id);
  saveTodos(updatedTodos);
  return updatedTodos;
};

// 切换完成状态
export const toggleTodo = (id: string): Todo[] => {
  const todos = getTodos();
  const updatedTodos = todos.map(todo =>
    todo.id === id 
      ? { 
          ...todo, 
          completed: !todo.completed, 
          updatedAt: new Date().toISOString() 
        }
      : todo
  );
  saveTodos(updatedTodos);
  return updatedTodos;
};

// 排序待办事项
export const sortTodos = (todos: Todo[], sortBy: SortBy): Todo[] => {
  const sorted = [...todos];
  
  switch (sortBy) {
    case 'deadline':
      // 按截止日期排序（越早越靠前）
      return sorted.sort((a, b) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    
    case 'priority':
      // 按优先级排序（高优先级在前）
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return sorted.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    
    case 'created':
    default:
      // 按创建时间排序（最新的在前）
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
};