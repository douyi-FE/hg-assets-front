// @ts-ignore
/* eslint-disable */

/**
 * SSO相关接口
 * */

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
    }
  );
  
  return response.data;
} 