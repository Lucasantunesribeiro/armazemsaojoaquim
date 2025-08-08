'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image as ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])
  
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }
  
  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          executeCommand('bold')
          break
        case 'i':
          e.preventDefault()
          executeCommand('italic')
          break
        case 'u':
          e.preventDefault()
          executeCommand('underline')
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            executeCommand('redo')
          } else {
            executeCommand('undo')
          }
          break
      }
    }
  }
  
  const insertLink = () => {
    const url = prompt('Digite a URL do link:')
    if (url) {
      executeCommand('createLink', url)
    }
  }
  
  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:')
    if (url) {
      executeCommand('insertImage', url)
    }
  }
  
  const formatBlock = (tag: string) => {
    executeCommand('formatBlock', tag)
  }
  
  const toolbarButtons = [
    {
      icon: Undo,
      command: 'undo',
      title: 'Desfazer (Ctrl+Z)'
    },
    {
      icon: Redo,
      command: 'redo',
      title: 'Refazer (Ctrl+Shift+Z)'
    },
    { divider: true },
    {
      icon: Heading1,
      command: () => formatBlock('h1'),
      title: 'Título 1'
    },
    {
      icon: Heading2,
      command: () => formatBlock('h2'),
      title: 'Título 2'
    },
    {
      icon: Heading3,
      command: () => formatBlock('h3'),
      title: 'Título 3'
    },
    { divider: true },
    {
      icon: Bold,
      command: 'bold',
      title: 'Negrito (Ctrl+B)'
    },
    {
      icon: Italic,
      command: 'italic',
      title: 'Itálico (Ctrl+I)'
    },
    {
      icon: Underline,
      command: 'underline',
      title: 'Sublinhado (Ctrl+U)'
    },
    { divider: true },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      title: 'Alinhar à esquerda'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      title: 'Centralizar'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      title: 'Alinhar à direita'
    },
    { divider: true },
    {
      icon: List,
      command: 'insertUnorderedList',
      title: 'Lista com marcadores'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      title: 'Lista numerada'
    },
    { divider: true },
    {
      icon: Quote,
      command: () => formatBlock('blockquote'),
      title: 'Citação'
    },
    {
      icon: Code,
      command: () => formatBlock('pre'),
      title: 'Código'
    },
    { divider: true },
    {
      icon: Link,
      command: insertLink,
      title: 'Inserir link'
    },
    {
      icon: ImageIcon,
      command: insertImage,
      title: 'Inserir imagem'
    }
  ]
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((button, index) => {
            if ('divider' in button) {
              return (
                <div
                  key={index}
                  className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
                />
              )
            }
            
            const Icon = button.icon
            const handleClick = typeof button.command === 'string' 
              ? () => executeCommand(button.command as string)
              : button.command
            
            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClick}
                title={button.title}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </div>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`
          min-h-[300px] p-4 outline-none
          prose prose-sm max-w-none
          dark:prose-invert
          prose-headings:font-semibold
          prose-h1:text-2xl prose-h1:mb-4
          prose-h2:text-xl prose-h2:mb-3
          prose-h3:text-lg prose-h3:mb-2
          prose-p:mb-3
          prose-ul:mb-3 prose-ol:mb-3
          prose-li:mb-1
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
          prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded prose-pre:overflow-x-auto
          prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
          prose-img:rounded prose-img:shadow-md
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          dark:prose-blockquote:border-gray-600
          dark:prose-pre:bg-gray-800
          dark:prose-code:bg-gray-800
          focus:outline-none
          ${!value && !isEditorFocused ? 'text-gray-500 dark:text-gray-400' : ''}
        `}
        onInput={updateContent}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
        style={{
          minHeight: '300px'
        }}
      />
      
      {/* Placeholder */}
      {!value && !isEditorFocused && (
        <div 
          className="absolute top-[60px] left-4 text-gray-500 dark:text-gray-400 pointer-events-none"
          style={{ top: '60px' }}
        >
          {placeholder}
        </div>
      )}
      
      {/* Character count */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {value.replace(/<[^>]*>/g, '').length} caracteres
      </div>
    </Card>
  )
}