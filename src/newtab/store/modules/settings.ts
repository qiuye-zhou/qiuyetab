import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
    const updateSetting = ref(false)

    return { updateSetting }
})