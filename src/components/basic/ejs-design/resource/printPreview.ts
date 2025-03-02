// 打印预览
export async function printPreview() {
  // 点击文件
  (document.querySelector('.fileButton') as any).click();
  // 等待一段时间，让新的元素加载完成
  await new Promise((resolve) => setTimeout(resolve, 0));
  // 再点击打印
  (
    document.querySelectorAll('.file-menu-category-list')[3].children[0].children[0]
      .children[0] as any
  ).click();
}
