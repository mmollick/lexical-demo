import {
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { ReactNode } from 'react';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';

import * as Icons from '../../icons';
import { SimplePopover, StyledToolbarGroup } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';

export const IndentDropdown = ({
  editor,
  disabled = false,
  children,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  children: ReactNode;
}) => {
  const [containerRef, showDropdown, setShowDropdown] =
    useCloseOnClickOutside<HTMLDivElement>();

  const handleClick = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        label="Indent"
        onClick={handleClick}
        active={showDropdown}
        disabled={disabled}
        isDropdown={true}
      >
        {children}
      </ToolbarButton>
      {showDropdown && (
        <SimplePopover>
          <StyledToolbarGroup>
            <ToolbarButton
              label="Indent"
              onClick={() =>
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
              }
            >
              <Icons.IndentLeft />
            </ToolbarButton>
            <ToolbarButton
              label="Outdent"
              onClick={() =>
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
              }
            >
              <Icons.IndentRight />
            </ToolbarButton>
          </StyledToolbarGroup>
        </SimplePopover>
      )}
    </div>
  );
};
