import { ReactNode } from 'react';
import { TwitterPicker } from 'react-color';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';
import { useEvent } from '../../hooks/useEvent';

import { ToolbarButton } from './ToolbarButton';

type DropdownColorPickerProps = {
  label: string;
  disabled?: boolean;
  children: ReactNode;
  onChange: (color: string) => void;
  default: string;
};
export const DropdownColorPicker = (props: DropdownColorPickerProps) => {
  const [containerRef, showPicker, setShowPicker] =
    useCloseOnClickOutside<HTMLDivElement>();
  const toggleButton = useEvent(() => {
    setShowPicker((prev) => !prev);
  });

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        label={props.label}
        onClick={toggleButton}
        disabled={props.disabled}
        active={showPicker}
        isDropdown={true}
      >
        {props.children}
      </ToolbarButton>
      {showPicker && (
        <div className="absolute right-0 z-50 mt-1">
          <TwitterPicker
            colors={[
              props.default,
              '#FF6900',
              '#FCB900',
              '#00D084',
              '#8ED1FC',
              '#0693E3',
              '#ABB8C3',
              '#EB144C',
              '#F78DA7',
              '#9900EF',
            ]}
            onChange={(color) => props.onChange(color.hex)}
            triangle="top-right"
          />
        </div>
      )}
    </div>
  );
};
