import {
  $applyNodeReplacement,
  DecoratorNode,
  LexicalNode,
  NodeKey,
} from 'lexical';
import { ReactNode } from 'react';

import { ButtonBlockData } from '../../lib/types';
import {
  ButtonPayload,
  SerializedButtonNode,
} from '../../lib/types';

import ButtonComponent from './ButtonComponent';

/* eslint @typescript-eslint/naming-convention: ["error", {"selector": "default", "format": ['camelCase',
 'PascalCase', 'UPPER_CASE']}]
    --------
    Lexical's DecoratorNode interface doesn't adhere to "strictCamelCase" so we need to modify our ESLint rule
 */

export default class ButtonNode extends DecoratorNode<ReactNode> {
  private url: string;
  private label: string;
  private color: string;
  private backgroundColor: string;

  static getType(): string {
    return 'button';
  }

  static clone(node: ButtonNode): ButtonNode {
    return new ButtonNode(
      node.url,
      node.label,
      node.color,
      node.backgroundColor,
      node.key,
    );
  }

  static importJSON(node: SerializedButtonNode): LexicalNode {
    return new ButtonNode(
      node.url,
      node.label,
      node.color,
      node.backgroundColor,
      undefined,
    );
  }

  exportJSON(): SerializedButtonNode {
    return {
      url: this.url,
      label: this.label,
      color: this.color,
      backgroundColor: this.backgroundColor,
      type: this.getType(),
      version: 1,
    };
  }

  constructor(
    url?: string,
    label?: string,
    color?: string,
    backgroundColor?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.url = url ?? '';
    this.label = label ?? 'Button Text';
    this.color = color ?? '#FFFFFF';
    this.backgroundColor = backgroundColor ?? '#4C8BEA';
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): boolean {
    return false;
  }

  setState(state: ButtonBlockData) {
    const writeable = this.getWritable();
    writeable.url = state.url;
    writeable.label = state.label;
    writeable.color = state.color;
    writeable.backgroundColor = state.backgroundColor;
  }

  decorate(): ReactNode {
    return (
      <ButtonComponent
        url={this.url}
        label={this.label}
        color={this.color}
        backgroundColor={this.backgroundColor}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createButtonNode(payload?: ButtonPayload) {
  return $applyNodeReplacement(
    new ButtonNode(
      payload?.url,
      payload?.label,
      payload?.color,
      payload?.backgroundColor,
    ),
  );
}

export function $isButtonNode(
  node: LexicalNode | null | undefined,
): node is ButtonNode {
  return node instanceof ButtonNode;
}
