import {
  EffectScheduler,
  ReactiveEffect,
  isRef,
  isReactive,
  isShallow,
  ref,
  UnwrapNestedRefs,
  effect,
  ComputedRef,
  Ref,
  DebuggerOptions,
} from "@vue/reactivity";
import { queueJob, queuePostFlushCb, SchedulerJob } from "./scheduler";
import {
  callWithAsyncErrorHandling,
  callWithErrorHandling,
  hasChanged,
  isArray,
  isFunction,
  isMap,
  isObject,
  isPlainObject,
  isSet,
} from "./utils";
type OnCleanup = (cleanupFn: () => void) => void;
const INITIAL_WATCHER_VALUE = {};

export type WatchEffect = (onCleanup: OnCleanup) => void;

export interface WatchOptionsBase extends DebuggerOptions {
  flush?: "pre" | "post" | "sync";
}
export type WatchStopHandle = () => void;
export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate;
  deep?: boolean;
}
export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);
export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: OnCleanup
) => any;

// 利用递归，进行深度依赖搜集
export function traverse(value: unknown, seen?: Set<unknown>) {
  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse((value as any)[key], seen);
    }
  }
  return value;
}

export function watch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  { immediate, deep, flush, onTrack, onTrigger }: WatchOptions = {}
): WatchStopHandle {
  let getter: () => any;
  let forceTrigger = false;
  let isMultiSource = false;
  
  // 生成 getter
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (Array.isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () =>
      source.map((s) => {
        if (isRef(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return traverse(s);
        } else if (isFunction(s)) {
          return callWithErrorHandling(s);
        }
      });
  } else if (isFunction(source)) {
    if (cb) {
      // getter with cb
      getter = () => callWithErrorHandling(source);
    } else {
      // no cb -> simple effect
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, [onCleanup]);
      };
    }
  } else {
    getter = () => {};
  }

  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }

  let cleanup: () => void;
  let onCleanup: OnCleanup = (fn: () => void) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn);
    };
  };
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
  const job: SchedulerJob = () => {
    if (!effect.active) {
      return;
    }
    if (cb) {
      // watch(source, cb)
      const newValue = effect.run();
      if (
        deep ||
        forceTrigger ||
        (isMultiSource
          ? (newValue as any[]).some((v, i) =>
              hasChanged(v, (oldValue as any[])[i])
            )
          : hasChanged(newValue, oldValue))
      ) {
        // cleanup before running cb again
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onCleanup,
        ]);
        oldValue = newValue;
      }
    } else {
      // watchEffect
      effect.run();
    }
  };

  // important: mark the job as a watcher callback so that scheduler knows
  // it is allowed to self-trigger (#1727)
  job.allowRecurse = !!cb;

  let scheduler: EffectScheduler;
  if (flush === "sync") {
    scheduler = job as any; // the scheduler function gets called directly
  } else if (flush === "post") {
    scheduler = () => queuePostFlushCb(job);
  } else {
    // default: 'pre'
    job.pre = true;
    scheduler = () => queueJob(job);
  }

  const effect = new ReactiveEffect(getter, scheduler);

  // initial run
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostFlushCb(effect.run.bind(effect));
  } else {
    effect.run();
  }

  return () => {
    effect.stop();
  };
}