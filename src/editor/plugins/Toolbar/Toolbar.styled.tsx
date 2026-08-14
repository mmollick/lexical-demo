import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export const StyledToolbar = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full items-center justify-between p-2">{children}</div>
);

export const StyledToolbarGroup = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-between gap-1">{children}</div>
);

/**
 * A plain positioned panel rather than a portalled popover: the surrounding
 * dropdowns close via useCloseOnClickOutside so that clicking into the editor
 * keeps Lexical's selection intact.
 */
export const SimplePopover = ({ className, ...rest }: ComponentProps<'div'>) => (
  <div
    {...rest}
    className={cn(
      'absolute z-50 mt-1 rounded-lg bg-popover px-2 py-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',
      className,
    )}
  />
);

/** A single row inside SimplePopover. */
export const SimpleMenuItem = ({
  selected,
  className,
  ...rest
}: ComponentProps<'button'> & { selected?: boolean }) => (
  <button
    type="button"
    {...rest}
    className={cn(
      'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap hover:bg-accent',
      selected && 'bg-accent text-accent-foreground',
      className,
    )}
  />
);
