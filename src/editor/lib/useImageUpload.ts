import { useCallback, useRef, useState } from 'react';

/**
 * Image upload for the playground.
 *
 * The file never leaves the browser: it becomes an object URL. A real host
 * would swap this for an actual upload (presigned URL, direct POST, etc.)
 * while keeping the same shape — `{ mutate, isLoading }` plus
 * `onSuccess`/`onError`. A page reload drops every uploaded image, which is
 * expected here.
 */

export type UploadResult = { file: File; url: string };

type Options = {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: unknown) => void;
};

/** Simulated network latency so loading states are actually visible. */
const FAKE_LATENCY_MS = 400;

export const useImageUpload = (options: Options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback((file: File) => {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      try {
        const url = URL.createObjectURL(file);
        optionsRef.current.onSuccess?.({ file, url });
      } catch (error) {
        optionsRef.current.onError?.(error);
      }
    }, FAKE_LATENCY_MS);
  }, []);

  return { mutate, isLoading };
};

export default useImageUpload;
