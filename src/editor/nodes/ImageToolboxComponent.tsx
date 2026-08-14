import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Image as ImageIcon,
  Link2,
  Maximize2,
} from 'lucide-react';
import { useDebouncedCallback, useDeepCompareEffect } from '@react-hookz/web';
import { $getNodeByKey, NodeKey } from 'lexical';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { ImagePayload } from '../lib/types';

import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { ToolboxIconButton, ToolboxInputLabel } from './ImageComponent.styled';
import { $calculateImageDimension, $isImageNode } from './ImageNode';

type ImageToolboxComponent = {
  align: ImagePayload['align'];
  stretch: ImagePayload['stretch'];
  altText: ImagePayload['altText'];
  width: ImagePayload['width'];
  height: ImagePayload['height'];
  originalWidth: number;
  originalHeight: number;
  maxWidth: number;
  nodeKey: NodeKey;
  openDropzone: () => void;
};

export const ImageToolboxComponent = ({
  align,
  stretch,
  altText,
  width,
  height,
  originalWidth,
  originalHeight,
  maxWidth,
  nodeKey,
  openDropzone,
}: ImageToolboxComponent) => {
  const [editor] = useLexicalComposerContext();

  /**
   * Use RHF to handle field values
   */
  const {
    register,
    trigger,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { altText, width, height },
    mode: 'onTouched',
  });
  const data = watch();

  /**
   * Width and height may be undefined when this component is mounted. This ensures we update RHF's state to match the external state.
   */
  useEffect(() => {
    setValue('width', width);
    setValue('height', height);
  }, [width, height]);

  /**
   * Update node with values from Toolbox
   */
  const updateNodeState = (
    data: Pick<
      ImagePayload,
      'stretch' | 'align' | 'altText' | 'width' | 'height'
    >,
  ) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setState(data);
      }
    });
  };

  /**
   * The popover unmounts this component when it closes, which can happen inside
   * the debounce window below. Flush the pending edit on the way out so a quick
   * type-then-close does not lose the change.
   *
   * This deliberately does not call onClose: the popover owns its open state,
   * and closing from here fires on StrictMode's double-mount, shutting the
   * toolbox the instant it opens.
   */
  const pendingRef = useRef({ data, isDirty });
  pendingRef.current = { data, isDirty };
  useEffect(
    () => () => {
      const { data: latest, isDirty: dirty } = pendingRef.current;
      if (dirty) {
        updateNodeState(latest);
      }
    },
    [],
  );

  /**
   * Support updating values on the fly via a debounce
   */
  const debouncedSave = useDebouncedCallback(
    async (data) => {
      await trigger();
      updateNodeState(data);
    },
    [],
    500,
  );

  useDeepCompareEffect(() => {
    if (isDirty) {
      debouncedSave(data);
    }
  }, [data]);

  /**
   * Handles updates from height and width fields to keep dimensions locked to original aspect ratio
   * @param event
   * @param dimension
   */
  const dimensionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    dimension: 'width' | 'height',
  ) => {
    const { width: newWidth, height: newHeight } = $calculateImageDimension({
      originalHeight: originalHeight,
      originalWidth: originalWidth,
      dimension: dimension,
      value: Number(event.target.value),
      maxWidth: maxWidth,
    });

    setValue('width', newWidth);
    setValue('height', newHeight);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between gap-1">
        <ToggleGroup
          size="sm"
          variant="outline"
          value={align ? [align] : []}
          onValueChange={(value: string[]) =>
            updateNodeState({ align: value[0] as ImagePayload['align'] })
          }
          disabled={stretch}
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <Toggle
          size="sm"
          variant="outline"
          pressed={!!stretch}
          onPressedChange={() => updateNodeState({ stretch: !stretch })}
          aria-label="Stretch"
          title="Stretch"
        >
          <Maximize2 />
        </Toggle>
        <ToolboxIconButton onClick={openDropzone} aria-label="Replace image">
          <ImageIcon className="size-4" />
        </ToolboxIconButton>
      </div>

      <div className="flex flex-col gap-1">
        <ToolboxInputLabel htmlFor="altText">Alt Text</ToolboxInputLabel>
        <Input
          id="altText"
          aria-invalid={!!errors?.altText}
          type="text"
          {...register('altText', { required: true })}
        />
      </div>

      <div className="flex flex-row items-end justify-between gap-1">
        <div className="flex flex-col gap-1">
          <ToolboxInputLabel htmlFor="width">Width</ToolboxInputLabel>
          <Input
            id="width"
            className="w-24"
            disabled={stretch}
            aria-invalid={!!errors?.width}
            type="number"
            {...register('width', {
              required: true,
              min: 0,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                dimensionChange(event, 'width'),
            })}
          />
        </div>
        <span className="pb-2 text-muted-foreground">
          <Link2 className="size-4" />
        </span>
        <div className="flex flex-col gap-1">
          <ToolboxInputLabel htmlFor="height">Height</ToolboxInputLabel>
          <Input
            id="height"
            className="w-24"
            disabled={stretch}
            aria-invalid={!!errors?.height}
            type="number"
            {...register('height', {
              required: true,
              min: 0,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                dimensionChange(event, 'height'),
            })}
          />
        </div>
      </div>
    </div>
  );
};
