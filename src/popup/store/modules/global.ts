import { defineStore } from 'pinia'

declare const __VERSION__: string

export const useGlobalStore = defineStore('global', () => {
const appVersion = ref(__VERSION__)

return { appVersion }
})