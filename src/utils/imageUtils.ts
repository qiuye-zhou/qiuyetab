import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量 (0-1)
 * @returns 压缩后的base64字符串
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 估算base64字符串的字节大小
 * @param base64 base64字符串
 * @returns 字节大小
 */
export const estimateBase64Size = (base64: string): number => {
  const base64Data = base64.split(',')[1]
  return Math.floor(base64Data.length * 0.75)
}

/**
 * 检查存储空间是否足够
 * @param requiredBytes 需要的字节数
 * @returns Promise<boolean> 是否有足够空间
 */
export const checkStorageSpace = async (
  requiredBytes: number,
): Promise<boolean> => {
  try {
    if (!browser?.storage?.local?.getBytesInUse) {
      return true
    }

    const currentUsage = await browser.storage.local.getBytesInUse()
    const totalQuota = 5 * 1024 * 1024

    return currentUsage + requiredBytes <= totalQuota
  } catch (error) {
    console.error('检查存储空间失败:', error)
    return true
  }
}

/**
 * 获取当前存储使用量信息
 * @returns Promise<{used: number, total: number, percentage: number}>
 */
export const getStorageInfo = async (): Promise<{
  used: number
  total: number
  percentage: number
}> => {
  try {
    if (!browser?.storage?.local?.getBytesInUse) {
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 }
    }

    const used = await browser.storage.local.getBytesInUse()
    const total = 5 * 1024 * 1024
    const percentage = Math.round((used / total) * 100)

    return { used, total, percentage }
  } catch (error) {
    console.error('获取存储信息失败:', error)
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 }
  }
}

/**
 * 格式化字节大小为可读格式
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
