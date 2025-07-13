'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  onAltTextChange?: (altText: string) => void
  altText?: string
  className?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  onAltTextChange, 
  altText = '', 
  className = '' 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onChange(result.imageUrl)
        if (onAltTextChange && !altText) {
          onAltTextChange(`업로드된 이미지: ${file.name}`)
        }
      } else {
        setError(result.error || '업로드에 실패했습니다.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (imageFile) {
      handleFileUpload(imageFile)
    } else {
      setError('이미지 파일만 업로드할 수 있습니다.')
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setError(null)
    }
  }

  const removeImage = () => {
    onChange('')
    if (onAltTextChange) {
      onAltTextChange('')
    }
    setUrlInput('')
    setError(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 모드 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`px-3 py-1 text-sm rounded-md ${
            uploadMode === 'upload'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
        >
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-3 py-1 text-sm rounded-md ${
            uploadMode === 'url'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
        >
          URL 입력
        </button>
      </div>

      {/* 현재 이미지 미리보기 */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
            <Image
              src={value}
              alt={altText || '미리보기 이미지'}
              fill
              className="object-contain"
              onError={() => setError('이미지를 불러올 수 없습니다.')}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {uploadMode === 'upload' ? (
        /* 파일 업로드 영역 */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF, WebP (최대 5MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        /* URL 입력 영역 */
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 대체 텍스트 입력 */}
      {value && onAltTextChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이미지 대체 텍스트
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="이미지에 대한 설명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  )
}