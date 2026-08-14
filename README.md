# Lexical POC

A standalone Vite playground for a rich-text email editor built on
[Lexical](https://lexical.dev), so the editor can be worked on without running a
host application.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
```

## What the editor supports

Nodes registered in `src/editor/index.tsx`:

| Node | Type | How it's reached |
| --- | --- | --- |
| Paragraph | `paragraph` | default |
| Heading | `heading` (h1–h6) | format dropdown, `#` markdown |
| List / ListItem | `list`, `listitem` | ordered + unordered, `-`/`1.` markdown, tab to indent |
| Link | `link` | insert dropdown, floating link editor |
| AutoLink | `autolink` | applied automatically as you type or paste |
| HorizontalRule | `horizontalrule` | registered but unreachable — no plugin or toolbar entry |
| Image | `image` | insert dropdown, drag/drop, paste |
| Button | `button` | insert dropdown |
| Token | `token` | type `{{` for the merge-tag typeahead |

Text formatting (bold, italic, underline, colors, alignment, font, size) comes
from the toolbar in `src/editor/plugins/Toolbar`.

## Layout

```
src/
  editor/          the editor itself
    lib/           types, tokens, and the host-swappable shims (see below)
    hooks/         small shared hooks
    nodes/         the custom Image, Button, and Token nodes
    plugins/       toolbar, image, button, token, link, markdown plugins
    editor.css     styles for the node class names in theme.ts
    icons.tsx      toolbar icon names mapped onto Lucide
  components/ui/   shadcn components (Base UI + Tailwind)
  index.css        Tailwind entry and theme tokens
  App.tsx          playground shell: toggles, editor, serialized state
```

## UI stack

**shadcn/ui** (Base UI primitives + Tailwind v4) and **Lucide** icons — both
open source, no proprietary assets.

Two dropdown groups deliberately do **not** use a portalled popover. The toolbar
dropdowns and `ToolbarSelect` use `useCloseOnClickOutside` plus an absolutely
positioned panel, because an overlay that traps focus steals Lexical's
selection.

`src/editor/editor.css` carries the styles for the class names in `theme.ts`,
which Lexical stamps onto the nodes it renders. Tailwind's preflight resets
heading and list defaults, so they are declared explicitly there.

Note that shadcn's generated components target React 19, where `ref` is a plain
prop. This project is on React 18, so `src/components/ui/input.tsx` is wrapped
in `forwardRef` — without it, `react-hook-form`'s `register()` ref is dropped
and the image, button, and link forms silently stop tracking their fields.

## Host integration points

Everything a host application would own lives in `src/editor/lib` and is stubbed
for the playground. Swap these out to embed the editor for real:

| Module | What it does here | What a host would do |
| --- | --- | --- |
| `lib/useImageUpload.ts` | turns the file into an object URL; **images do not survive a reload** | upload to storage and return the URL |
| `lib/snackbar.tsx` | sonner toasts | wire to the host's notification system |
| `lib/tokens.ts` | seven sample merge tags | supply the real token set via the `availableTokens` prop |
| `lib/types.ts` | serialized node shapes and `MailableFormat` | keep in sync — these define the saved document format |
| `lib/styles.ts`, `lib/constants.ts` | rendered-document styles and page width | match the real rendering target |

The settings and merge-tag chrome that normally sits around an editor like this
is not included; the playground is the editor surface only.

Dependency versions are pinned (`lexical` 0.12.2, `react-hook-form` 7.43.9,
`@react-hookz/web` 22.0.0) — `lexical` in particular, because `0.12.6` removes
`DEPRECATED_$isGridSelection` and changes the selection types the toolbar
depends on.
