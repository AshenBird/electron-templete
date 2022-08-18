

export const objectToString = Object.prototype.toString;

export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object";

export const isArray = Array.isArray;

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === "[object Map]";

export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === "[object Set]";

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === "[object Object]";
  
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};

export function callWithErrorHandling(fn: Function, args?: unknown[]) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    logError(err);
  }
  return res;
}

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);

export function callWithAsyncErrorHandling(
  fn: Function | Function[],
  args?: unknown[]
): any[] {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        logError(err);
      });
    }
    return res;
  }

  const values = [];
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], args));
  }
  return values;
}

function logError(err: unknown) {
  // recover in prod to reduce the impact on end-user
  console.error(err);
}
