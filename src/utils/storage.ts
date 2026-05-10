/**
 * 浏览器存储工具函数
 */

import webExtensionPolyfill from 'webextension-polyfill'

const browser = webExtensionPolyfill

/**
 * 从存储中获取数据，优先从 local 获取，没有则从 sync 获取
 * @param keys 要获取的键名数组
 * @returns Promise<Record<string, any>>
 */
export const getStorage = async (
  keys: string[],
): Promise<Record<string, any>> => {
  try {
    // 先尝试从 local 存储获取
    const localResult = await browser.storage.local.get(keys)

    // 检查是否获取到数据
    const hasLocalData = keys.some((key) => localResult[key] !== undefined)
    if (hasLocalData) {
      return localResult
    }

    // local 没有数据，尝试从 sync 存储获取
    const syncResult = await browser.storage.sync.get(keys)
    return syncResult
  } catch (error) {
    console.error('获取存储数据失败:', error)
    return {}
  }
}

/**
 * 设置存储数据到 local
 * @param data 要存储的数据
 * @returns Promise<void>
 */
export const setStorage = async (data: Record<string, any>): Promise<void> => {
  try {
    await browser.storage.local.set(data)
  } catch (error) {
    console.error('设置存储数据失败:', error)
    throw error
  }
}

/**
 * 获取单个存储值
 * @param key 键名
 * @param defaultValue 默认值
 * @returns Promise<T>
 */
export const getStorageValue = async <T>(
  key: string,
  defaultValue: T,
): Promise<T> => {
  const result = await getStorage([key])
  return result[key] !== undefined ? (result[key] as T) : defaultValue
}

/**
 * 设置单个存储值
 * @param key 键名
 * @param value 值
 * @returns Promise<void>
 */
export const setStorageValue = async <T>(
  key: string,
  value: T,
): Promise<void> => {
  await setStorage({ [key]: value })
}
