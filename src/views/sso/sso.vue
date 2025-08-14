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
      <iframe :src="javaUrl" class="wh-full" frameborder="0" ref="iframeRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';

  const router = useRouter();
  const loading = ref(true);
  const loadingText = ref('正在处理登录信息...');
  const javaUrl = ref('');
  const iframeRef = ref<HTMLIFrameElement>();

  const jumpToPath = (extSearch: string = '') => {
    const url = new URL(`${location.protocol}${location.host}${router.currentRoute.value.path}`);
    const search = new URLSearchParams(url.search);
    const path: string | null = search.get('path');
    const isOnlyContent = search.get('isOnlyContent');
    url &&
      (javaUrl.value = `${import.meta.env.VITE_FLOW_FRONT_DOMAIN}${path}?isOnlyContent=${isOnlyContent}${extSearch === '' ? '' : `&${extSearch}`}`);
    loading.value = false;
  };

  // 获取token
  const jumpToYuDaoPath = function () {
    const userStore = useUserStore();
    if (userStore.yudaoToken.accessToken) {
      const { accessToken, expiresTime, refreshToken, userId } = userStore.yudaoToken;
      const search = new URLSearchParams();
      search.append('accessToken', accessToken);
      search.append('expiresTime', expiresTime.toString());
      search.append('refreshToken', refreshToken);
      search.append('userId', userId);
      search.append('tenantId', import.meta.env.VITE_DEFAULT_FLOW_TENANT_ID);
      jumpToPath(search.toString());
    }
  };

  onMounted(() => {
    // handleSSO();
    jumpToYuDaoPath();
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
