import { message } from 'ant-design-vue';

export function initCustomCommentsEvents(spread) {
  spread.bind(GC.Spread.Sheets.Events.CommentChanged, function (e, info) {
    if (info.propertyName === 'text') {
      const row = info.comment.bZ;
      const col = info.comment.yZ;
      if (!row || !col) {
        message.error('添加注释出现错误，注释无法保存，请重试');
        return;
      }
      const sheet = info.sheet;
      const table = sheet.tables.all()[0];
      if (!table) {
        return;
      }
      const dataSource = sheet.getDataSource();
      if (!dataSource) {
        return;
      }
      const dataRange = table.dataRange();
      if (!dataRange.contains(row, col, 1, 1)) {
        message.error('注释没有添加在表格中，无法保存此注释');
        return;
      }
      const comment = info.comment;
      const commentText = comment.text();
      const commentWidth = comment.width();
      const commentHeight = comment.height();
      const dataIndex = row - dataRange.row;
      const dataCol = col - dataRange.col;
      const sheetData = dataSource.getSource();
      if (!sheetData) {
        return;
      }
      const fieldName = table.getColumnDataField(dataCol);
      const tableName = Object.keys(sheetData).find(key => key.startsWith('table'));
      if (!tableName) {
        return;
      }
      const tableData = sheetData[tableName];
      if (!tableData || tableData.length === 0) {
        return;
      }
      const data = tableData[dataIndex];
      if (!data) {
        return;
      }
      let _comments = data._comments || [];
      let _comment = _comments.find(item => item.field === fieldName);
      if (_comment) {
        _comment.commentText = commentText;
        _comment.width = commentWidth;
        _comment.height = commentHeight;
      } else {
        _comment = {
          field: fieldName,
          commentText: commentText,
          width: commentWidth,
          height: commentHeight
        }
        _comments.push(_comment);
      }
      data._comments = _comments;
    }
  });
  spread.bind(GC.Spread.Sheets.Events.CommentRemoved, function (e, info) {
    const row = info.comment.bZ;
    const col = info.comment.yZ;
    if (!row || !col) {
      message.error('删除注释出现错误，注释无法保存，请重试');
      return;
    }
    const sheet = info.sheet;
    const table = sheet.tables.all()[0];
    if (!table) {
      return;
    }
    const dataSource = sheet.getDataSource();
    if (!dataSource) {
      return;
    }
    const dataRange = table.dataRange();
    if (!dataRange.contains(row, col, 1, 1)) {
      return;
    }
    const dataIndex = row - dataRange.row;
    const dataCol = col - dataRange.col;
    const sheetData = dataSource.getSource();
    if (!sheetData) {
      return;
    }
    const tableName = Object.keys(sheetData).find(key => key.startsWith('table'));
    if (!tableName) {
      return;
    }
    const tableData = sheetData[tableName];
    if (!tableData || tableData.length === 0) {
      return;
    }
    const fieldName = table.getColumnDataField(dataCol);
    const data = tableData[dataIndex];
    if (!data) {
      return;
    }
    const _comments = data._comments || [];
    const _comment = _comments.find(item => item.field === fieldName);
    if (_comment) {
      _comments.splice(_comments.indexOf(_comment), 1);
    }
    data._comments = _comments;
  });
}

export function renderCommentsByData(spread, dataSource) {
  spread.suspendPaint();
  Object.keys(dataSource).forEach(sheetName => {
    const sheet = spread.getSheetFromName(sheetName);
    if (!sheet) {
      return;
    }
    const sheetData = dataSource[sheetName];
    const tableName = Object.keys(sheetData).find(key => key.startsWith('table'));
    if (!tableName) {
      return;
    }
    const table = sheet.tables.all()[0];
    if (!table) {
      return;
    }
    const tableData = sheetData[tableName];
    if (!tableData || tableData.length === 0) {
      return;
    }
    const dataRange = table.dataRange();
    tableData.forEach((item, index) => {
      const comments = item._comments || [];
      comments.forEach(comment => {
        const fieldName = comment.field;
        const commentText = comment.commentText;
        const commentWidth = comment.width;
        const commentHeight = comment.height;
        const row = dataRange.row + index;
        let col = -1;
        for (let c = 0; c < dataRange.colCount; c++) {
          if (table.getColumnDataField(c) === fieldName) {
            col = c;
            break;
          }
        }
        const commentObj = new GC.Spread.Sheets.Comments.Comment();
        commentObj.text(commentText);
        commentObj.width(commentWidth);
        commentObj.height(commentHeight);
        sheet.getCell(row, col).comment(commentObj);
      });
    });
  });
  spread.resumePaint();
}

export function renderCommentsBySheet(spread, sheetName) {
  spread.suspendPaint();
  const sheet = spread.getSheetFromName(sheetName);
  if (!sheet) {
    return;
  }
  const dataSource = sheet.getDataSource();
  if (!dataSource) {
    return;
  }
  const sheetData = dataSource.getSource();
  if (!sheetData) {
    return;
  }
  const tableName = Object.keys(sheetData).find(key => key.startsWith('table'));
  if (!tableName) {
    return;
  }
  const table = sheet.tables.all()[0];
  if (!table) {
    return;
  }
  const tableData = sheetData[tableName];
  if (!tableData || tableData.length === 0) {
    return;
  }
  const dataRange = table.dataRange();
  tableData.forEach((item, index) => {
    const comments = item._comments || [];
    comments.forEach(comment => {
      const fieldName = comment.field;
      const commentText = comment.commentText;
      const commentWidth = comment.width;
      const commentHeight = comment.height;
      const row = dataRange.row + index;
      let col = -1;
      for (let c = 0; c < dataRange.colCount; c++) {
        if (table.getColumnDataField(c) === fieldName) {
          col = c;
          break;
        }
      }
      const commentObj = new GC.Spread.Sheets.Comments.Comment();
      commentObj.text(commentText);
      commentObj.width(commentWidth);
      commentObj.height(commentHeight);
      sheet.getCell(row, col).comment(commentObj);
    });
  });
  spread.resumePaint();
}