<template>
  <!-- 部门选择器 -->
  <!-- 使用 a-select 组件 -->
  <a-select
    v-model:value="selectedDeptId"
    style="width: 240px; height: 32px; display: flex"
    @change="handleChange"
  >
    <a-select-option v-for="item in treeData" :key="item.id" :value="item.id">
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  // import Api from '@/api';
  import { eventBus } from '@/utils/event-bus';
  import { getSubDepts } from '@/api/backend/api/customerApis';
  import { useUserStore } from '@/store/modules/user';

  const treeData = ref<any[]>([]);
  const selectedDeptId = ref<number>(0);

  const userStore = useUserStore();

  onMounted(() => {
    // 获取用户所属部门列表，并获取所有子部门
    const dept = userStore.userInfo.dept;
    selectedDeptId.value = dept?.id || 0;
    if (dept) {
      getSubDepts({ deptId: dept.id }).then((res) => {
        // 把部门树转为列表
        treeData.value.push({
          id: res.id,
          name: res.name,
        });
        treeData.value.push(...convertTreeData(res.children));
      });
    }
  });

  // 递归处理所有子部门
  const convertTreeData = (data) => {
    const result: any[] = [];
    const stack = [...data];

    while (stack.length) {
      const node = stack.pop();
      result.push({
        name: node.name,
        id: node.id,
      });
      if (node.children) {
        stack.push(...node.children);
      }
    }
    return result;
  };

  const handleChange = (deptId: number) => {
    eventBus.emit('deptChange', deptId);
  };
</script>
