declare module 'react-load-script' {
  import { ComponentType } from 'react';

  export interface ScriptProps {
    attributes?: any;
    onCreate?: () => any;
    onError?: (err: any) => any;
    onLoad?: () => any;
    url: string;
  }
  const Script: ComponentType<ScriptProps>;
  export default Script;
}
