<template>
  <a-drawer
    :title="type === 'edit' ? '编辑流程' : '新增流程'"
    width="100%"
    :open="isOpen"
    :destroy-on-close="true"
    :get-container="false"
    @after-open-change="() => (isRender = true)"
    @close="isOpen = false"
  >
    <template #extra>
      <a-button type="primary" @click="saveXml"><SaveOutlined />保存</a-button>
    </template>
    <a-form
      layout="inline"
      :label-col="{ style: { width: '100px' } }"
      :wrapper-col="{ span: 16, style: { width: '200px' } }"
      class="flow-drawer-form"
    >
      <a-form-item label="流程名称" name="name">
        <a-input v-model:value="name" placeholder="请输入流程名称" />
      </a-form-item>
      <a-form-item label="流程描述" name="note">
        <a-input v-model:value="note" placeholder="请输入流程描述" />
      </a-form-item>
    </a-form>
    <WorkFlow v-if="isRender" ref="workFlowRef" :xml-str="xml" @save-xml="saveXml" />
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { SaveOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import Api from '@/api';

  const name = ref('');
  const note = ref('');
  const xml = ref('');
  const type = ref('');
  const isOpen = ref(false);
  const isRender = ref(false);
  const workFlowRef = ref<any>(null);

  const openDrawer = (record: any) => {
    isOpen.value = true;
    if (record) {
      name.value = record.name;
      note.value = record.note;
      xml.value = record.xml;
      type.value = 'edit';
    } else {
      type.value = 'add';
      name.value = '';
      note.value = '';
      xml.value = '';
    }
  };

  const closeDrawer = () => {
    isOpen.value = false;
    isRender.value = false;
  };

  const saveXml = () => {
    workFlowRef.value.getXml().then((xml: any) => {
      Api.flowDesign
        .saveFlowDesign({
          name: name.value,
          note: note.value,
          xml: xml.xml,
        })
        .then(() => {
          message.success('保存成功');
        });
    });
  };

  defineExpose({
    openDrawer,
    closeDrawer,
  });
</script>

<style lang="less" scoped>
  .flow-drawer-form {
    margin-bottom: 20px;
  }
</style>
