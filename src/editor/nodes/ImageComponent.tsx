import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { Pencil, Trash2 } from 'lucide-react';
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { ImagePayload } from '../lib/types';

import useImageUpload from '../lib/useImageUpload';

import { useSnackbar } from '../lib/snackbar';
import { LoadingContent } from '../components/LoadingContent';
import {
  ACCEPTED_TYPES,
  MAX_FILE_SIZE,
  tooLargeErrorMessage,
  unsupportedTypeErrorMessage,
} from '../plugins/ImagePlugin';
import { getFileFromUrl, isMimeType } from '../utils/file';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Container,
  DropzoneWrapper,
  ImageToolboxOverlay,
} from './ImageComponent.styled';
import { $calculateImageDimension, $isImageNode } from './ImageNode';
import { ImageToolboxComponent } from './ImageToolboxComponent';

type ImageComponentProps = {
  /**
   * Lexical's NodeKey for this node
   */
  nodeKey: NodeKey;
  /**
   * The maximum width at witch the image can be displayed
   */
  maxWidth: number;
} & ImagePayload;

const ImageOverlay = ({
  nodeKey,
  isSelected,
  altText,
  stretch,
  align,
  openDropzone,
  width,
  height,
  maxWidth,
  originalWidth,
  originalHeight,
}: ImageComponentProps & {
  isSelected: boolean;
  openDropzone: () => void;
  originalWidth: number;
  originalHeight: number;
}) => {
  const [toolboxOpen, setToolboxOpen] = React.useState(false);
  const [editor] = useLexicalComposerContext();

  const onDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.remove();
      }
    });
  };

  return (
    <ImageToolboxOverlay>
      <div className="flex flex-row gap-2">
        <Popover open={toolboxOpen} onOpenChange={setToolboxOpen}>
          <PopoverTrigger
            render={<Button size="icon" aria-label="Edit image" />}
          >
            <Pencil />
          </PopoverTrigger>
          <PopoverContent align="end" side="bottom" className="w-72">
            <ImageToolboxComponent
              align={align}
              stretch={stretch}
              altText={altText}
              width={width}
              height={height}
              originalHeight={originalHeight}
              originalWidth={originalWidth}
              maxWidth={maxWidth}
              nodeKey={nodeKey}
              openDropzone={openDropzone}
            />
          </PopoverContent>
        </Popover>
        <Button size="icon" aria-label="Delete image" onClick={onDelete}>
          <Trash2 />
        </Button>
      </div>
    </ImageToolboxOverlay>
  );
};

export const PlaceholderContent = ({ open }: { open: () => void }) => (
  <div className="flex w-full flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left">
    <div className="flex flex-row items-center justify-center gap-2 p-6">
      <p className="text-lg font-semibold">Drag &amp; Drop or</p>
      <Button onClick={open} variant="outline">
        Select File
      </Button>
    </div>
  </div>
);

export const ImageComponent = (props: ImageComponentProps) => {
  const {
    nodeKey,
    src,
    altText,
    initialFile,
    stretch,
    align,
    width,
    height,
    maxWidth,
  } = props;
  const [editor] = useLexicalComposerContext();
  const componentRef = useRef<null | HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const { sendErrorAlert } = useSnackbar();
  const [originalDimensions, setOriginalDimensions] = useState<{
    height?: number;
    width?: number;
  }>({ height: undefined, width: undefined });
  const { mutate, isLoading } = useImageUpload({
    onSuccess: (result) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setState({
            src: result.url,
            altText: altText ?? result.file.name,
          });
        }
      });
    },
    onError: () => {
      sendErrorAlert('Error uploading file');
    },
  });

  const readOnly = !editor.isEditable();

  useEffect(() => {
    // If an initialFile is provided upload it as soon as were mounted. Images pasted from other documents will be
    // presented as URLs so we need to load the file before uploading it
    // TODO: there may be a better way to handle this
    if (initialFile) {
      if (typeof initialFile === 'string') {
        const allowedTypes = Object.keys(ACCEPTED_TYPES);
        getFileFromUrl(initialFile, allowedTypes)
          .then((file: File) => {
            if (!isMimeType(file, allowedTypes)) {
              sendErrorAlert(unsupportedTypeErrorMessage('Pasted file'));
              return;
            }

            if (file.size > MAX_FILE_SIZE) {
              sendErrorAlert(tooLargeErrorMessage('Pasted file'));
              return;
            }

            mutate(file);
          })
          .catch((e) => {
            sendErrorAlert('Pasted file was unable to be imported');
            console.error(e);
          });
      } else {
        mutate(initialFile);
      }
    }

    setSelected(true);
  }, []);

  /**
   * Setup Dropzone to support image uploads
   */
  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: ACCEPTED_TYPES,
      multiple: false,
      maxFiles: 1,
      maxSize: MAX_FILE_SIZE,
      disabled: isLoading || readOnly,
      noClick: true,
      noKeyboard: true,
      noDragEventsBubbling: true, // Required, otherwise conflicts with handling of images drag directly into editor
      onDropAccepted: (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
          // don't trigger when no updates
          return;
        }

        acceptedFiles.map((file) => mutate(file));
      },
      onDropRejected: (fileRejections) => {
        const file = fileRejections[0]?.file;
        const code = fileRejections[0]?.errors[0]?.code;
        if (file && code) {
          switch (code) {
            case 'file-invalid-type':
              sendErrorAlert(unsupportedTypeErrorMessage(file.name));
              return;
            case 'file-too-large':
              sendErrorAlert(tooLargeErrorMessage(file.name));
              return;
            default:
              return;
          }
        }
      },
    });

  /**
   * Clicking on container will update Lexical's selection state
   */
  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;
      if (
        event.target instanceof Element &&
        (componentRef.current === event.target ||
          componentRef.current?.contains(event.target))
      ) {
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
    [isSelected, setSelected, clearSelection],
  );

  /**
   * Handle removal of the component using keyboard events
   */
  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
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

  /**
   * Get image's original dimensions and calculate appropriate width
   */
  useEffect(() => {
    if (src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const { naturalHeight, naturalWidth } = img;
        setOriginalDimensions({ height: naturalHeight, width: naturalWidth });
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.setState(
              $calculateImageDimension({
                originalWidth: naturalWidth,
                originalHeight: naturalHeight,
                value: naturalWidth,
                dimension: 'width',
                maxWidth,
              }),
            );
          }
        });
      };
    }
  }, [src]);

  return (
    <Container
      ref={componentRef}
      isSelected={isSelected}
      hasImage={!!src && !isLoading}
      readOnly={readOnly}
    >
      <DropzoneWrapper
        {...getRootProps()}
        isDragActive={isDragActive}
        isDragReject={isDragReject}
      >
        <input {...getInputProps()} />
        {isLoading && <LoadingContent />}
        {!isLoading && !src && <PlaceholderContent open={open} />}
        {src && isSelected && !readOnly && (
          <ImageOverlay
            isSelected={isSelected}
            openDropzone={open}
            originalWidth={originalDimensions.width ?? 0}
            originalHeight={originalDimensions.height ?? 0}
            {...props}
          />
        )}
        {!isLoading && src && (
          <p
            style={{
              textAlign: align,
              margin: 0,
            }}
          >
            <img
              alt={altText ?? ''}
              src={src}
              height={height ?? 'auto'}
              width={width ?? 'auto'}
              style={{
                verticalAlign: 'middle',
                ...(stretch && {
                  width: '100%',
                  height: 'auto',
                }),
              }}
            />
          </p>
        )}
      </DropzoneWrapper>
    </Container>
  );
};
