export interface ReactVueRouter {
  push: (args: { path?: string | null; pathname?: string | null; query?: any; state?: any; name?: string; params?: any }) => void;
}
