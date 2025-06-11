<template>
  <div class="entity-info-container">
    <div class="entity-info-header">
      <FullscreenExitOutlined v-if="isShowContent" class="close-icon" @click="close" />
      <FullscreenOutlined v-else class="show-icon" @click="show" />
    </div>
    <div class="entity-info-content" v-if="isShowContent">
      <p>图层：{{ entityInfo.layer }}</p>
      <p>类型：{{ entityInfo.objectName }}</p>
      <p v-if="entityInfo.objectName === 'McDbText'">文字：{{ entityInfo.textString }}</p>
      <p>句柄标识：{{ entityInfo.handle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';

  const isShowContent = ref(true);
  const entityInfo = ref({
    layer: '',
    objectName: '',
    textString: '',
    handle: '',
  });

  const close = () => {
    isShowContent.value = false;
  };

  const show = () => {
    isShowContent.value = true;
  };

  const showContent = (info: any = {}) => {
    isShowContent.value = true;
    const { layer, objectName, textString, handle } = info;
    entityInfo.value = { layer, objectName, textString, handle };
  };

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
