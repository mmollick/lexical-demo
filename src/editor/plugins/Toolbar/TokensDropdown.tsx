import { LexicalEditor } from 'lexical';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';

import * as Icons from '../../icons';
import { TokenConfig } from '../../lib/tokens';
import { INSERT_TOKEN_COMMAND } from '../TokensPlugin';
import { SimpleMenuItem, SimplePopover } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';

export const TokensDropdown = ({
  editor,
  disabled = false,
  tokens = [],
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  tokens: TokenConfig[];
}) => {
  const [containerRef, showDropdown, setShowDropdown] =
    useCloseOnClickOutside<HTMLDivElement>();

  const handleClick = () => {
    if (!disabled) {
      setShowDropdown((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        label={disabled ? 'Tokens are unavailable in this mode' : 'Insert Field'}
        onClick={handleClick}
        disabled={disabled}
        active={showDropdown}
      >
        <Icons.Merge />
      </ToolbarButton>
      {showDropdown && (
        <SimplePopover className="right-0 max-h-72 overflow-y-auto">
          {tokens.map((opt) => (
            <SimpleMenuItem
              key={opt.name}
              onClick={() => {
                editor.dispatchCommand(INSERT_TOKEN_COMMAND, opt);
                setShowDropdown(false);
              }}
            >
              {opt.label}
            </SimpleMenuItem>
          ))}
        </SimplePopover>
      )}
    </div>
  );
};
