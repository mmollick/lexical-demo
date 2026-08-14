import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DecoratorNode,
  LexicalNode,
  NodeKey,
} from 'lexical';
import { ReactNode } from 'react';

import { DOCUMENT_WIDTH } from '../lib/constants';
import {
  ImagePayload,
  SerializedImageNode,
} from '../lib/types';

import { ImageComponent } from './ImageComponent';

/* eslint @typescript-eslint/naming-convention: ["error", {"selector": "default", "format": ['camelCase',
 'PascalCase', 'UPPER_CASE']}]
    --------
    Lexical's TextNode interface doesn't adhere to "strictCamelCase" so we need to modify our ESLint rule
 */

export class ImageNode extends DecoratorNode<ReactNode> {
  constructor(
    public src?: ImagePayload['src'],
    private altText?: ImagePayload['altText'],
    private stretch: ImagePayload['stretch'] = false,
    private align: ImagePayload['align'] = 'center',
    private initialFile?: ImagePayload['initialFile'],
    private width?: ImagePayload['width'],
    private height?: ImagePayload['height'],
    key?: NodeKey,
  ) {
    super(key);
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.src,
      node.altText,
      node.stretch,
      node.align,
      undefined,
      node.width,
      node.height,
      node.__key,
    );
  }

  static getType(): string {
    return 'image';
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.src,
      altText: this.altText,
      stretch: this.stretch,
      align: this.align,
      width: this.width,
      height: this.height,
      type: 'image',
      version: 1,
    };
  }

  static importJSON(payload: SerializedImageNode) {
    return $createImageNode(payload);
  }

  decorate(): ReactNode {
    return (
      <ImageComponent
        nodeKey={this.getKey()}
        src={this.src}
        altText={this.altText}
        stretch={this.stretch}
        align={this.align}
        initialFile={this.initialFile}
        width={this.width}
        height={this.height}
        maxWidth={DOCUMENT_WIDTH}
      />
    );
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  setState(payload: ImagePayload) {
    const writable = this.getWritable();
    writable.src = payload.src ?? writable.src;
    writable.altText = payload.altText ?? writable.altText;
    writable.align = payload.align ?? writable.align;
    writable.stretch = payload.stretch ?? writable.stretch;
    writable.width = payload.width ?? writable.width;
    writable.height = payload.height ?? writable.height;
  }

  isInline(): boolean {
    return false;
  }
}

const convertImageElement = (domNode: Node): null | DOMConversionOutput => {
  if (domNode instanceof HTMLImageElement) {
    const node = $createImageNode({
      initialFile: domNode.src,
      altText: domNode.alt,
    });
    return { node };
  }
  return null;
};

export function $createImageNode(payload?: ImagePayload) {
  return $applyNodeReplacement(
    new ImageNode(
      payload?.src,
      payload?.altText,
      payload?.stretch,
      payload?.align,
      payload?.initialFile,
      payload?.width,
      payload?.height,
    ),
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

/**
 * Calculates the new image dimensions while maintaining aspect ratio upto a given max width
 */
export const $calculateImageDimension = ({
  originalHeight,
  originalWidth,
  dimension,
  value,
  maxWidth,
}: {
  originalWidth: number;
  originalHeight: number;
  dimension: 'width' | 'height';
  value: number;
  maxWidth: number;
}): { width: number; height: number } => {
  const isWidth = dimension === 'width';
  const multiple = isWidth ? value / originalWidth : value / originalHeight;
  const width = isWidth
    ? value
    : Math.max(0, Math.round(originalWidth * multiple));
  const height = !isWidth
    ? value
    : Math.max(0, Math.floor(originalHeight * multiple));

  // Resize to max-width if our calculated width is greater
  if (width > maxWidth) {
    return $calculateImageDimension({
      originalWidth,
      originalHeight: originalHeight,
      value: maxWidth,
      dimension: 'width',
      maxWidth,
    });
  }

  return {
    width,
    height,
  };
};
