type Dict<T> = { [key: string]: T };

type OneOrMany<T> = T | T[];

type Nullable<T> = T | null;

type Maybe<T> = T | undefined;

type Constructor<T> = new (...args: any[]) => T;

type AnyFunction = (...args: any[]) => any;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type EmptyObject = Record<string, never>;

type Failable<T> = T | { error: { code: string; message?: string } };
type FailablePromise<T> = Promise<Failable<T>>;
