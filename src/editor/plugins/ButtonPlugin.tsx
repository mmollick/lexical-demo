import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';

import { ButtonBlockData } from '../lib/types';

import ButtonNode, { $createButtonNode } from '../nodes/ButtonNode';

export const INSERT_BUTTON_COMMAND: LexicalCommand<
  ButtonBlockData | undefined
> = createCommand('INSERT_BUTTON_COMMAND');

const ButtonPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ButtonNode])) {
      throw new Error(
        'ButtonPlugin: ButtonNode not registered on editor (initialConfig.nodes)',
      );
    }
    return editor.registerCommand(
      INSERT_BUTTON_COMMAND,
      (payload) => {
        const buttonNode = $createButtonNode(payload);
        $insertNodeToNearestRoot(buttonNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
};

export default ButtonPlugin;
