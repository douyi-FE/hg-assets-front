<template>
  <div class="sso-container">
    <div class="sso-loading">
      <a-spin size="large" :spinning="loading">
        <div class="loading-content">
          <div class="loading-icon">
            <a-icon type="sync" spin />
          </div>
          <div class="loading-text">
            {{ loadingText }}
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user';
import Api from '@/api/';

const userStore = useUserStore();
const loading = ref(true);
const loadingText = ref('正在处理单点登录...');

// 处理SSO跳转
const handleSSO = async () => {
  try {
    loadingText.value = '正在获取用户Token...';
    
    // 1. 获取当前用户的token
    const currentToken = userStore.token;
    if (!currentToken) {
      throw new Error('用户未登录，请先登录');
    }

    loadingText.value = '正在转换Token...';
    
    // 2. 调用Node.js Token转换接口
    const tokenResponse = await Api.sso.convertTokenToOAuth2({
      token: currentToken
    });

    if (!tokenResponse.success || !tokenResponse.oauth2Token) {
      throw new Error('Token转换失败');
    }

    loadingText.value = '正在登录Java系统...';
    
    // 3. 调用Java单点登录接口
    const javaResponse = await Api.sso.javaSSOLogin(tokenResponse.oauth2Token);

    // Java系统返回code为0表示成功
    if (javaResponse.code !== 0) {
      throw new Error(`Java系统登录失败: ${javaResponse.msg || '未知错误'}`);
    }

    loadingText.value = '正在跳转到Java系统...';
    
    // 4. 跳转到Java前端页面
    const javaToken = javaResponse.data.accessToken;
    const javaUrl = `http://localhost/index?token=${encodeURIComponent(javaToken)}`;
    
    // 延迟一下让用户看到最后的加载状态
    setTimeout(() => {
      window.location.href = javaUrl;
    }, 1000);

  } catch (error: any) {
    loading.value = false;
    const errorMessage = error.response?.data?.message || error.message || '单点登录失败，请重试';
    message.error(errorMessage);
    console.error('SSO Error:', error);
  }
};

onMounted(() => {
  handleSSO();
});
</script>

<style scoped>
.sso-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sso-loading {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #1890ff;
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin-top: 16px;
}
</style>
