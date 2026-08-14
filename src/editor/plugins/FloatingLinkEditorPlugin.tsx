import {
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useEvent } from '../hooks/useEvent';
import { FloatingMenu } from '../utils/FloatingMenu';
import { getSelectedNode } from '../utils/getSelectedNode';
import { sanitizeUrl } from '../utils/url';

const StyledStack = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-row items-center justify-between gap-4 px-4 py-2">
    {children}
  </div>
);

const StyledContent = ({ children }: { children: React.ReactNode }) => (
  <div className="w-32 overflow-hidden text-ellipsis">{children}</div>
);

/** A small square icon button used by the link editor. */
const IconButton = ({
  className,
  ...rest
}: React.ComponentProps<'button'>) => (
  <button
    type="button"
    {...rest}
    className={cn(
      'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent [&_svg]:size-4',
      className,
    )}
  />
);

export const FloatingLinkEditorPlugin = ({
  anchorEl,
}: {
  anchorEl: HTMLElement;
}) => {
  const [editor] = useLexicalComposerContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeEditor, setActiveEditor] = useState(editor);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [editedLinkUrl, setEditedLinkUrl] = useState('');

  const [isLink, setIsLink] = useState(false);

  /**
   * Verify if the current selection is a link that we should show this plugin on
   */
  const updateIsLink = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);

      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  /**
   * Update editor state when activeEditor is updated (when cursor moves)
   */
  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
        setEditedLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
        setEditedLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
        setEditedLinkUrl('');
      }
    }

    setEditMode(false);
  }, [activeEditor]);

  /**
   * Registers various hooks/commands with the editor
   */
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateIsLink();
          updateLinkEditor();
        });
      }),
      // Check if cursor is moving to a link
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateIsLink();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      // Update our editors state _after_ cursor moves
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      // Hide editor when user keys Esc
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, updateIsLink, setIsLink, isLink]);

  /**
   * Handle "Enter" and "Escape" when user has input focused
   * @param event
   */
  const monitorInputInteraction = useEvent((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditMode(false);
    }
  });

  /**
   * Update link in editor
   */
  const handleLinkSubmission = useEvent(() => {
    if (linkUrl !== '') {
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl(editedLinkUrl),
      );
    }
    setEditMode(false);
  });

  /**
   * Auto-focus input when edit mode enabled
   */
  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <FloatingMenu
      anchorEl={anchorEl}
      open={isLink}
      offset={{ x: 0, y: 10 }}
      placement="bottom-start"
    >
      <StyledStack>
        {isEditMode ? (
          <>
            <StyledContent>
              <Input
                ref={inputRef}
                className="h-8 min-w-0 rounded-none border-0 border-b border-input px-0 shadow-none focus-visible:ring-0"
                value={editedLinkUrl}
                onChange={(event) => {
                  setEditedLinkUrl(event.target.value);
                }}
                onKeyDown={(event) => {
                  monitorInputInteraction(event);
                }}
              />
            </StyledContent>
            <div>
              <IconButton
                title="Cancel"
                onClick={() => {
                  setEditMode(false);
                }}
              >
                <X />
              </IconButton>
              <IconButton title="Save" onClick={handleLinkSubmission}>
                <Check />
              </IconButton>
            </div>
          </>
        ) : (
          <>
            <StyledContent>
              <a
                href={sanitizeUrl(linkUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkUrl}
              </a>
            </StyledContent>
            <div>
              <IconButton
                title="Edit Link"
                onClick={() => {
                  setEditedLinkUrl(linkUrl);
                  setEditMode(true);
                }}
              >
                <Pencil />
              </IconButton>
              <IconButton
                title="Remove Link"
                onClick={() => {
                  activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                  // Force a SELECTION_CHANGE_COMMAND to refresh toolbar and this plugin's state since selection
                  // hasn't actually changed - but the component type has.
                  activeEditor.dispatchCommand(
                    SELECTION_CHANGE_COMMAND,
                    undefined,
                  );
                }}
              >
                <Trash2 />
              </IconButton>
            </div>
          </>
        )}
      </StyledStack>
    </FloatingMenu>
  );
};
