import axios from 'axios';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

export const getMyTasks = async (params: any) => {
  // return request<any>('/admin-api/bpm/process-instance/my-page', {
  //   method: 'GET',
  //   params,
  //   headers: {
  //     Authorization: `Bearer ${userStore.yudaoToken.accessToken}`,
  //   },
  // });
  const res = await axios.get('/admin-api/bpm/process-instance/my-page', {
    params,
    headers: {
      Authorization: `Bearer ${userStore.yudaoToken.accessToken}`,
    },
  });
  return res.data;
};
