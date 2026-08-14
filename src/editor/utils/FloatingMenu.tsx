/**
 * Adapted from https://github.com/konstantinmuenster/lexical-floating-menu
 */
import { Placement, computePosition, flip } from '@floating-ui/dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL as NORMAL_PRIORITY,
  SELECTION_CHANGE_COMMAND as ON_SELECTION_CHANGE,
} from 'lexical';
import {
  ComponentProps,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

import { usePointerInteractions } from '../hooks/usePointerInteractions';

// const DEFAULT_DOM_ELEMENT = global.document.body;

type FloatingMenuCoords = { x: number; y: number } | undefined;

export type FloatingMenuPluginProps = {
  anchorEl: HTMLElement;
  children: ReactNode;
  open: boolean;
  placement?: Placement;
  offset?: FloatingMenuCoords;
};

const StyledFloatingMenu = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={cn(
      'rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10',
      className,
    )}
  />
));
StyledFloatingMenu.displayName = 'StyledFloatingMenu';

export function FloatingMenu({
  anchorEl,
  children,
  open,
  placement = 'bottom',
  offset = { x: 0, y: 0 },
}: FloatingMenuPluginProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<FloatingMenuCoords>(undefined);
  const show = coords !== undefined;

  const [editor] = useLexicalComposerContext();
  const { isPointerDown, isPointerReleased } = usePointerInteractions();

  const calculatePosition = useCallback(() => {
    const domSelection = getSelection();
    const domRange =
      domSelection?.rangeCount !== 0 && domSelection?.getRangeAt(0);

    if (!domRange || !ref.current || isPointerDown) return setCoords(undefined);

    computePosition(domRange, ref.current, { placement, middleware: [flip()] })
      .then((pos) => {
        setCoords({ x: pos.x + offset.x, y: pos.y + offset.y });
      })
      .catch(() => {
        setCoords(undefined);
      });
  }, [isPointerDown]);

  const $handleSelectionChange = useCallback(() => {
    if (editor.isComposing()) return false;

    if (editor.getRootElement() !== document.activeElement) {
      setCoords(undefined);
      return true;
    }

    const selection = $getSelection();

    if (open && $isRangeSelection(selection)) {
      calculatePosition();
    } else {
      setCoords(undefined);
    }

    return true;
  }, [editor, calculatePosition, open]);

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      ON_SELECTION_CHANGE,
      $handleSelectionChange,
      NORMAL_PRIORITY,
    );
    return unregisterCommand;
  }, [editor, $handleSelectionChange]);

  useEffect(() => {
    if (!show && isPointerReleased) {
      editor.getEditorState().read(() => {
        $handleSelectionChange();
      });
    }
    // Adding show to the dependency array causes an issue if
    // a range selection is dismissed by navigating via arrow keys.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPointerReleased, $handleSelectionChange, editor]);

  return createPortal(
    <StyledFloatingMenu
      ref={ref}
      aria-hidden={!show}
      style={{
        position: 'absolute',
        top: coords?.y,
        left: coords?.x,
        visibility: show ? 'visible' : 'hidden',
        opacity: show ? 1 : 0,
      }}
    >
      {children}
    </StyledFloatingMenu>,
    anchorEl,
  );
}
