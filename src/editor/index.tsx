import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode } from '@lexical/rich-text';
import type {
  EditorState,
  LexicalEditor,
  SerializedEditorState,
} from 'lexical';
import { $createParagraphNode, $getRoot } from 'lexical';
import { useSnackbar } from './lib/snackbar';
import { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';

import { cn } from '@/lib/utils';

import { TokenConfig } from './lib/tokens';
import { MailableFormat } from './lib/types';

import ButtonNode from './nodes/ButtonNode';
import { ImageNode } from './nodes/ImageNode';
import { TokensNode } from './nodes/TokensNode';
import { AutoLinkPlugin } from './plugins/AutoLinkPlugin';
import ButtonPlugin from './plugins/ButtonPlugin';
import { FloatingLinkEditorPlugin } from './plugins/FloatingLinkEditorPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { LinkPlugin } from './plugins/LinkPlugin';
import { MarkdownPlugin } from './plugins/MarkdownPlugin';
import { TokensPlugin } from './plugins/TokensPlugin';
import { Toolbar } from './plugins/Toolbar';
import { TreeViewPlugin } from './plugins/TreeViewPlugin';
import { defaultTheme } from './theme';

export enum LogoPositionLabels {
  HIDDEN = 'No logo',
  LEFT = 'Align left',
  CENTER = 'Align center',
  RIGHT = 'Align right',
}

export type LogoPosition = keyof typeof LogoPositionLabels;

export interface EditorSettings {
  logoPosition: LogoPosition;
  backgroundColor: string;
  format: MailableFormat;
}

export type TextEditorProps = {
  /** Lexical namespace */
  namespace: string;
  /** if debug is true, render tree view (shows internal state) */
  debug?: boolean;
  /** component to display before any content exists */
  /* eslint-disable @typescript-eslint/ban-types */
  placeholder?: JSX.Element;
  /** in composer full :: default, richText is used for footer & Rich text mode */
  format?: MailableFormat;
  /** called by OnChangePlugin when state changes */
  onChange?: (editorState: EditorState) => void;
  /** for saved content, this should be the stringified editorState */
  defaultValue?: SerializedEditorState | null;
  /** if readOnly editing is disabled */
  readOnly?: boolean;
  /** tokens available for insertion */
  availableTokens?: TokenConfig[];
  /** the zoom level of the content contained within as a percentage */
  zoom?: number;
};

const StyledEditableWrapper = forwardRef<
  HTMLDivElement,
  { children: ReactNode }
>(({ children }, ref) => (
  <div ref={ref} className="relative">
    {children}
  </div>
));
StyledEditableWrapper.displayName = 'StyledEditableWrapper';

const StyledContentEditable = ({
  readOnly,
  zoom,
}: {
  readOnly: boolean;
  zoom?: number;
}) => (
  <ContentEditable
    style={typeof zoom === 'number' ? { zoom: `${zoom}%` } : undefined}
    className={cn(
      'px-12 py-8 focus-visible:outline-none',
      readOnly ? 'min-h-8' : 'min-h-100',
      // Required to ensure sub lists are rendered w/o multiple bullets
      '[&_.editor-nested-listitem]:list-none',
      // Required to display underlined text in editor
      '[&_.editor-textUnderline]:underline',
    )}
  />
);

const EditorWrapper = ({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: ReactNode;
}) => (
  <div className={cn('rounded-b-lg', !readOnly && 'border border-input')}>
    {children}
  </div>
);

const ToolbarWrapper = ({ children }: { children: ReactNode }) => (
  <div className="rounded-t-lg border border-b-0 border-input">{children}</div>
);

const PlaceholderWrapper = ({ children }: { children: ReactNode }) => (
  <div className="pointer-events-none absolute top-0 flex h-full w-full items-center justify-center">
    {children}
  </div>
);

export type TextEditorRef = {
  getEditor: () => LexicalEditor | null;
};

/* eslint-disable-next-line react/display-name */
export const TextEditorContextProvider = forwardRef<
  TextEditorRef,
  {
    /* eslint-disable @typescript-eslint/ban-types */
    children: JSX.Element | string | (JSX.Element | string)[];
  } & TextEditorProps
>(
  (
    {
      namespace,
      onChange,
      debug,
      defaultValue,
      readOnly = false,
      children,
      availableTokens = [],
    },
    ref,
  ) => {
    const { sendErrorAlert } = useSnackbar();
    const onError = (error: Error) => {
      sendErrorAlert('Sorry, something went wrong with our editor.');
      console.error(error);
    };
    const editorRef = useRef<LexicalEditor | null>(null);

    const initialConfig: InitialConfigType = {
      namespace,
      theme: defaultTheme,
      editable: !readOnly,
      onError,
      /**
       * I attempted to conditionally add nodes based on format, but Lexical
       * started throwing errors. Since we are conditionally rendering the plugins
       * there shouldn't be any concerns about Lexical knowing about unused node
       * types.
       */
      nodes: [
        AutoLinkNode,
        ButtonNode,
        HeadingNode,
        HorizontalRuleNode,
        ImageNode,
        LinkNode,
        ListItemNode,
        ListNode,
        TokensNode,
      ],
      // We borrow several elements from Lexical's internal initializeEditor method.
      // See: https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/LexicalComposer.tsx#L115
      editorState: (editor: LexicalEditor) => {
        editorRef.current = editor;
        if (defaultValue) {
          if ('blocks' in defaultValue) {
            sendErrorAlert('Attempted to load EditorJS content');
            console.log(defaultValue);
            return;
          }

          try {
            const editorState = editor.parseEditorState(defaultValue);
            editor.setEditorState(editorState);
          } catch (error) {
            if (error instanceof Error) onError(error);
          }
          return;
        }

        // If defaultValue isn't specified start editor with empty Paragraph node
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      },
    };

    useImperativeHandle(ref, () => ({
      getEditor() {
        return editorRef.current;
      },
    }));

    const handleChange = (editorState: EditorState) => {
      if (onChange) onChange(editorState);
      if (debug) console.log(editorState.toJSON());
    };

    return (
      <LexicalErrorBoundary onError={onError}>
        <LexicalComposer initialConfig={initialConfig}>
          <ListPlugin />
          <ImagePlugin />
          <TabIndentationPlugin />
          <MarkdownPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <TokensPlugin tokens={availableTokens} />
          <ButtonPlugin />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <>{children}</>
        </LexicalComposer>
      </LexicalErrorBoundary>
    );
  },
);

export const TextEditorContents = (props: TextEditorProps) => {
  const floatingAnchorElem = useRef<HTMLDivElement | null>(null);

  const { readOnly = false, placeholder, zoom } = props;

  return (
    <>
      <>
        {floatingAnchorElem.current instanceof HTMLDivElement && (
          <>
            <FloatingLinkEditorPlugin anchorEl={floatingAnchorElem.current} />
            {/* Todo: fix draggable plugin */}
            {/*<DraggableBlockPlugin anchorElem={floatingAnchorElem.current} />*/}
          </>
        )}
      </>
      <StyledEditableWrapper ref={floatingAnchorElem}>
        <RichTextPlugin
          contentEditable={
            <StyledContentEditable readOnly={readOnly} zoom={zoom} />
          }
          placeholder={<PlaceholderWrapper>{placeholder}</PlaceholderWrapper>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </StyledEditableWrapper>
    </>
  );
};

/* eslint-disable-next-line react/display-name */
const TextEditor = forwardRef<TextEditorRef, TextEditorProps>((props, ref) => {
  const { debug, format, readOnly = false } = props;

  return (
    <TextEditorContextProvider ref={ref} {...props}>
      <>
        {!readOnly && (
          <ToolbarWrapper>
            <Toolbar format={format} tokens={props.availableTokens ?? []} />
          </ToolbarWrapper>
        )}
      </>
      <EditorWrapper readOnly={readOnly}>
        <TextEditorContents {...props} />
      </EditorWrapper>
      <>{!!debug && <TreeViewPlugin />}</>
    </TextEditorContextProvider>
  );
});

export const TextEditorToolbar = Toolbar;

export default TextEditor;
