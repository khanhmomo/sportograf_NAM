'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
}

export default function ImageUpload({ value, onChange, placeholder = 'Upload screenshot' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadImage(file)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            await uploadImage(file)
            break
          }
        }
      }
    }
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64data,
            folder: 'flight-screenshots',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          onChange(data.url)
        } else {
          console.error('Upload failed')
        }
        setIsUploading(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="relative">
      {!value ? (
        <div
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading ? (
            <div className="text-sm text-gray-500">Uploading...</div>
          ) : (
            <>
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400 mt-1">Click or paste image (Cmd+V)</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          <img
            src={value}
            alt="Screenshot"
            className="w-full h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
