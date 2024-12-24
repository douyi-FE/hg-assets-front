<template>
  <a-drawer
    title="新增模板"
    width="100%"
    :open="isOpen"
    :get-container="false"
    :style="{ position: 'absolute' }"
    @close="isOpen = false"
  >
    <template #extra>
      <a-button style="margin-right: 8px" @click="isOpen = false">取消</a-button>
      <a-button type="primary" @click="saveTemplate">保存</a-button>
    </template>
    <a-row :gutter="20" style="height: 100%">
      <a-col :span="18">
        <ExcelDesign v-if="isOpen" ref="excelDesignRef" :sjs="excelTemplate" />
      </a-col>
      <a-col :span="6">
        <a-card title="模板信息">
          <a-form
            ref="formRef"
            :model="formState"
            :label-col="{ style: { width: '100px' } }"
            :wrapper-col="{ span: 20 }"
          >
            <a-form-item label="模板名称" name="name">
              <a-input v-model:value="formState.name" />
            </a-form-item>
            <a-form-item label="是否内置" name="isBuildIn">
              <a-radio-group
                v-model:value="formState.isBuildIn"
                :disabled="$auth('template:excel:buildin') && isPermissionDisabledByCode()"
              >
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="发布状态" name="status">
              <a-radio-group v-model:value="formState.status">
                <a-radio :value="0">草稿</a-radio>
                <a-radio :value="1">待发布</a-radio>
                <a-radio :value="2">已发布</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="模板描述" name="note">
              <a-textarea v-model:value="formState.note" />
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script setup lang="ts">
  import { nextTick, ref, toRaw } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { findMenuByPermission } from '@/permission';
  const emits = defineEmits(['open', 'save']);

  const { menuPerms } = useUserStore();
  const initialState = {
    name: '',
    isBuildIn: false,
    status: 0,
    note: '',
  };
  const formState: { [key: string]: any } = ref({ ...initialState });
  const isOpen = ref(false);
  const excelTemplate = ref();
  const excelDesignRef = ref();
  const formRef = ref();

  const isPermissionDisabledByCode = function () {
    const matchMenuPermiession = findMenuByPermission('template:excel:buildin', menuPerms);
    // status:0-禁用；2-启用
    return matchMenuPermiession?.status !== 1;
  };
  const open = function (record: any, type: 'add' | 'edit') {
    if (type === 'add') {
      formState.value = {
        ...initialState,
      };
      excelTemplate.value = undefined;
    } else {
      formState.value = {
        name: record.name,
        isBuildIn: record.isBuildIn,
        status: record.status,
        note: record.note,
        id: record._id,
      };
      excelTemplate.value = record.file;
    }
    nextTick(() => {
      isOpen.value = true;
    });
  };
  const saveTemplate = async function () {
    const sjs = await excelDesignRef.value.getSpreadSJS();
    emits(
      'save',
      {
        ...toRaw(formState.value),
      },
      sjs,
    );
    isOpen.value = false;
  };

  defineExpose({
    open,
  });
</script>
