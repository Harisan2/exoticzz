'use client'

import { useState } from 'react'

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const isVideo = uploadedUrl ? /\.(mp4|webm|mov|m4v|ogg)$/i.test(uploadedUrl) : false
  const isImage = uploadedUrl
    ? /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i.test(uploadedUrl)
    : false

  async function handleUpload() {
    if (!file) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const text = await response.text()
      let data: { error?: string; url?: string } = {}

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(data.error || text || 'Upload failed')
      }

      if (!data.url) {
        throw new Error('Upload URL ontbreekt')
      }

      setUploadedUrl(data.url)
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Upload mislukt')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        type="file"
        accept="*/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload} disabled={!file || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload to Supabase'}
      </button>

      {uploadedUrl && (
        <div style={{ marginTop: 16 }}>
          <div style={{ wordBreak: 'break-all' }}>{uploadedUrl}</div>

          {isVideo ? (
            <video
              src={uploadedUrl}
              controls
              playsInline
              style={{ width: 240, marginTop: 12, borderRadius: 12, background: '#000' }}
            />
          ) : isImage ? (
            <img
              src={uploadedUrl}
              alt="Uploaded preview"
              style={{ width: 200, marginTop: 12, borderRadius: 12 }}
            />
          ) : (
            <a href={uploadedUrl} target="_blank" rel="noreferrer">
              Open uploaded file
            </a>
          )}
        </div>
      )}
    </div>
  )
}
