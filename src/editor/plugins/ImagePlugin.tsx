import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import {
  $insertNodeToNearestRoot,
  isMimeType,
  mergeRegister,
} from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  LexicalCommand,
  createCommand,
} from 'lexical';
import { useSnackbar } from '../lib/snackbar';
import { useEffect } from 'react';

import { ImagePayload } from '../lib/types';

import { humanFileSize } from '../lib/format';
import { $createImageNode, ImageNode } from '../nodes/ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<undefined | ImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

export const tooLargeErrorMessage = (file: string) =>
  `${file} is larger than ${humanFileSize(MAX_FILE_SIZE)}.`;

export const unsupportedTypeErrorMessage = (file: string) =>
  `${file} is not a JPG, PNG, or GIF.`;

/**
 * Max Size for uploaded image
 */
export const MAX_FILE_SIZE = 1024 * 10_000; // 10 MB

/**
 * Acceptable image formats.
 * @see: https://www.litmus.com/blog/png-gif-or-jpeg-which-ones-should-you-use-in-email
 */
export const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
};

export const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { sendErrorAlert } = useSnackbar();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      // Images should be added to the closest root element
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          $insertNodeToNearestRoot($createImageNode(payload));
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // Allow users to drag images into editor to place them. This checks to see if the image is an acceptable
      // format and passes to the INSERT_IMAGE_COMMAND. Dragging multiple files will be inserted one after another
      // within the editor.
      editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => {
          (async () => {
            for (const file of files) {
              if (!isMimeType(file, Object.keys(ACCEPTED_TYPES))) {
                sendErrorAlert(unsupportedTypeErrorMessage(file.name));
                return;
              }

              if (file.size > MAX_FILE_SIZE) {
                sendErrorAlert(tooLargeErrorMessage(file.name));
                return;
              }

              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: file.name,
                initialFile: file,
              });
            }
          })();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  });

  return null;
};
