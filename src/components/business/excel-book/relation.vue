<template>
  <a-modal v-model:open="open" title="字段配置" @ok="handleOk">
    <div class="relation-field-operation">
      <a-button type="primary" @click="addRelationConfig">添加关联字段</a-button>
    </div>
    <div class="main-field">
      <span> 主字段名：{{ mainField.colName }}</span>
      <span> 主字段值：{{ mainField.text }}</span>
      <span> 主字段行：{{ mainField.row }}</span>
      <span> 主字段列：{{ mainField.col }}</span>
    </div>
    <div class="relation-field-header">
      <span>关联字段</span>
      <span>关联字段值</span>
      <span>操作</span>
    </div>
    <div class="relation-field-list-container">
      <ul class="relation-field-list">
        <a-empty v-if="relationConfigList.length === 0" style="margin: auto" />
        <li v-for="item in relationConfigList" :key="item.col">
          <a-select
            v-model:value="item.col"
            :options="relationFields"
            :fieldNames="{ label: 'colName', value: 'col' }"
          />
          <span>{{ getRelationFieldColName(item.col) }}</span>
          <a-button @click="deleteRelationConfig(item.col)" size="small" style="width: 100px"
            >删除</a-button
          >
        </li>
      </ul>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { defineModel, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { getExcelTemplateByIds } from '@/api/backend/api/template';
  import Api from '@/api';

  const props = defineProps<{
    templateId?: string;
    spread: any;
    mainField: {
      row: number;
      col: number;
      colName: string;
      text: string;
    };
    relationFields: {
      row: number;
      col: number;
      colName: string;
      text: string;
    }[];
  }>();

  const TEMPLATE_FIELD_DICT_NAME = '多列字段取值字典';
  const open = defineModel('open', { type: Boolean, default: false });
  const relationConfigList = ref<any[]>([]);
  const template = ref<any>(null);

  const createSaveData = function (list: any[]) {
    const sheetName = props.spread.getActiveSheet().name();
    return list.map((item) => {
      return {
        模板名称: template.value.name,
        Sheet名称: sheetName,
        主字段: props.mainField.colName,
        主字段可选值: props.mainField.text,
        联动字段: item.colName,
        联动可选值: item.text,
      };
    });
  };

  const getApplicationBindPath = async function () {
    const res1 = await Api.template.getExcelTemplateList({ name: '多列字段取值字典' });
    const res = await Api.applicationData.getApplicationData({
      templateId: res1[0]._id,
    });
    return {
      applicationBindPath: Object.keys(res.applicationData[TEMPLATE_FIELD_DICT_NAME])[0],
      templateId: res1[0]._id,
    };
  };

  const handleOk = async function () {
    const sheetName = template.value?.name;
    if (!sheetName) {
      message.error('模板名称不能为空');
      return;
    }
    const selectedRelationFields = relationConfigList.value.map((item) => {
      return props.relationFields.find((field) => field.col === item.col);
    });
    const saveData = createSaveData(selectedRelationFields);
    const { applicationBindPath, templateId } = await getApplicationBindPath();
    console.log('saveData', {
      templateId,
      applicationData: { [TEMPLATE_FIELD_DICT_NAME]: { [applicationBindPath]: saveData } },
    });
    Api.applicationData
      .appendApplicationData({
        templateId,
        applicationData: { [TEMPLATE_FIELD_DICT_NAME]: { [applicationBindPath]: saveData } },
      })
      .then((res) => {
        message.success('保存成功');
        open.value = false;
      })
      .catch((err) => {
        message.error('保存失败');
      });
  };

  const getRelationFieldColName = function (col: number) {
    return props.relationFields.find((item) => item.col === col)?.text || '--';
  };

  const addRelationConfig = function () {
    relationConfigList.value.push({
      colName: '',
    });
  };

  const deleteRelationConfig = function (col: number) {
    relationConfigList.value = relationConfigList.value.filter((item) => item.col !== col);
  };

  watch(
    () => props.templateId,
    (newVal) => {
      if (newVal) {
        getExcelTemplateByIds([newVal]).then((res) => {
          if (res.length > 0) {
            template.value = res[0];
          }
        });
      }
    },
  );
</script>

<style lang="less" scoped>
  .relation-field-operation {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  .main-field {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    span {
      flex: 1;
    }
  }
  .relation-field-header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f8ff;
    span {
      flex: 1;
      text-align: center;
    }
  }
  .relation-field-list-container {
    height: 300px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
  }
  .relation-field-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    li {
      display: flex;
      align-items: center;
      gap: 10px;
      & > * {
        flex: 1;
        text-align: center;
        overflow: auto;
      }
    }
  }
</style>
