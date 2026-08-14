/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint @typescript-eslint/naming-convention: ["error", {"selector": "default", "format": ['camelCase',
 'PascalCase', 'UPPER_CASE']}]
    --------
    Lexical's TextNode interface doesn't adhere to "strictCamelCase" so we need to modify our ESLint rule
 */
import {
  $applyNodeReplacement,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from 'lexical';
import { IS_TOKEN } from 'lexical/LexicalConstants';

import { SerializedTokenNode, TokenData } from '../lib/types';

const tokenStyle =
  'background-color: rgba(24, 119, 232, 0.2); padding: 2px 4px; border-radius: 4px';

export class TokensNode extends TextNode {
  static getType(): string {
    return 'token';
  }

  static clone(node: TokensNode): TokensNode {
    return new TokensNode(node.token, node.label, node.__key);
  }

  static importJSON({
    name,
    label,
    ...serializedNode
  }: SerializedTokenNode): TokensNode {
    const node = $createTokenNode({ name, label });
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    private readonly token: string,
    private readonly label: string,
    key?: NodeKey,
  ) {
    super(label, key);

    /**
     * Enables Token mode, TextNodes in token mode can be navigated through character-by-character with a
     * RangeSelection, but are deleted as a single entity (not individually by character).
     * @see: https://github.com/facebook/lexical/blob/5a649b964208964d44bc6222f0fcfe3f4840f860/packages/lexical/src/LexicalConstants.ts#L33
     */
    this.__mode = 1;

    /**
     * This is a bitmask that tells Lexical that this node is directionless (is unaffected by RTL and LTR modes )
     * and unmergable (can't be merged with other TextNodes)
     * @see: https://github.com/facebook/lexical/blob/dbb081359c4c2f883f9e68ab9d81d69aa2f1c978/packages/lexical/src/nodes/LexicalTextNode.ts#L386
     */
    this.__detail = 11;
  }

  exportJSON(): SerializedTokenNode {
    return {
      ...super.exportJSON(),
      name: this.token,
      label: this.label,
      type: 'token',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cssText = tokenStyle;
    dom.className = 'token';
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-token', this.token);
    element.textContent = this.label;
    return { element };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity() {
    return true;
  }
}

export function $createTokenNode({ name, label }: TokenData): TokensNode {
  return $applyNodeReplacement(new TokensNode(name, label));
}

export function $isTokenNode(
  node: LexicalNode | null | undefined,
): node is TokensNode {
  return node instanceof TokensNode;
}
