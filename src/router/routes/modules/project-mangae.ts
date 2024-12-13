import type { RouteRecordRaw } from 'vue-router';
import { t } from '@/hooks/useI18n';

const moduleName = 'basis';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/basis',
    redirect: 'basis/project',
    name: moduleName,
    meta: {
      title: t('routes.project.basicInfo'),
      icon: 'ant-design:dashboard-outlined',
    },
    children: [
      {
        path: 'project',
        name: `${moduleName}-project`,
        meta: {
          title: t('routes.project.projectManage.flag'),
          icon: 'ant-design:dashboard-outlined',
        },
        component: () => import('@/views/basis/project-manage/index.vue'),
      },
    ],
  },
];

export default routes;
