declare module 'plyr' {
  export default class Plyr {
    constructor(selector: string | HTMLElement | NodeList | HTMLElement[], options?: Plyr.Options);
    destroy(): void;
    // Add other methods as needed
  }

  namespace Plyr {
    interface Options {
      enabled?: boolean;
      debug?: boolean;
      controls?: string[];
      settings?: string[];
      // Add more options as needed
    }
  }
}
