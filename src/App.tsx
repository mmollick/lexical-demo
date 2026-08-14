import type { EditorState } from 'lexical';
import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import TextEditor from './editor';
import { SnackbarProvider } from './editor/lib/snackbar';
import { sampleTokens } from './editor/lib/tokens';
import { MailableFormat } from './editor/lib/types';

const App = () => {
  const [debug, setDebug] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [json, setJson] = useState<string>('');

  const handleChange = (editorState: EditorState) =>
    setJson(JSON.stringify(editorState.toJSON(), null, 2));

  return (
    <SnackbarProvider>
      <div className="mx-auto max-w-5xl space-y-4 p-8">
        <h1 className="text-3xl font-semibold">Lexical POC</h1>

        <div className="flex flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch id="debug" checked={debug} onCheckedChange={setDebug} />
            <Label htmlFor="debug">Tree view</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="readOnly"
              checked={readOnly}
              onCheckedChange={setReadOnly}
            />
            <Label htmlFor="readOnly">Read only</Label>
          </div>
        </div>

        <TextEditor
          namespace="lexical-poc"
          format={MailableFormat.TEMPLATE}
          availableTokens={sampleTokens}
          placeholder={<span>Start typing…</span>}
          onChange={handleChange}
          debug={debug}
          readOnly={readOnly}
        />

        <h2 className="text-xl font-semibold">Serialized state</h2>
        <pre className="max-h-80 overflow-auto rounded-md bg-muted p-4 text-xs">
          {json}
        </pre>
      </div>
    </SnackbarProvider>
  );
};

export default App;
