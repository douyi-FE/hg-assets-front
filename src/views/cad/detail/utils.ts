const getCellByText = (
  spread: any,
  text: string,
): { sheetName: string; row: number; col: number } | null => {
  if (!spread) {
    return null;
  }
  const sheet = spread.getActiveSheet();
  const rowCount = sheet.getRowCount();
  const colCount = sheet.getColumnCount();
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const cellValue = sheet.getValue(row, col);
      if (cellValue === text) {
        return { sheetName: sheet.name(), row, col };
      }
    }
  }
  return null;
};

export { getCellByText };
