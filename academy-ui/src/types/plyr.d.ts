declare module 'plyr' {
  export interface PlyrOptions {
    controls?: string[];
    settings?: string[];
    [key: string]: any;
  }

  export default class Plyr {
    constructor(target: string | Element | NodeList | HTMLElement[], options?: PlyrOptions);
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    restart(): void;
    destroy(): void;
    on(event: string, callback: Function): void;
    once(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    [key: string]: any;
  }
}
