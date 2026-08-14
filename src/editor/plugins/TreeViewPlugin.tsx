/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView } from '@lexical/react/LexicalTreeView';
import * as React from 'react';

const StyledPre = ({ children }: { children: React.ReactNode }) => (
  <pre className="w-[75vw] overflow-scroll bg-slate-900 p-4 text-slate-100 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:border-transparent [&_button]:bg-slate-200 [&_button]:text-slate-900 [&_button:hover]:bg-slate-300">
    {children}
  </pre>
);

export const TreeViewPlugin = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold">Debug Mode</h2>
      <StyledPre>
        <TreeView
          viewClassName="tree-view-output"
          treeTypeButtonClassName="debug-treetype-button"
          timeTravelPanelClassName="debug-timetravel-panel"
          timeTravelButtonClassName="debug-timetravel-button"
          timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
          timeTravelPanelButtonClassName="debug-timetravel-panel-button"
          editor={editor}
        />
      </StyledPre>
    </div>
  );
};
