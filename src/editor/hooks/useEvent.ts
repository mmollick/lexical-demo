import React from 'react';

/**
 * A hook that returns a function that has the same reference across renders,
 * yet still calls the provided callback function.
 *
 * @param callback The callback function to wrap
 * @see https://github.com/reactjs/rfcs/pull/220
 */
export function useEvent<T extends (...params: any[]) => unknown>(callback: T) {
  const ref = React.useRef(callback);

  React.useInsertionEffect(() => {
    ref.current = callback;
  }, [callback]);

  const latestCallback = React.useCallback(
    (...args: Parameters<T>) => ref.current(...args),
    [],
  );

  return latestCallback as T;
}
