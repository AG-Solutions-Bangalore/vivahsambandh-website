/**
 * @file src/components/ui/ckeditor.tsx
 * CKEditor 4 authoring surface for rich HTML content.
 *
 * CKEditor 4 is a classic script: it mounts over a `<textarea>` and pulls its
 * own skins, languages and plugins from a base path at runtime, so it cannot
 * be bundled. The distribution is served from `/ckeditor/` (see the
 * `ckeditor-assets` Vite plugin) and is fetched the first time an editor is
 * opened — the public pages never pay for it.
 */

import { useEffect, useRef, useState } from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { cn } from 'cn'

declare global {
  interface Window {
    CKEDITOR?: typeof CKEDITOR
  }
}

/** Base path the editor bundle and its resources are served from. */
const CKEDITOR_BASE_PATH = '/ckeditor/'

/** Article typography for the editable area. */
const CONTENTS_CSS = '/ckeditor-contents.css'

let scriptPromise: Promise<void> | null = null

/** Loads the CKEditor 4 bundle once per page session. */
function loadCkeditor(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.CKEDITOR) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  window.CKEDITOR_BASEPATH = CKEDITOR_BASE_PATH

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${CKEDITOR_BASE_PATH}ckeditor.js`
    script.async = false
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('The rich text editor could not be loaded.'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Toolbar for article bodies.
 *
 * Rows are nested arrays — CKEditor 4.22 ignores the flat `['Bold', 'Italic']`
 * form and renders an empty toolbar. Only items whose plugin ships with the
 * distribution are listed; `EXTRA_PLUGINS` pulls in the ones that live in
 * their own file under `/ckeditor/plugins`.
 */
const TOOLBAR: string[][] = [
  ['Source', '-', 'Undo', 'Redo'],
  ['Cut', 'Copy', 'Paste', 'PasteText'],
  ['Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript'],
  ['NumberedList', 'BulletedList', 'Outdent', 'Indent', '-', 'Blockquote'],
  ['Link', 'Unlink', 'Anchor', '-', 'Image', 'Table'],
  ['Styles', 'Format', '-', 'Font', 'FontSize', 'TextColor', 'BGColor'],
  [
    'JustifyLeft',
    'JustifyCenter',
    'JustifyRight',
    'JustifyBlock',
    '-',
    'RemoveFormat',
    'ShowBlocks',
  ],
]

/**
 * Plugins CKEditor loads on demand from `/ckeditor/plugins`. Every name here
 * must have a matching file — a missing one aborts the whole plugin load and
 * leaves the toolbar empty.
 *
 * `image2` is deliberately left out: it replaces the bundled `image` plugin
 * and logs a plugin-conflict warning on every load.
 */
const EXTRA_PLUGINS =
  'font,colordialog,colorbutton,showblocks,justify,smiley,pagebreak,iframe,codesnippet,preview'

/**
 * `versionCheck` landed in CKEditor 4.12; the published type definitions
 * stop at 4.9, so the option is added back explicitly.
 */
type EditorConfig = CKEDITOR.config & { versionCheck?: boolean }

export interface RichTextEditorProps {
  /** Id of the backing textarea — must be unique on the page. */
  id: string
  /** Current HTML. */
  value: string
  /** Called with the editor HTML whenever it changes. */
  onChange: (html: string) => void
  placeholder?: string
  /** Editing area height in pixels. */
  height?: number
  className?: string
  ariaLabel?: string
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  height = 340,
  className,
  ariaLabel,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<CKEDITOR.editor | null>(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  // Keep the latest callback reachable from the editor listener without
  // re-creating the editor on every parent render.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    let cancelled = false
    let instance: CKEDITOR.editor | null = null

    loadCkeditor()
      .then(() => {
        if (cancelled) return

        const ckeditor = window.CKEDITOR
        const textarea = textareaRef.current
        if (!ckeditor || !textarea) return

        const editorConfig: EditorConfig = {
          language: 'en',
          height,
          enterMode: CKEDITOR.ENTER_P,
          shiftEnterMode: CKEDITOR.ENTER_BR,
          toolbar: TOOLBAR,
          extraPlugins: EXTRA_PLUGINS,
          // The bundled default config strips underline, subscript and
          // superscript; articles want all three.
          removeButtons: '',
          contentsCss: CONTENTS_CSS,
          contentsLangDirection: 'ltr',
          autoUpdateElement: false,
          versionCheck: false,
          resize_enabled: true,
          removePlugins: 'elementspath',
          uiColor: '#fffbf2',
        }

        instance = ckeditor.replace(textarea, editorConfig)

        editorRef.current = instance

        instance.on('instanceReady', () => {
          if (cancelled) return
          instance?.setData(valueRef.current)
          setStatus('ready')
        })

        instance.on('change', () => {
          const html = instance?.getData() ?? ''
          if (html === valueRef.current) return
          valueRef.current = html
          onChangeRef.current(html)
        })
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      editorRef.current = null
      instance?.destroy(true)
    }
  }, [height])

  // Push external value changes into the editor (record loaded, form reset).
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || editor.status !== 'ready') return
    if (editor.getData() === value) return

    valueRef.current = value
    editor.setData(value)
  }, [value])

  return (
    <div className={cn('relative', className)}>
      {status === 'error' ? (
        <p className="mb-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.7rem] leading-relaxed text-amber-900">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            The rich text editor could not be loaded. The field below still accepts
            raw HTML.
          </span>
        </p>
      ) : null}

      <textarea
        ref={textareaRef}
        id={id}
        defaultValue={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="min-h-32 w-full rounded-xl border border-cream-300 bg-cream-50/70 px-3 py-2 text-xs leading-relaxed text-navy-900 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none"
      />

      {status === 'loading' ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-cream-50/80 backdrop-blur-[1px]">
          <span className="flex items-center gap-2 text-[0.7rem] font-semibold text-ink-500">
            <Loader2 className="size-4 animate-spin text-gold-600" aria-hidden />
            Loading the editor…
          </span>
        </div>
      ) : null}
    </div>
  )
}
