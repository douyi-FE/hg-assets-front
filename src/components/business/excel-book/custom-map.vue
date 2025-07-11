<template>
  <a-drawer
    :open="isOpen"
    @close="isOpen = false"
    :get-container="false"
    placement="bottom"
    height="300"
    :destroyOnClose="true"
    :maskClosable="false"
  >
    <template #extra>
      <a-button @click="saveCustomField" type="primary">保存</a-button>
    </template>
    <a-form ref="formRef" :model="form" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
      <a-row :gutter="[8, 10]">
        <a-col v-for="field in sourceFields" :key="`${field.row}${field.col}`" :span="8">
          <a-form-item :label="field.text" :name="field.text">
            <a-select v-model:value="form[field.text]">
              <a-select-option
                v-for="importField in importFields"
                :key="`${importField.row}${importField.col}`"
                :value="importField.text"
                >{{ importField.text }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { onUnmounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  const isOpen = defineModel<boolean>('isOpen');
  const sourceFields = ref<any[]>([]);
  const importFields = ref<any[]>([]);
  const importFieldRange = ref<any>({});
  const form = ref({});
  const formRef = ref();
  const fieldMapConfig = ref(null);

  const setSourceFields = function (fields: any[]) {
    sourceFields.value = fields;
  };
  const setImportFields = function (fields: any[] = []) {
    importFields.value = fields;
  };
  const setImportFieldRange = function (range) {
    importFieldRange.value = range;
  };
  const saveCustomField = function () {
    formRef.value
      .validate()
      .then((res) => {
        fieldMapConfig.value = res;
        isOpen.value = false;
        message.success('自定义配置字段保存成功');
      })
      .catch((err) => {
        message.error(err.message);
      });
  };
  const getImportFields = function () {
    return importFields.value;
  };
  const getImportFieldRange = function () {
    return importFieldRange.value;
  };
  const getFieldMapConfig = function () {
    return fieldMapConfig.value;
  };

  onUnmounted(() => {
    isOpen.value = false;
    form.value = {};
  });

  defineExpose({
    setSourceFields,
    setImportFields,
    setImportFieldRange,
    getImportFields,
    getImportFieldRange,
    getFieldMapConfig,
  });
</script>
