import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LexicalEditor } from 'lexical';
import { ReactNode, useCallback } from 'react';

import { MailableFormat } from '../../lib/types';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';

import * as Icons from '../../icons';
import { sanitizeUrl } from '../../utils/url';
import { INSERT_BUTTON_COMMAND } from '../ButtonPlugin';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';
import { SimplePopover, StyledToolbarGroup } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';

export const InsertDropdown = ({
  editor,
  disabled = false,
  isLink,
  format,
  children,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  isLink: boolean;
  format: MailableFormat;
  children: ReactNode;
}) => {
  const [containerRef, showDropdown, setShowDropdown] =
    useCloseOnClickOutside<HTMLDivElement>();

  const handleClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    setShowDropdown(false);
  }, [editor, setShowDropdown, isLink]);

  const insertButton = useCallback(() => {
    editor.dispatchCommand(INSERT_BUTTON_COMMAND, undefined);
    setShowDropdown(false);
  }, [editor, setShowDropdown]);

  const insertImage = useCallback(() => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, undefined);
    setShowDropdown(false);
  }, [editor, setShowDropdown]);

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        label="Insert"
        onClick={handleClick}
        disabled={disabled}
        active={showDropdown}
        isDropdown={true}
      >
        {children}
      </ToolbarButton>
      {showDropdown && (
        <SimplePopover>
          <StyledToolbarGroup>
            <ToolbarButton
              label="Insert Link"
              onClick={insertLink}
              active={isLink}
            >
              <Icons.AddLink />
            </ToolbarButton>
            {format === MailableFormat.TEMPLATE && (
              <ToolbarButton label="Insert Button" onClick={insertButton}>
                <Icons.AddButton />
              </ToolbarButton>
            )}
            <ToolbarButton label="Insert Image" onClick={insertImage}>
              <Icons.AddImage />
            </ToolbarButton>
          </StyledToolbarGroup>
        </SimplePopover>
      )}
    </div>
  );
};
