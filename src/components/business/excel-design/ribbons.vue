<template>
  <a-modal
    v-model:open="isOpenSelectedModal"
    wrapClassName="select-warpper-modal"
    :mask="false"
    :destroyOnClose="true"
    :maskClosable="false"
    title="选择填报表头区域"
    @ok="handleRangeOk"
  >
    <div ref="formulaBarRef" spellcheck="false" style="width: 350px; border: 1px solid #808080" />
  </a-modal>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';

  const props = withDefaults(defineProps<{ designer: any }>(), { designer: null });
  const emits = defineEmits(['sendInitialData']);
  const isOpenSelectedModal = ref(false);
  let initDataSource = {};
  let fbx: any = null;
  const formulaBarRef = ref();

  // 获取选中的区域
  function getRangeValue(ranges) {
    if (!ranges || ranges.length === 0) {
      return '';
    }
    if (ranges.length > 1) {
      message.error('只允许选择单个Sheet页区域'); // 错误提示
      return '';
    }
    const selections = ranges[0].ranges;
    if (selections.length === 0) {
      return '';
    }
    if (selections.length > 1) {
      message.error('只允许选择单个区域'); // 错误提示
      return '';
    }
    return selections[0];
  }

  // 根据表头区域获取表格区域
  function getTableRange(titleRange) {
    const workBook = props.designer.getWorkbook();
    const sheet = workBook.getActiveSheet();
    if (titleRange.rowCount === 1) {
      const rowCount = sheet.getRowCount();
      let bottomRow = titleRange.row + 1;
      for (let i = titleRange.row + 1; i < rowCount; i++) {
        const cell = sheet.getCell(i, titleRange.col);
        // 如果单元格有边框，算有效表格区域
        if (!cell.borderLeft()) {
          bottomRow = i;
          break;
        }
      }
      if (bottomRow > titleRange.row + 1) {
        return new GC.Spread.Sheets.Range(
          titleRange.row,
          titleRange.col,
          bottomRow - titleRange.row,
          titleRange.colCount,
        );
      }
      return titleRange;
    } else {
      // 如果是多行表头，获取表头以下内容区域
      const rowCount = sheet.getRowCount();
      let bottomRow = titleRange.row + titleRange.rowCount;
      for (let i = titleRange.row + titleRange.rowCount; i < rowCount; i++) {
        const cell = sheet.getCell(i, titleRange.col);
        if (!cell.borderLeft()) {
          bottomRow = i;
          break;
        }
      }
      return new GC.Spread.Sheets.Range(
        titleRange.row + titleRange.rowCount,
        titleRange.col,
        bottomRow - titleRange.row - titleRange.rowCount,
        titleRange.colCount,
      );
    }
  }

  // 初始化表单数据
  function initFillData() {
    const workBook = props.designer.getWorkbook();
    const sheet = workBook.getActiveSheet();
    const table = sheet.tables.findByName('table');
    const dataSource = {};
    const tableData: Array<any> = [];
    if (table) {
      const dataRange = table.dataRange();
      const data = sheet.getArray(
        dataRange.row,
        dataRange.col,
        dataRange.rowCount,
        dataRange.colCount,
      );
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const item = {};
          for (let j = 0; j < data[i].length; j++) {
            item[table.getColumnDataField(j)] = data[i][j];
          }
          tableData.push(item);
        }
      }
    }
    dataSource['table'] = tableData;
    return dataSource;
  }

  // 处理多行表头的筛选
  function addMultiTitleTableFilter() {
    const workBook = props.designer.getWorkbook();
    const sheet = workBook.getActiveSheet();
    const table = sheet.tables.findByName('table');
    // 保存 table range
    const tableRange = table.range();
    // 隐藏表头
    table.showHeader(false);
    // 删除表头行
    sheet.deleteRows(tableRange.row, 1);
    // 保留原来的列数
    const colCount = sheet.getColumnCount();
    // 扩展一倍的列数
    sheet.setColumnCount(colCount * 2);
    // 隐藏表头筛选
    table.filterButtonVisible(false);

    // 把表移动到后边
    sheet.tables.move(table, tableRange.row, colCount);
    // 设置筛选列，列默认从0开始
    const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
      new GC.Spread.Sheets.Range(
        tableRange.row,
        tableRange.col,
        tableRange.rowCount + 1,
        tableRange.colCount,
      ),
    );
    sheet.rowFilter(filter);
    // 再把表移动回来
    sheet.tables.move(table, tableRange.row, 0);
    // 删掉多余的列
    sheet.setColumnCount(sheet.getColumnCount() / 2);
  }

  // 绑定表单路径
  function bindingTablePath(range) {
    if (!range || range.rowCount === 0) {
      message.error('未选中有效表头区域，请重新选择');
      return;
    }
    const workBook = props.designer.getWorkbook();
    const sheet = workBook.getActiveSheet();
    const tableRange = getTableRange(range);
    // 创建表单
    let table: any = null;
    // 先处理单行表头场景
    if (range.rowCount === 1) {
      // 获取表单字段
      table = sheet.tables.add(
        'table',
        tableRange.row,
        tableRange.col,
        tableRange.rowCount,
        tableRange.colCount,
      );
      table.autoGenerateColumns(false);
      const tableFields = sheet
        .getArray(range.row, range.col, range.rowCount, range.colCount)
        .flat();
      // 设置表单字段
      const tableColumns: Array<any> = [];
      tableFields.forEach((field, index) => {
        const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
        tableColumn.name(field);
        tableColumn.dataField(field);
        tableColumns.push(tableColumn);
      });
      table.bindColumns(tableColumns);
      table.bindingPath('table');
      // 创建初始化数据对象
      initDataSource = initFillData();
    } else if (range.rowCount > 1) {
      // 处理多行表头场景
      // 插入表头行
      sheet.addRows(tableRange.row, 1);
      table = sheet.tables.add(
        'table',
        tableRange.row,
        tableRange.col,
        tableRange.rowCount + 1,
        tableRange.colCount,
      );
      table.allowAutoExpand(true);
      // 插入汇总行
      sheet.addRows(tableRange.row + tableRange.rowCount + 1, 1);
      // 扩展表格区域
      table.autoGenerateColumns(false);
      const row = range.row;
      const col = range.col;
      const colCount = range.colCount;
      const tableColumns: Array<any> = [];
      for (let i = col; i < col + colCount; i++) {
        const span = sheet.getSpan(row, i);
        // 如果是正常单元格或跨行单元格，则正常处理
        if (!span || span.colCount === 1) {
          const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
          const field = sheet.getValue(row, i);
          tableColumn.name(field);
          tableColumn.dataField(field);
          tableColumns.push(tableColumn);
        } else {
          // 如果跨列，先填充表头
          const row = span.row;
          const col = span.col;
          const rowCount = span.rowCount;
          const colCount = span.colCount;
          for (let j = 0; j < rowCount; j++) {
            const field = sheet.getValue(row + j, col);
            for (let k = 0; k < colCount; k++) {
              if (!sheet.getValue(row + j, col + k)) {
                sheet.setValue(row + j, col + k, field);
              }
            }
          }
          // 填充完成后，逐级拼接即可
          const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
          let field = '';
          for (let j = 0; j < range.rowCount; j++) {
            const cellVal = sheet.getValue(row + j, i);
            field += cellVal ? cellVal : '';
          }
          tableColumn.name(field);
          tableColumn.dataField(field);
          tableColumns.push(tableColumn);
          // i += colCount - 1;
        }
      }
      table.bindColumns(tableColumns);
      table.bindingPath('table');
      // 创建初始化数据对象
      initDataSource = initFillData();
      addMultiTitleTableFilter();
    }
  }

  const handleRangeOk = function () {
    isOpenSelectedModal.value = false;
    nextTick(() => {
      const workBook = props.designer.getWorkbook();
      let area = fbx.text();
      const formulaToRanges = GC.Spread.Sheets.CalcEngine.formulaToRanges;
      const ranges = formulaToRanges(workBook.getActiveSheet(), area, 0, 0);
      const rangeValue = getRangeValue(ranges);
      if (rangeValue) {
        workBook.suspendPaint();
        // 按类型处理
        bindingTablePath(rangeValue);
        workBook.resumePaint();
      }
    });
  };

  // 开始选择模式
  function startSelectMode() {
    isOpenSelectedModal.value = true;
    nextTick(() => {
      const workBook = props.designer.getWorkbook();
      fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(formulaBarRef.value, {
        rangeSelectMode: true,
      });
      fbx.workbook(workBook);
      // 显示弹窗并调整相关交互逻辑
      fbx.startSelectMode();
      fbx.text('');
    });
  }

  const renderTool = function () {
    const config = GC.Spread.Sheets.Designer.DefaultConfig;
    console.log('配置：', config);
    config.commandMap = {
      SelectTableTitle: {
        title: '选择填报表头',
        text: '选择填报表头',
        iconClass: 'select-table-title',
        bigButton: 'false',
        commandName: 'selectTableTitle',
        execute: async () => {
          startSelectMode();
        },
      },
      ShowData: {
        title: '保存初始化数据',
        text: '保存初始化数据',
        iconClass: 'save-inital-excel-data',
        bigButton: 'false',
        commandName: 'showData',
        execute: async () => {
          emits('sendInitialData', initDataSource);
        },
      },
    };
    if (config.ribbon.findIndex((item) => item.id === 'templateTab') === -1) {
      config.ribbon.push({
        id: 'templateTab',
        text: '模板',
        buttonGroups: [
          {
            label: '设置',
            thumbnailClass: 'welcome',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['SelectTableTitle'],
                },
                {
                  direction: 'vertical',
                  commands: ['ShowData'],
                },
              ],
            },
          },
        ],
      });
    }
    props.designer.setConfig(config);
  };

  watch(
    () => props.designer,
    (curDesigner) => {
      if (curDesigner !== null) {
        renderTool();
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less">
  .select-warpper-modal {
    height: 300px;
  }

  .select-table-title {
    background-image: url('data:image/png;base64,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');
    background-size: 35px 35px;
  }

  .save-inital-excel-data {
    background-image: url('data:image/png;base64,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');
    background-size: 35px 35px;
  }
</style>
