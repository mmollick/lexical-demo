import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * This provides a mechanism to have Popover content without the use of
 * full screen invisible divs. This is essential for UX with Lexical, because
 * if you use a component with an invisible div that is used to close the
 * popover, that div prevents the click from focusing Lexical directly.
 * It's essential for a good UX to be able to have direct selection of Lexical
 * content regardless of the rest of the UI's state.
 *
 * Recommended to use with an absolutely positioned panel (see SimplePopover).
 *
 * @param initialState initial value for shouldShow
 * @returns [ref, shouldShow, setShouldShow] ref is a ref of type T that is
 * used to determine if a click is outside. shouldShow, setShouldShow are from
 * useState()
 */
const useCloseOnClickOutside = <T extends HTMLElement>(
  initialState = false,
): [RefObject<T>, boolean, Dispatch<SetStateAction<boolean>>] => {
  const ref = useRef<T>(null);
  const [shouldShow, setShouldShow] = useState(initialState);

  useEffect(() => {
    const container = ref.current;
    if (container && shouldShow) {
      const closeHandler = (event: MouseEvent) => {
        const { target } = event;
        // If anything that is not contained by ref is clicked, then close
        if (!container.contains(target as Node)) {
          setShouldShow(false);
        }
      };

      document.addEventListener('click', closeHandler);

      return () => {
        document.removeEventListener('click', closeHandler);
      };
    }
  }, [ref, setShouldShow, shouldShow]);

  return [ref, shouldShow, setShouldShow];
};

export default useCloseOnClickOutside;
