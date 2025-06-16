<template>
  <a-modal v-model:open="open" :title="props.mode === 'edit' ? '编辑' : '详情'" @ok="handleEditOk">
    <a-form
      v-if="props.mode === 'edit'"
      ref="formRef"
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 14 }"
    >
      <a-form-item label="标识" hidden>
        <a-input v-model:value="form.handle" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="form.name" />
      </a-form-item>
      <!-- 生命周期 -->
      <a-form-item label="生命周期">
        <a-range-picker v-model:value="form.time" />
      </a-form-item>
      <a-form-item label="价格">
        <a-input-number v-model:value="form.price" />
      </a-form-item>
    </a-form>
    <a-descriptions v-else :column="2">
      <a-descriptions-item label="名称">
        {{ form.name }}
      </a-descriptions-item>
      <a-descriptions-item label="价格">
        {{ form.price }}
      </a-descriptions-item>
      <a-descriptions-item label="生命周期">
        {{ (form.time as any)?.map((item: any) => item.format('YYYY-MM-DD')).join('~') }}
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { cloneDeep } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  const emits = defineEmits(['update:tag']);

  const props = defineProps({
    mode: {
      type: String,
      default: 'edit',
    },
  });
  const open = ref(false);
  const formRef = ref<FormInstance>();
  const form = ref({
    handle: '',
    name: '',
    price: 0,
    time: undefined,
  });
  const list = ref<any[]>([]);
  const sheetName = ref<string>('');
  const row = ref<number>(0);
  const col = ref<number>(0);

  const show = (tagData: any, handles: string[]) => {
    list.value = tagData.tag;
    const attach = tagData.tag.find((item: any) => handles.includes(item.handle))?.attach || {};
    form.value = {
      handle: handles[0],
      name: attach.name,
      price: attach.price,
      time: attach.time?.map((item: any) => dayjs(item)),
    };
    sheetName.value = tagData.sheetName;
    row.value = tagData.row;
    col.value = tagData.col;
    open.value = true;
  };

  const handleEditOk = () => {
    formRef.value?.validate().then(() => {
      const { handle, name, price, time } = form.value;
      let cloneList = cloneDeep(list.value);
      list.value = list.value.map((item) => {
        if (item.handle === handle) {
          item.attach = {
            name,
            price,
            time,
          };
          return item;
        }
        return item;
      });
      cloneList = cloneList.map((item) => {
        if (item.handle === handle) {
          item.attach = {
            name,
            price,
            time: (time as any)?.map((item: any) => item.format('YYYY-MM-DD')),
          };
          return item;
        }
        return item;
      });
      emits('update:tag', cloneList, {
        sheetName: sheetName.value,
        row: row.value,
        col: col.value,
      });
      open.value = false;
      message.success('更新成功');
    });
  };

  defineExpose({
    show,
  });
</script>
