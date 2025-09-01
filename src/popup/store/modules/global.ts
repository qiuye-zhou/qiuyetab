import { defineStore } from 'pinia'

declare const __VERSION__: string
declare const __BUILD_TIME__: string

export const useGlobalStore = defineStore('global', () => {
const appVersion = ref(__VERSION__)
const buildTime = ref(__BUILD_TIME__)
const showSettings = ref(false)
const showEditSites = ref(false)

return { appVersion, buildTime, showSettings, showEditSites }
})