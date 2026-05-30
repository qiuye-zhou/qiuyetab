import { ref } from 'vue'

/**
 * 拖拽排序 composable
 * @param list 要排序的响应式数组
 * @param onReorder 拖拽完成后的回调（用于保存）
 */
export function useDragSort<T>(list: { value: T[] }, onReorder?: () => void) {
  const dragIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)

  const onDragStart = (index: number) => {
    dragIndex.value = index
  }

  const onDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex.value !== null && dragIndex.value !== index) {
      dragOverIndex.value = index
    }
  }

  const onDragLeave = () => {
    dragOverIndex.value = null
  }

  const onDrop = (index: number) => {
    try {
      if (dragIndex.value !== null && dragIndex.value !== index) {
        const [item] = list.value.splice(dragIndex.value, 1)
        if (item) list.value.splice(index, 0, item)
        onReorder?.()
      }
    } finally {
      dragIndex.value = null
      dragOverIndex.value = null
    }
  }

  const onDragEnd = () => {
    dragIndex.value = null
    dragOverIndex.value = null
  }

  return {
    dragIndex,
    dragOverIndex,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  }
}
