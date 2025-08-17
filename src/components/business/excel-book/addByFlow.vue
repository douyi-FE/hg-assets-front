<template>
  <a-drawer
    title="新增"
    width="50%"
    :open="isOpen"
    :destroy-on-close="true"
    :get-container="false"
    @close="close"
  >
    <iframe :src="javaUrl" class="wh-full" frameborder="0" />
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, defineExpose, withDefaults, defineProps } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  const isOpen = ref(false);
  const loading = ref(true);
  const javaUrl = ref('');

  const props = withDefaults(
    defineProps<{
      flowPath: string;
      modelId: string;
    }>(),
    {
      flowPath: '',
      modelId: '',
    },
  );

  const jumpToPath = (extSearch: string = '') => {
    javaUrl.value = `${import.meta.env.VITE_FLOW_FRONT_DOMAIN}${props.flowPath}?isOnlyContent=true${extSearch === '' ? '' : `&${extSearch}`}&modelId=${props.modelId}`;
    console.log('javaUrl', javaUrl.value);
    loading.value = false;
  };

  const open = () => {
    isOpen.value = true;
    jumpToYuDaoPath();
  };

  const close = () => {
    isOpen.value = false;
  };

  // 获取token
  const jumpToYuDaoPath = function () {
    const userStore = useUserStore();
    if (userStore.yudaoToken.accessToken) {
      const { accessToken, expiresTime, refreshToken, userId, tenantId = 0 } = userStore.yudaoToken;
      const search = new URLSearchParams();
      search.append('accessToken', accessToken);
      search.append('expiresTime', expiresTime.toString());
      search.append('refreshToken', refreshToken);
      search.append('userId', userId);
      search.append('tenantId', tenantId.toString());
      jumpToPath(search.toString());
    }
  };

  defineExpose({
    open,
    close,
  });
</script>
