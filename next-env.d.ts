/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.scss'
declare module '*.svg'

declare let Shopify

type T = Window & typeof globalThis
interface Window extends T {
  ga: any
}

declare module 'csscolorparser' {
  export function parseCSSColor(colorString: string): [number, number, number, number]
}
