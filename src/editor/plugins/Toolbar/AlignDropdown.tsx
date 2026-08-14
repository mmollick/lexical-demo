import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  LexicalEditor,
} from 'lexical';
import upperFirst from 'lodash/upperFirst';
import { ReactNode } from 'react';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';

import * as Icons from '../../icons';
import { SimplePopover, StyledToolbarGroup } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';

const AlignmentOptions: Array<{ icon: ReactNode; value: ElementFormatType }> = [
  {
    icon: <Icons.AlignmentLeft />,
    value: 'left',
  },
  {
    icon: <Icons.AlignmentCenter />,
    value: 'center',
  },
  {
    icon: <Icons.AlignmentRight />,
    value: 'right',
  },
  {
    icon: <Icons.AlignmentJustified />,
    value: 'justify',
  },
];

export const AlignmentDropDown = ({
  editor,
  value,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  disabled?: boolean;
}) => {
  const [containerRef, showDropdown, setShowDropdown] =
    useCloseOnClickOutside<HTMLDivElement>();

  const handleClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const current = AlignmentOptions.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative">
      {/*Note: our icon doesn't include a dropdown indicator so we don't set isDropdown to true*/}
      <ToolbarButton
        label="Align"
        onClick={handleClick}
        disabled={disabled}
        active={showDropdown}
      >
        {current?.icon || <Icons.Alignment />}
      </ToolbarButton>
      {showDropdown && (
        <SimplePopover>
          <StyledToolbarGroup>
            {AlignmentOptions.map((opt) => (
              <ToolbarButton
                key={opt.value}
                label={upperFirst(opt.value)}
                onClick={() =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, opt.value)
                }
              >
                {opt.icon}
              </ToolbarButton>
            ))}
          </StyledToolbarGroup>
        </SimplePopover>
      )}
    </div>
  );
};
