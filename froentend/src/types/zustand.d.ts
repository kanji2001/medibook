declare module 'zustand' {
  type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
  type GetState<T> = () => T;

  // eslint-disable-next-line @typescript-eslint/ban-types
  type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

  export type StoreApi<T> = {
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  };

  export type UseBoundStore<T> = {
    (): T;
    <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  };

  export function create<T>(initializer: StateCreator<T>): UseBoundStore<T> & StoreApi<T>;
}

declare module 'zustand/shallow' {
  const shallow: <T>(objA: T, objB: T) => boolean;
  export default shallow;
}

