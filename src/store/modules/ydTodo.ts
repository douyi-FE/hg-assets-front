import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getMyTasks } from '@/api/backend/api/workspace';

// 流程（芋道）待办事项
export const useYdTodoStore = defineStore('ydTodo', () => {
  const todoList = ref<{ list: any[]; total: number }>({ list: [], total: 0 });

  const getTodoList = async (time = Date.now()) => {
    requestIdleCallback(
      async () => {
        if (Date.now() - time > 5000) {
          const res: any = await getMyTasks({
            pageNo: 1,
            pageSize: 100,
          });
          if (res.code === 0) {
            todoList.value = res.data;
          }
          time = Date.now();
        }
        getTodoList(time);
      },
      { timeout: 5000 },
    );
  };

  return {
    todoList,
    getTodoList,
  };
});
