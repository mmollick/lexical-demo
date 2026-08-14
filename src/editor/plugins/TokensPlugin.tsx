/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { mergeRegister } from '@lexical/utils';
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  TextNode,
  createCommand,
} from 'lexical';
import * as React from 'react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';

import { TOKEN_REGEX, TokenConfig } from '../lib/tokens';
import { TokenData } from '../lib/types';

import { $createTokenNode, TokensNode } from '../nodes/TokensNode';
import { SimpleMenuItem } from './Toolbar/Toolbar.styled';

export const INSERT_TOKEN_COMMAND: LexicalCommand<TokenData> = createCommand(
  'INSERT_TOKEN_COMMAND',
);

const TRIGGER_COMBO = '{{';
// Include space character to enable filtering by labels rather than actual token names
const VALID_CHARS = '[a-z_.:\\s]';
const LENGTH_LIMIT = 128;
const TRIGGER_REGEX = new RegExp(
  `(^|\\s|\\()(${TRIGGER_COMBO}((?:${VALID_CHARS}){0,${LENGTH_LIMIT}}))$`,
  'i',
);

class TokenOption extends MenuOption {
  constructor(public readonly name: string, public readonly label: string) {
    super(name);
  }
}

const StyledTypeaheadMenu = ({ children }: { children: ReactNode }) => (
  <div
    role="menu"
    className="mt-8 max-h-52 w-64 overflow-x-hidden overflow-y-auto rounded-md bg-popover py-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
  >
    {children}
  </div>
);

type TokenPluginProps = {
  tokens: TokenConfig[];
};

/**
 * Checks if text starts with `{{` and finds the offset to tell our typeahead component to open
 * @param text
 */
const checkForTokenTrigger = (text: string): MenuTextMatch | null => {
  const match = TRIGGER_REGEX.exec(text);

  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= 0) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
};

/**
 * Handles replacement of tokens when typed or pasted
 * @param node
 * @param availableTokens
 */
const findAndTransformToken = (
  node: TextNode,
  availableTokens: TokenConfig[],
) => {
  const text = node.getTextContent();
  const matchArr = TOKEN_REGEX.exec(text);

  if (matchArr) {
    // Ensure the matched text is a token that we support for this user, otherwise do nothing.
    const tokenConfig = availableTokens.find(
      (value) => value.name === matchArr[1],
    );

    if (!tokenConfig) {
      return null;
    }

    const startOffset = matchArr.index;
    const endOffset = startOffset + matchArr[0].length;

    // We split the existing text node based on the offsets calculate above. This gives us new TextNodes, one of which
    // contains only the string/token we matched, while others contain the rest of the original TextNodes. With the
    // newly isolated TextNode containing our match we can replace it with a newly created TokenNode. For this we
    // need to know which node to target, if our startOffset is 0 it will be the first node returned by splitText
    // otherwise it'll be the second.
    const [firstNode, secondNode] = node.splitText(startOffset, endOffset);
    const replacementNode = $createTokenNode(tokenConfig);
    (startOffset === 0 ? firstNode : secondNode).replace(replacementNode);
    return replacementNode;
  }

  return null;
};

export const TokensPlugin = ({ tokens }: TokenPluginProps) => {
  const [editor] = useLexicalComposerContext();
  const [needle, setNeedle] = useState<string | null>(null);

  useEffect(() => {
    if (!editor.hasNodes([TokensNode])) {
      throw new Error('TokensPlugin: TokenNode not registered on editor');
    }

    return mergeRegister(
      // Registers token insertion command
      editor.registerCommand<TokenData>(
        INSERT_TOKEN_COMMAND,
        (payload) => {
          const tokenNode = $createTokenNode(payload);
          $insertNodes([tokenNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // Adds handler to transform token like text into Tokens when typed or pasted
      editor.registerNodeTransform(TextNode, (node: TextNode) => {
        let targetNode: TextNode | null = node;
        while (targetNode !== null) {
          if (!targetNode.isSimpleText()) {
            return;
          }

          targetNode = findAndTransformToken(targetNode, tokens);
        }
      }),
    );
  }, [editor]);

  // Wrap all tokens in TokenOption object
  const availableOptions = useMemo(
    () => tokens.map(({ name, label }) => new TokenOption(name, label)),
    [tokens],
  );

  const filteredOptions = useMemo(
    () =>
      needle
        ? availableOptions.filter((token) =>
            token.label.toLowerCase().includes(needle.toLowerCase()),
          )
        : availableOptions,
    [availableOptions, needle],
  );

  const onSelectOption = useCallback(
    (
      option: TokenOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const tokensNode = $createTokenNode(option);
        if (nodeToReplace) {
          nodeToReplace.replace(tokensNode);
        }
        tokensNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMatch = useCallback(
    (text: string) => checkForTokenTrigger(text),
    [editor],
  );
  return (
    <LexicalTypeaheadMenuPlugin<TokenOption>
      onQueryChange={setNeedle}
      onSelectOption={onSelectOption}
      triggerFn={checkForMatch}
      options={filteredOptions}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp },
      ) =>
        anchorElementRef.current && filteredOptions.length
          ? ReactDOM.createPortal(
              <StyledTypeaheadMenu>
                {/* Nothing here may take focus, or it competes with
                 LexicalTypeaheadMenuPlugin's own keyboard handling. That rules
                 out a focus-managed menu, so results are capped at 5. */}
                {filteredOptions.slice(0, 5).map((option, i) => (
                  <SimpleMenuItem
                    selected={selectedIndex === i}
                    key={i}
                    onClick={() => selectOptionAndCleanUp(option)}
                  >
                    {option.label}
                  </SimpleMenuItem>
                ))}
              </StyledTypeaheadMenu>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
};
