// @ts-nocheck
import { modamatchConfig } from '.'

/* eslint-disable */
export const initGa = () => {
  window.ga = window.ga || (() => console.warn('modamatch analytics disabled'));
  window.ga('create', modamatchConfig.gaTagId, 'auto', 'modamatch');
}
