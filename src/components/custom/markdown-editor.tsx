'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = '마크다운으로 내용을 작성하세요...', 
  height = 400 
}: MarkdownEditorProps) {
  const [editorValue, setEditorValue] = useState(value)

  const handleChange = (val?: string) => {
    const newValue = val || ''
    setEditorValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="markdown-editor-wrapper">
      <MDEditor
        value={editorValue}
        onChange={handleChange}
        height={height}
        data-color-mode="light"
        preview="edit"
        hideToolbar={false}
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          },
        }}
      />
      
      <style jsx global>{`
        .markdown-editor-wrapper .w-md-editor {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }
        
        .markdown-editor-wrapper .w-md-editor.w-md-editor-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .markdown-editor-wrapper .w-md-editor-text-container {
          font-size: 14px !important;
        }
        
        .markdown-editor-wrapper .w-md-editor-text {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
          line-height: 1.6 !important;
        }
        
        .markdown-editor-wrapper .w-md-editor-toolbar {
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .markdown-editor-wrapper .w-md-editor-toolbar-divider {
          background-color: #e5e7eb;
        }
        
        .markdown-editor-wrapper .w-md-editor-toolbar ul > li button {
          color: #374151;
        }
        
        .markdown-editor-wrapper .w-md-editor-toolbar ul > li button:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  )
}