'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { lowlight } from 'lowlight'
import { useState, useCallback, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Type,
  Eye,
  Save,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X
} from 'lucide-react'

// Configure lowlight with common languages
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'

lowlight.registerLanguage('js', javascript)
lowlight.registerLanguage('javascript', javascript)
lowlight.registerLanguage('ts', typescript)
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('html', html)
lowlight.registerLanguage('xml', html)
lowlight.registerLanguage('php', php)
lowlight.registerLanguage('python', python)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string>
  className?: string
  minHeight?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever seu artigo...",
  onImageUpload,
  className = "",
  minHeight = "500px"
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'blog-code-block',
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[' + minHeight + '] p-6',
      },
    },
  })

  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload || !editor) return

    setUploadingImage(true)
    try {
      const imageUrl = await onImageUpload(file)
      editor.chain().focus().setImage({ src: imageUrl }).run()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }, [editor, onImageUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
    // Reset input
    e.target.value = ''
  }, [handleImageUpload])

  const addLink = useCallback(() => {
    if (!editor) return
    
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor) return
    
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageDialog(false)
    }
  }, [editor, imageUrl])

  const addYoutube = useCallback(() => {
    if (!editor) return
    
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
      setYoutubeUrl('')
      setShowYoutubeDialog(false)
    }
  }, [editor, youtubeUrl])

  const insertTable = useCallback(() => {
    if (!editor) return
    
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-900 dark:hover:text-gray-200'}`}
    >
      {children}
    </button>
  )

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-1">
          {/* Basic formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Itálico"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Riscado"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Código Inline"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <select
              value={
                editor.isActive('heading', { level: 1 }) ? 'h1' :
                editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' :
                editor.isActive('heading', { level: 4 }) ? 'h4' :
                editor.isActive('heading', { level: 5 }) ? 'h5' :
                editor.isActive('heading', { level: 6 }) ? 'h6' :
                'p'
              }
              onChange={(e) => {
                const value = e.target.value
                if (value === 'p') {
                  editor.chain().focus().setParagraph().run()
                } else {
                  const level = parseInt(value.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6
                  editor.chain().focus().toggleHeading({ level }).run()
                }
              }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="p">Parágrafo</option>
              <option value="h1">Título 1</option>
              <option value="h2">Título 2</option>
              <option value="h3">Título 3</option>
              <option value="h4">Título 4</option>
              <option value="h5">Título 5</option>
              <option value="h6">Título 6</option>
            </select>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Lista com Marcadores"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Lista Numerada"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Quote & Code Block */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Citação"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Bloco de Código"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => setShowLinkDialog(true)}
              title="Inserir Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => setShowImageDialog(true)}
              title="Inserir Imagem"
            >
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>

            {onImageUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ToolbarButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  title="Upload de Imagem"
                >
                  <Upload className="w-4 h-4" />
                </ToolbarButton>
              </>
            )}
            
            <ToolbarButton
              onClick={() => setShowYoutubeDialog(true)}
              title="Inserir Vídeo do YouTube"
            >
              <YoutubeIcon className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={insertTable}
              title="Inserir Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Preview Toggle */}
          <ToolbarButton
            onClick={() => setIsPreview(!isPreview)}
            isActive={isPreview}
            title="Visualizar"
          >
            <Eye className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isPreview ? (
          <div 
            className="prose prose-lg max-w-none p-6 min-h-[500px] bg-white dark:bg-gray-800 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <EditorContent 
            editor={editor}
            className="bg-white dark:bg-gray-800 dark:text-white"
          />
        )}

        {uploadingImage && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fazendo upload da imagem...</p>
            </div>
          </div>
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Inserir Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Inserir Imagem</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Dialog */}
      {showYoutubeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Inserir Vídeo do YouTube</h3>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowYoutubeDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={addYoutube}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}