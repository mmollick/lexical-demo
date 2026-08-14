import { ComponentProps, ReactNode, forwardRef } from 'react';

import { cn } from '@/lib/utils';

export const Container = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    isSelected: boolean;
    hasImage: boolean;
    readOnly: boolean;
  }
>(({ isSelected, hasImage, readOnly, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={cn(
      'relative my-4 overflow-hidden outline-none',
      !hasImage && 'rounded-md bg-muted px-8 py-4',
      readOnly ? 'cursor-default' : 'cursor-pointer',
      isSelected && !readOnly && 'min-h-18 shadow-md',
      className,
    )}
  />
));
Container.displayName = 'Container';

export const ImageToolboxOverlay = ({ children }: { children: ReactNode }) => (
  <div className="absolute flex h-full w-full items-start justify-end bg-white/40 p-4">
    {children}
  </div>
);

export const DropzoneWrapper = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & { isDragActive?: boolean; isDragReject?: boolean }
>(({ isDragActive, isDragReject, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={cn(
      isDragActive && 'opacity-70',
      isDragReject && 'text-destructive',
      className,
    )}
  />
));
DropzoneWrapper.displayName = 'DropzoneWrapper';

/** A small bordered icon button used inside the image toolbox. */
export const ToolboxIconButton = ({
  className,
  ...rest
}: ComponentProps<'button'>) => (
  <button
    type="button"
    {...rest}
    className={cn(
      'rounded-md border border-input p-2 text-foreground hover:bg-accent',
      className,
    )}
  />
);

export const ToolboxInputLabel = ({
  className,
  ...rest
}: ComponentProps<'label'>) => (
  <label {...rest} className={cn('text-sm text-muted-foreground', className)} />
);
