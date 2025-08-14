// @ts-ignore
/* eslint-disable */

/**
 * SSO相关接口
 * */

import { useUserStore } from '@/store/modules/user';
import { request, type RequestOptions } from '@/utils/request';
import axios from 'axios';

/** Token转换接口 POST /api/oauth2-adapter/convert-to-oauth2 */
export async function convertTokenToOAuth2(body: { token: string }, options?: RequestOptions) {
  return request<API.OAuth2TokenResponse>('/api/oauth2-adapter/convert-to-oauth2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Java单点登录接口 POST /api/oauth2/sso/login */
export async function javaSSOLogin(body: API.OAuth2TokenResponse, options?: RequestOptions) {
  // 从环境变量获取Java系统地址，如果没有配置则使用默认值
  const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
  const response = await axios.post<API.JavaSSOResponse>(
    `${javaBaseURL}/admin-api/system/oauth2-sso/login`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'tenant-id': '1',
      },
      timeout: 60000,
      ...(options || {}),
    },
  );

  return response.data;
}

// 芋道中依据用户名获取tenantid
export async function getYuDaoTenantIdByUserName() {
  const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
  return axios
    .get(
      `${javaBaseURL}/admin-api/system/tenant/get-id-by-name?name=${import.meta.env.VITE_DEFAULT_FLOW_NAME}`,
    )
    .then((res) => res.data);
}

// 获取芋道的token
export async function getYuDaoToken(tenantId = 1) {
  const userStore = useUserStore();
  const userName = userStore.userInfo.username;
  const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
  return axios
    .post(
      `${javaBaseURL}/admin-api/system/auth/add-flow-user`,
      { userName },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'tenant-id': tenantId,
        },
      },
    )
    .then((res) => {
      if (res.data.code === 0) {
        return {
          ...res.data,
          data: {
            ...res.data.data,
            tenantId,
          },
        };
      } else {
        return res.data;
      }
    });
}

// 判断token是否有效
export async function isTokenValid(token = '') {
  const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
  const response = await axios.get(`${javaBaseURL}/admin-api/system/auth/get-permission-info`, {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// 刷新芋道token
export async function refreshYuDaoToken(refreshToken = '', token = '') {
  const userStore = useUserStore();
  const javaBaseURL = import.meta.env.VITE_JAVA_BASE_URL || 'http://127.0.0.1:48080';
  return axios.post(
    `${javaBaseURL}/admin-api/system/auth/refresh-token`,
    { refreshToken },
    {
      headers: {
        'tenant-id': userStore.yudaoToken.tenantId,
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
