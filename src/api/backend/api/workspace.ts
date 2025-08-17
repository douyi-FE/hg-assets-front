import axios from 'axios';
import { useUserStore } from '@/store/modules/user';

export const getMyTasks = async (params: any) => {
  const userStore = useUserStore();
  const res = await axios.get('/admin-api/bpm/task/todo-page', {
    params,
    headers: {
      Authorization: `Bearer ${userStore.yudaoToken.accessToken}`,
    },
  });
  return res.data;
};

export const getYuDaoFlowList = async (params = { suspensionState: 1 }) => {
  const userStore = useUserStore();
  const res = await axios.get('/admin-api/bpm/process-definition/list', {
    params,
    headers: {
      Authorization: `Bearer ${userStore.yudaoToken.accessToken}`,
    },
  });
  return res.data;
};
