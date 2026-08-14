import { ComponentProps, ReactNode, forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { styles } from '../../lib/styles';

export const ButtonContainer = ({
  isSelected,
  children,
}: {
  isSelected: boolean;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'relative flex flex-col items-center justify-center gap-2 p-2',
      isSelected && 'shadow-md',
    )}
    style={{ margin: styles.button.margin }}
  >
    {children}
  </div>
);

/**
 * The in-editor preview of the button. Colors are per-node and set by the user,
 * so they stay inline; the rest matches the rendered email styles.
 */
export const RenderedButton = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    backgroundColor: string;
    color: string;
    hasErrors?: boolean;
  }
>(({ children, backgroundColor, color, hasErrors, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={cn(
      'cursor-pointer transition-opacity hover:opacity-75',
      hasErrors && 'border border-destructive',
      className,
    )}
    style={{
      backgroundColor,
      color,
      borderRadius: styles.button.borderRadius,
      padding: styles.button.padding,
      fontSize: styles.button.fontSize,
      lineHeight: styles.button.lineHeight,
    }}
  >
    {children}
  </div>
));

RenderedButton.displayName = 'RenderedButton';
