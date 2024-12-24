<template>
  <Space :size="8" class="dark:text-white">
    <Tooltip placement="top">
      <template #title>
        <span>{{ search ? '隐藏搜索' : '显示搜索' }}</span>
      </template>
      <SearchOutlined @click="toggleSearch" />
    </Tooltip>
    <Tooltip placement="top">
      <template #title>
        <span>{{ t('common.redo') }}</span>
      </template>
      <RedoOutlined @click="refresh" />
    </Tooltip>
    <a-tooltip placement="top">
      <template #title>
        {{ isFullscreen ? '取消全屏' : '全屏' }}
      </template>
      <component
        :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined"
        @click="toggleFullscreen"
      />
    </a-tooltip>
    <Tooltip placement="top">
      <template #title>
        <span>{{ t('component.table.settingColumn') }}</span>
      </template>
      <Popover placement="bottomLeft" trigger="click" overlay-class-name="cloumn-list">
        <template #title>
          <div class="popover-title">
            <Checkbox v-model:checked="checkAll" @change="handleColumnCheckChange">
              {{ t('component.table.settingColumnShow') }}
            </Checkbox>
            <Checkbox v-model:checked="checkIndex" @change="handleIndexCheckChange">
              {{ t('component.table.settingIndexColumnShow') }}
            </Checkbox>
            <Checkbox v-model:checked="checkBordered" @change="handleBorderedCheckChange">
              {{ t('component.table.settingBordered') }}
            </Checkbox>
          </div>
        </template>
        <template #content />
        <SettingOutlined />
      </Popover>
    </Tooltip>
    <Tooltip placement="top">
      <template #title>
        <span>{{ t('component.table.settingDens') }}</span>
      </template>

      <Dropdown placement="bottom" :trigger="['click']">
        <ColumnHeightOutlined />
        <template #overlay>
          <Menu selectable @click="handleMenuClick">
            <Menu.Item key="large">
              <span>{{ t('component.table.settingDensDefault') }}</span>
            </Menu.Item>
            <Menu.Item key="middle">
              <span>{{ t('component.table.settingDensMiddle') }}</span>
            </Menu.Item>
            <Menu.Item key="small">
              <span>{{ t('component.table.settingDensSmall') }}</span>
            </Menu.Item>
          </Menu>
        </template>
      </Dropdown>
    </Tooltip>
  </Space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    SearchOutlined,
    RedoOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    ColumnHeightOutlined,
    SettingOutlined,
  } from '@ant-design/icons-vue';
  import { Tooltip, Dropdown, Menu, Space, Popover, Checkbox } from 'ant-design-vue';
  import { useI18n } from '@/hooks/useI18n';

  const { t } = useI18n();
  const emits = defineEmits([
    'toggleSearch',
    'refresh',
    'toggleFullscreen',
    'sizeChange',
    'toggleHeader',
    'toggleIndex',
    'toggleBorder',
  ]);
  const props = withDefaults(
    defineProps<{ search: boolean; isFullscreen: boolean; columns: Array<any> }>(),
    {
      search: true,
      isFullscreen: false,
      columns: () => [],
    },
  );
  const checkAll = ref(true);
  const checkIndex = ref(false);
  const checkBordered = ref(true);

  const toggleSearch = function () {
    emits('toggleSearch', !props.search);
  };
  const refresh = function () {
    emits('refresh');
  };
  const toggleFullscreen = function () {
    emits('toggleFullscreen', !props.isFullscreen);
  };
  const handleColumnCheckChange = function (ev) {
    emits('toggleHeader', ev.target.checked);
  };
  const handleIndexCheckChange = function (ev) {
    emits('toggleIndex', ev.target.checked);
  };
  const handleBorderedCheckChange = function (ev) {
    emits('toggleBorder', ev.target.checked);
  };
  const handleMenuClick = function ({ key }) {
    emits('sizeChange', key);
  };
</script>
