import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import { TokenConfig } from '../../lib/tokens';
import { MailableFormat } from '../../lib/types';

import { getSelectedNode } from '../../utils/getSelectedNode';

import { useEvent } from '../../hooks/useEvent';
import * as Icons from '../../icons';
import { sanitizeUrl } from '../../utils/url';
import { AlignmentDropDown } from './AlignDropdown';
import { BlockFormatDropDown } from './BlockFormatDropdown';
import { DropdownColorPicker } from './DropdownColorPicker';
import { IndentDropdown } from './IndentDropdown';
import { InsertDropdown } from './InsertDropdown';
import { TokensDropdown } from './TokensDropdown';
import { StyledToolbar, StyledToolbarGroup } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';
import ToolbarSelect from './ToolbarSelect';

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

export type BlockTypes = keyof typeof blockTypeToBlockName;

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

const FontDropDown = ({
  editor,
  value,
  style,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
}) => {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const options =
    style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS;

  return (
    <ToolbarSelect value={value} onChange={handleClick} options={options} />
  );
};

type RenderProp = { children: ReactNode };
type ToolbarProps = {
  format?: MailableFormat;
  tokens: TokenConfig[];
  renderRightGroup?: (props: RenderProp) => ReactNode;
};

export const Toolbar = ({
  format = MailableFormat.TEMPLATE,
  tokens,
  renderRightGroup,
}: ToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<string>('15px');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  /**
   * Keeps tools in sync with the state of the current cursor position
   */
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDom = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDom !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      setElementFormat(
        ($isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType()) || 'left',
      );
    }
  }, [activeEditor]);

  /**
   * Updates the activeEditor when cursor moves, this works in combination $updateToolBar to keep the toolbar up to
   * date with our current selection/cursor position
   */
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  /**
   * Updates the state to tell us if undo/redo actions are available (e.g. disable redo if there's nothing to redo)
   */
  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [activeEditor, editor]);

  /**
   * Adds support for CMD+K to create links
   */
  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault();
          return activeEditor.dispatchCommand(
            TOGGLE_LINK_COMMAND,
            sanitizeUrl('https://'),
          );
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ 'background-color': value });
    },
    [applyStyleText],
  );

  const formatBulletList = useEvent(() => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  });

  const formatNumberedList = useEvent(() => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  });

  return (
    <StyledToolbar>
      <StyledToolbarGroup>
        <ToolbarButton
          label={
            format === MailableFormat.UPLOAD_HTML
              ? 'History is unavailable in this mode'
              : 'Undo'
          }
          shortcut={{ keys: ['Z'] }}
          disabled={format === MailableFormat.UPLOAD_HTML || !canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Icons.Undo />
        </ToolbarButton>
        <ToolbarButton
          label={
            format === MailableFormat.UPLOAD_HTML
              ? 'History is unavailable in this mode'
              : 'Redo'
          }
          shortcut={{ shift: true, keys: ['Z'] }}
          disabled={format === MailableFormat.UPLOAD_HTML || !canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Icons.Redo />
        </ToolbarButton>
      </StyledToolbarGroup>

      {format !== MailableFormat.UPLOAD_HTML && (
        <StyledToolbarGroup>
          {format === MailableFormat.TEMPLATE && (
            <>
              <BlockFormatDropDown
                blockType={blockType as any}
                editor={editor}
              />
              <FontDropDown
                editor={activeEditor}
                value={fontFamily}
                style="font-family"
              />
              <FontDropDown
                editor={activeEditor}
                value={fontSize}
                style="font-size"
              />
            </>
          )}

          <ToolbarButton
            label="Bold"
            shortcut={{ keys: ['B'] }}
            active={isBold}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          >
            <Icons.Bold />
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            shortcut={{ keys: ['I'] }}
            active={isItalic}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
          >
            <Icons.Italic />
          </ToolbarButton>

          <ToolbarButton
            label="Underline"
            shortcut={{ keys: ['U'] }}
            active={isUnderline}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
          >
            <Icons.Underline />
          </ToolbarButton>

          <DropdownColorPicker
            label="Font Color"
            onChange={onFontColorSelect}
            default="#000000"
          >
            <Icons.Fontcolor />
          </DropdownColorPicker>

          <DropdownColorPicker
            label="Highlight Color"
            onChange={onBgColorSelect}
            default="transparent"
          >
            <Icons.BgColor />
          </DropdownColorPicker>

          <AlignmentDropDown editor={editor} value={elementFormat} />
          {format === MailableFormat.TEMPLATE && (
            <>
              <IndentDropdown editor={editor}>
                <Icons.Indent />
              </IndentDropdown>

              <ToolbarButton
                active={blockType === 'bullet'}
                label="Bullet List"
                onClick={formatBulletList}
              >
                <Icons.List />
              </ToolbarButton>

              <ToolbarButton
                active={blockType === 'number'}
                label="Number List"
                onClick={formatNumberedList}
              >
                <Icons.NumList />
              </ToolbarButton>
            </>
          )}
          <InsertDropdown editor={editor} isLink={isLink} format={format}>
            <Icons.Add />
          </InsertDropdown>
        </StyledToolbarGroup>
      )}
      <StyledToolbarGroup>
        {renderRightGroup &&
          renderRightGroup({
            children: (
              <>
                <TokensDropdown
                  editor={editor}
                  tokens={tokens}
                  disabled={format === MailableFormat.UPLOAD_HTML}
                />
              </>
            ),
          })}
        {!renderRightGroup && (
          <TokensDropdown editor={editor} tokens={tokens} />
        )}
      </StyledToolbarGroup>
    </StyledToolbar>
  );
};
