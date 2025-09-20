/// <reference types="vite/client" />

declare const __VERSION__: string
declare const __DEV__: boolean
declare const __NAME__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}
