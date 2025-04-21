// This is a direct copy of the @emotion/weak-memoize module to fix the missing file error
export default function memoize(fn) {
  const cache = new WeakMap();
  return function memoized(key, ...args) {
    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, [key, ...args]));
    }
    return cache.get(key);
  };
} 