<template>
  <div class="entity-info-container">
    <div class="entity-info-header">
      <LineOutlined v-if="isShowContent" class="close-icon" @click="close" />
      <BorderOutlined v-else class="show-icon" @click="show" />
    </div>
    <div class="entity-info-content" v-if="isShowContent">
      <p>名称：{{ entityInfo.name }}</p>
      <p>开始时间：{{ entityInfo.time[0] }}</p>
      <p>结束时间：{{ entityInfo.time[1] }}</p>
      <p>剩余天数：{{ remainingDays }}</p>
      <p>价格：{{ entityInfo.price }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { BorderOutlined, LineOutlined } from '@ant-design/icons-vue';

  const isShowContent = ref(true);
  const entityInfo = ref({
    name: '',
    price: '',
    time: [],
  });

  const close = () => {
    isShowContent.value = false;
  };

  const show = () => {
    isShowContent.value = true;
  };

  const showContent = (info: any = {}) => {
    isShowContent.value = true;
    const { name, price, time } = info;
    entityInfo.value = { name, price, time };
  };

  // 计算剩余天数
  const remainingDays = computed(() => {
    const { time } = entityInfo.value;
    if (!time || time.length !== 2) {
      return 0;
    }
    const start = new Date(time[0]);
    const end = new Date(time[1]);
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60 * 24);
  });

  defineExpose({
    showContent,
  });
</script>

<style lang="less" scoped>
  .entity-info-container {
    padding: 10px;
    background-color: #000;
    opacity: 0.8;
    color: #fff;

    .entity-info-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .close-icon {
      cursor: pointer;
    }
    .show-icon {
      cursor: pointer;
    }
  }
</style>
