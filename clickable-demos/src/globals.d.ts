import type * as html2canvasTypes from 'html2canvas';
import type * as tippyTypes from 'tippy.js';

export {}; // Ensure this file is treated as a module

declare global {
  function html2canvas(element: HTMLElement, options?: Partial<html2canvasTypes.Options>): Promise<HTMLCanvasElement>;

  function tippy(element: HTMLElement, options: Partial<tippyTypes.DefaultProps>): void;

  interface HTMLElement {
    _tippy?: any; // Adjust the type based on tippy.js types if available
  }

  interface Window {
    handleDoDAOParentWindowEvent: (event: MessageEvent) => void;
  }
}
