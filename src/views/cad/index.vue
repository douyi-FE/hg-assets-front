<template>
  <div class="cad-container">
    <wgh
      class="wgh"
      ref="wghRef"
      :mx-file-url="mxFileUrl"
      @getAllEntity="getAllEntity"
      @getAllEntityV2="getAllEntityV2"
      @selectEntityChange="selectEntityChange"
    />
    <div class="entry-container">
      <div class="entry-list">
        <div
          class="entry-item"
          ref="entryItemRef"
          v-for="item in entityList"
          :key="item"
          :id="`${item.position.x}-${item.position.y}-${item.position.z}`"
        >
          <p @click="clickEntryItem(item)">{{ item.textString }}</p>
        </div>
      </div>
      <div class="entry-info">
        <p>名称: {{ selectedEntity?.textString || selectedEntity?.objectName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import wgh from './wgh.vue';

  const wghRef = ref<any>(null);
  const entityList = ref<any[]>([]);
  const selectedEntity = ref<any>(null);
  const entryItemRef = ref<any>(null);
  const mxFileUrl = ref<string>(`${import.meta.env.VITE_BASE_SERVSER_HOST}/cad/changfang.mxweb`);
  console.log(mxFileUrl.value);

  const getAllEntity = (entryList: any[]) => {
    entityList.value = entryList;
  };

  const getAllEntityV2 = (entryList: any[]) => {
    entityList.value = entryList;
  };

  const selectEntityChange = (entity: any) => {
    if (entity.objectName !== 'McDbText') {
      return;
    }

    selectedEntity.value = entity;
    const element = document.getElementById(
      `${entity.position.x}-${entity.position.y}-${entity.position.z}`,
    );
    if (element) {
      entryItemRef.value.forEach((item: any) => {
        item.style.backgroundColor = 'initial';
      });
      element.scrollIntoView({ behavior: 'smooth' });
      element.style.backgroundColor = 'red';
    }
  };

  const clickEntryItem = (item: any) => {
    wghRef.value.showEntryByPosition(item);
    selectedEntity.value = item;
    selectEntityChange(item);
  };
</script>
<style scoped lang="less">
  .cad-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    row-gap: 100px;

    .entry-container {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      overflow: auto;

      .entry-list {
        flex-grow: 1;
        overflow-y: auto;
        cursor: pointer;
      }

      .entry-info {
        flex-grow: 1;
      }
    }
  }
</style>
