import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from 'lexical';
import { useCallback, useEffect } from 'react';

import { ButtonBlockData } from '../../lib/types';

import Button from '../../components/Button/Button';

import { $isButtonNode } from './ButtoneNode';

type ButtonComponentProps = {
  nodeKey: NodeKey;
} & ButtonBlockData;

const ButtonComponent = ({ nodeKey, ...props }: ButtonComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  const updateEditor = useCallback(
    (data: ButtonBlockData) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isButtonNode(node)) {
          node.setState(data);
        }
      });
    },
    [editor, nodeKey],
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      const buttonElem = editor.getElementByKey(nodeKey);
      if (event.target instanceof Node && buttonElem?.contains(event.target)) {
        // Allow shift key to modify behavior to support multi-selection
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [editor, isSelected, setSelected, clearSelection, nodeKey],
  );

  /**
   * Handle removal of the component using keyboard events
   */
  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isButtonNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  /**
   * Register listeners for editor commands
   */
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, onClick, onDelete, setSelected]);
  return (
    <Button
      readOnly={!editor.isEditable()}
      initialState={props}
      isSelected={isSelected}
      onChange={updateEditor}
    />
  );
};

export default ButtonComponent;
