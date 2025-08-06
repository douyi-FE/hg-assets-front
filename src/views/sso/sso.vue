<template>
  <div class="sso-container">
    <div class="sso-loading" v-if="loading">
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
    <!-- 使用iframe显示目标页面 -->
    <div v-else class="iframe-container">
      <iframe :src="javaUrl" class="wh-full" frameborder="0" @load="onFrameLoad" ref="iframeRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';
  import Api from '@/api/';

  const userStore = useUserStore();
  const router = useRouter();
  const loading = ref(true);
  const loadingText = ref('正在处理登录信息...');
  const javaUrl = ref('');
  const iframeRef = ref<HTMLIFrameElement>();

  // 处理SSO跳转
  const handleSSO = async () => {
    try {
      loadingText.value = '正在获取用户Token...';

      // 1. 获取当前用户的token
      const currentToken = userStore.token;
      if (!currentToken) {
        throw new Error('未检测到登录信息，请先登录');
      }

      loadingText.value = '正在转换Token...';

      // 2. 调用Node.js Token转换接口
      const tokenResponse = await Api.sso.convertTokenToOAuth2({
        token: currentToken,
      });

      if (!tokenResponse.success || !tokenResponse.oauth2Token) {
        throw new Error('Token转换失败');
      }

      loadingText.value = '正在加载流程系统...';

      // 3. 调用Java单点登录接口
      const javaResponse = await Api.sso.javaSSOLogin(tokenResponse.oauth2Token);

      // Java系统返回code为0表示成功
      if (javaResponse.code !== 0) {
        throw new Error(`流程系统加载失败: ${javaResponse.msg || '未知错误'}`);
      }

      loadingText.value = '正在准备流程系统...';

      // 4. 设置Java前端页面URL
      const javaToken = javaResponse.data.accessToken;

      // 方案1: 使用URL参数传递token
      const baseUrl = 'http://localhost/bpm/manager/model';
      const urlWithToken = `${baseUrl}?token=${encodeURIComponent(javaToken)}&sso=true&timestamp=${Date.now()}`;

      // 方案2: 同时存储到localStorage作为备用
      localStorage.setItem('java_sso_token', javaToken);
      localStorage.setItem('java_sso_timestamp', Date.now().toString());

      javaUrl.value = urlWithToken;

      // 延迟一下让用户看到最后的加载状态
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    } catch (error: any) {
      loading.value = false;
      const errorMessage =
        error.response?.data?.message || error.message || '流程系统加载失败，请重试';
      message.error(errorMessage);
      console.error('SSO Error:', error);
    }
  };

  const onFrameLoad = () => {
    console.log('流程系统页面加载完成');

    // 检查是否需要重新传递token
    setTimeout(() => {
      const storedToken = localStorage.getItem('java_sso_token');
      const storedTimestamp = localStorage.getItem('java_sso_timestamp');

      if (storedToken && storedTimestamp) {
        const tokenAge = Date.now() - parseInt(storedTimestamp);
        // 如果token超过5分钟，清除它
        if (tokenAge > 5 * 60 * 1000) {
          localStorage.removeItem('java_sso_token');
          localStorage.removeItem('java_sso_timestamp');
        }
      }
    }, 2000);
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

  .iframe-container {
    width: 100%;
    height: 100vh;
    position: relative;
  }

  .iframe-container iframe {
    width: 100%;
    height: 100%;
    border: none;
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
