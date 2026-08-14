import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { Type } from 'lucide-react';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
} from 'lexical';

import useCloseOnClickOutside from '../../hooks/useCloseOnClickOutside';
import { useEvent } from '../../hooks/useEvent';

import { BlockTypes } from './Toolbar';
import { SimpleMenuItem, SimplePopover } from './Toolbar.styled';
import { ToolbarButton } from './ToolbarButton';

export const BlockFormatDropDown = ({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: BlockTypes;
  editor: LexicalEditor;
  disabled?: boolean;
}) => {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) ||
        DEPRECATED_$isGridSelection(selection)
      ) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const opts: Array<{ val: BlockTypes; label: string; action: () => void }> = [
    { val: 'paragraph', label: 'Paragraph', action: formatParagraph },
    { val: 'h1', label: 'Heading 1', action: () => formatHeading('h1') },
    { val: 'h2', label: 'Heading 2', action: () => formatHeading('h2') },
    { val: 'h3', label: 'Heading 3', action: () => formatHeading('h3') },
    { val: 'h4', label: 'Heading 4', action: () => formatHeading('h4') },
    { val: 'h5', label: 'Heading 5', action: () => formatHeading('h5') },
    { val: 'h6', label: 'Heading 6', action: () => formatHeading('h6') },
  ];

  const handleChange = (val: string) => {
    opts.find((opt) => opt.val === val)?.action();
  };

  const [containerRef, showPicker, setShowPicker] =
    useCloseOnClickOutside<HTMLDivElement>();
  const handleClick = useEvent(() => {
    setShowPicker((prev) => !prev);
  });

  return (
    <div ref={containerRef} className="relative">
      <ToolbarButton
        label="Format Text"
        onClick={handleClick}
        disabled={disabled}
        active={showPicker}
      >
        <Type />
      </ToolbarButton>
      {showPicker && (
        <SimplePopover>
          {opts.map((opt) => (
            <SimpleMenuItem
              key={opt.val}
              selected={blockType === opt.val}
              onClick={() => handleChange(opt.val)}
            >
              {opt.label}
            </SimpleMenuItem>
          ))}
        </SimplePopover>
      )}
    </div>
  );
};
