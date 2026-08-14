import { MouseEventHandler, ReactNode } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

export const IS_APPLE: boolean =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

type Shortcut = {
  alt?: boolean;
  shift?: boolean;
  keys: string[];
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  shortcut?: Shortcut;
  onClick: MouseEventHandler;
  children: ReactNode;
  /**
   * Indicates this is a dropdown with an indicator in the icon
   */
  isDropdown?: boolean;
};

/**
 * Format shortcut for display in UI
 * @param alt
 * @param shift
 * @param keys
 */
const buildShortcut = ({ alt, shift, keys }: Shortcut) => {
  if (IS_APPLE) {
    return [alt ? '⌥' : undefined, shift ? '⇧' : undefined, '⌘', ...keys]
      .filter(Boolean)
      .join('');
  }

  // Non Apple device
  return ['Ctrl', alt ? 'Alt' : undefined, shift ? 'Shift' : undefined, ...keys]
    .filter(Boolean)
    .join('+');
};

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const label = props.shortcut
    ? `${props.label} (${buildShortcut(props.shortcut)})`
    : props.label;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={props.onClick}
            aria-label={label}
            disabled={props.disabled}
            className={cn(
              // Fixed size because the SVGs have varying viewBox dimensions.
              'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground',
              'hover:bg-accent disabled:pointer-events-none disabled:opacity-40',
              props.active && 'bg-accent text-accent-foreground',
              props.isDropdown ? '[&_svg]:size-5' : '[&_svg]:size-4',
            )}
          />
        }
      >
        {props.children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
