import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  UNORDERED_LIST,
} from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

export const MarkdownPlugin = () => {
  return (
    <MarkdownShortcutPlugin
      transformers={[
        BOLD_ITALIC_STAR,
        BOLD_ITALIC_UNDERSCORE,
        BOLD_STAR,
        BOLD_UNDERSCORE,
        HEADING,
        ITALIC_STAR,
        ITALIC_UNDERSCORE,
        LINK,
        ORDERED_LIST,
        UNORDERED_LIST,
      ]}
    />
  );
};
